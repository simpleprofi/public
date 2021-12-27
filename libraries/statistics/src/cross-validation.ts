/**
 * Declares an estimator which must have both fit and predict methods.
 *
 * @export
 * @interface Estimator
 */
export interface Estimator {
  fit(X: any[][], y: any[]): void;
  predict(X: any[][]): any[];
}

export interface Progress {
  update: (percent: number, description: string) => void;
  set description(s: string);
}

type BootstrapOptions = {
  measure?: KnownMeasures | Measure,
  splitter?: KnownSplitters,
  splitterArgs?: Object,
  nRepeats?: number,
  progress?: Progress | undefined,
};

type ImportanceOptions = {
  measure?: KnownMeasures | Measure,
  nRepeats?: number,
  progress?: Progress | undefined,
};

/**
 * Cross-validates an estimator with an error measure.
 *
 * @export
 * @param {any[]} X Input samples of features.
 * @param {any[]} y Target variable.
 * @param {Estimator} estimator The estimator to explore.
 * @param {BootstrapOptions} [options={
 *     measure: 'AUE',            // The measure chosen.
 *     splitter: 'shuffle-split', // A splitter to apply.
 *     splitterArgs: {},          // Splitter optional arguments.
 *     nRepeats: 100,             // Number of cycles to run.
 *     progress: {},              // Optional progress indicator.
 *   }] Bootstrap procedure controlling options.
 * @return {Promise<number[]>} Errors measured during the run.
 */
export async function bootstrap(
  X: any[][],
  y: any[],
  estimator: Estimator,
  options: BootstrapOptions = {},
): Promise<number[]> {
  const {
    measure = 'AUE',
    splitter = 'shuffle-split',
    splitterArgs = {},
    nRepeats = 100,
    progress = undefined,
  } = options;
  const cv = new SplitterMap[splitter](...Object.values(splitterArgs));
  const scores = new Array(nRepeats).fill(0);
  const m = typeof measure === 'function' ? measure : MeasuresMap[measure];

  if (progress) {
    progress.update(0, '');
  }

  for (let i = 0; i < nRepeats; ++i) {
    const [[XTrain, XTest], [yTrain, yTest]] = cv.split(X, y);
    await estimator.fit(XTrain, yTrain);
    const yPred = await estimator.predict(XTest);
    scores[i] = m(yTest, yPred);

    if (progress) {
      progress.update(i * 100 / nRepeats, '');
    }
  }
  return scores;
}

/**
 * Calculates permutation importance for feature evaluation.
 *
 * The permutation importance is defined to be the difference
 * between the baseline metric and metric from permutating
 * the feature column.
 *
 * @export
 * @param {any[]} X The data set used to train the estimator.
 * @param {any[]} y Targets.
 * @param {Estimator} estimator An estimator that is compatible with measure.
 * @param {(KnownMeasures | Measure)} [measure='AUE'] Measure to use.
 * @param {number} [nRepeats=5] Number of times to permute a feature.
 * @return {Promise<number[]>} Mean of feature importance over nRepeats.
 */

/**
 * Calculates permutation importance for feature evaluation.
 *
 * The permutation importance is defined to be the difference
 * between the baseline metric and metric from permutating
 * the feature column.
 *
 * @export
 * @param {any[]} X The data set used to train the estimator.
 * @param {any[]} y Targets.
 * @param {Estimator} estimator An estimator that is compatible with measure.
 * @param {ImportanceOptions} [options={
 *     measure: 'AUE', // The measure chosen.
 *     nRepeats: 5,    // Number of cycles to run.
 *     progress: {},   // Optional progress indicator.
 * }]
 * @return {*}  {Promise<[number[], number[][]]>}
 */
export async function permutationImportance(
  X: any[][],
  y: any[],
  estimator: Estimator,
  options: ImportanceOptions = {},
): Promise<number[][]> {
  const {
    measure = 'AUE',
    nRepeats = 5,
    progress = undefined,
  } = options;

  const nItems = X[0].length;
  //const scores = new Array(nItems).fill(0);
  const scoresRaw = new Array(nItems).fill(0).map(() => new Array(nRepeats).fill(0));
  const m = typeof measure === 'function' ? measure : MeasuresMap[measure];
  const _sum = (a: number, b: number) => a + b;

  const _measure = async () => {
    //await estimator.fit(X, y);
    const yPred = await estimator.predict(X);
    return m(y, yPred);
  };

  const refScores = new Array(nRepeats).fill(0);

  for (let j = 0; j < nRepeats; ++j) {
    refScores[j] = await _measure();
  }

  const refScore = refScores.reduce(_sum, 0) / nRepeats;

  if (progress) {
    progress.update(0, '');
  }

  for (let i = 0; i < nItems; ++i) {
    const selF = _takeColumn(X, i);
    const decreases = new Array(nRepeats).fill(-refScore);

    for (let j = 0; j < nRepeats; ++j) {
      _setColumn(X, i, permuteElements(selF));
      decreases[j] += await _measure();
      scoresRaw[i][j] = decreases[j];

      if (progress) {
        progress.update((i * nRepeats + j) * 100 / nRepeats / nItems, '');
      }
    }
    _setColumn(X, i, selF);
    //scores[i] = decreases.reduce(_sum, 0) / nRepeats;
  }
  return scoresRaw;
}

/**
 * Permutes elements of an array.
 *
 * @export
 * @param {any[]} items The array.
 * @return {any[]} Permuted array.
 */
export function permuteElements(items: any[]): any[] {
  const nItems = items.length;
  const index = _genPermutation(nItems);
  return _apply(items, index);
}

function _takeColumn(X: number[][], index: number): number[] {
  return Array.from(X).map((v) => v[index]);
}

function _setColumn(X: number[][], index: number, value: number[]) {
  for (let i = 0; i < X.length; ++i) {
    X[i][index] = value[i];
  }
}

/**
 * Splits samples into training and test sets.
 *
 * @class ShuffleSplit
 * @example const cv = new ShuffleSplit(0.3);
 * cv.split([1, 2, 3], [4, 5, 6]); // [[[2, 1], [3]], [[5, 4], [6]]]
 */
class ShuffleSplit {
  protected testRatio;

  /**
   * Creates an instance of ShuffleSplit.
   * @param {number} [testRatio=0.3] The ratio between test and training set.
   * @memberof ShuffleSplit
   */
  constructor(testRatio = 0.3) {
    this.testRatio = testRatio;
  }

  /**
   * Splits the arrays provided by training an test set.
   *
   * @param {...any[]} items The arrays to split.
   * @return {any[]} The split.
   * @memberof ShuffleSplit
   */
  public split(...items: any[][]): any[][][] {
    const nsItems = items.map((v: any[]) => v.length);

    if (_std(nsItems) > 0) {
      throw new Error('Arrays must have the same lenghts.');
    }

    const nItems = nsItems[0];
    const index = _genPermutation(nItems);
    const nTrain = Math.round(nItems * (1 - this.testRatio));

    return items.map(function(item) {
      const permuted = _apply(item, index);
      return [permuted.slice(0, nTrain), permuted.slice(nTrain)];
    });
  }
}

/**
 * Computes standard deviation of array elements.
 *
 * @param {number[]} array The array.
 * @return {number} Standard deviation.
 */
function _std(array: number[]): number {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

/**
   * Generates a permutation of indices ranging from 0 to n-1.
   *
   * @protected
   * @param {number} n Length of the permuted index.
   * @return {number[]} The permutation.
   */
function _genPermutation(n: number): number[] {
  const index = new Array(n).fill(0).map((_, i: number) => i);

  for (let i = 0; i < n; ++i) {
    const pos = n - i - 1;
    const spos = Math.round(Math.random() * pos);
    const tmp = index[spos];
    index[spos] = index[pos];
    index[pos] = tmp;
  }
  return index;
}

/**
 * Rearranges elements of an array according with an index provided.
 *
 * @param {any[]} items The array.
 * @param {number[]} index The index to take.
 * @return {any[]} Reindexed array.
 */
function _apply(items: any[], index: number[]): any[] {
  return items.map((_, i) => items[index[i]]);
}

const SplitterMap = {
  'shuffle-split': ShuffleSplit,
};

type Measure = (a: any, b: any) => number;

const MeasuresMap: {[name: string]: Measure} = {
  AUE: _AUE,
};

type KnownSplitters = keyof typeof SplitterMap;
type KnownMeasures = keyof typeof MeasuresMap;

/**
 * Computes an average unsigned error.
 *
 * @param {number[]} a Predicted values.
 * @param {number[]} b True values.
 * @return {number} AUE of the predictions.
 */
function _AUE(a: number[], b: number[]): number {
  let sum = 0;

  for (let i = 0; i < a.length; ++i) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum / b.length;
}

