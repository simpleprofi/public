/**
 * Cross-validates an estimator with an error measure.
 *
 * @export
 * @param {any[]} X Input samples of features.
 * @param {any[]} y Target variable.
 * @param {Estimator} estimator The estimator to explore.
 * @param {(KnownMeasures | Measure)} [measure='AUE'] The measure chosen.
 * @param {KnownSplitters} [splitter='shuffle-split'] A splitter to apply.
 * @param {Object} [splitterArgs={}] Splitter optional arguments.
 * @param {number} [nRepeats=100] Number of cycles to run.
 * @return {number[]} Errors measured during the run.
 */
export async function bootstrap(
  X: any[][],
  y: any[],
  estimator: Estimator,
  measure: KnownMeasures | Measure = 'AUE',
  splitter: KnownSplitters = 'shuffle-split',
  splitterArgs: Object = {},
  nRepeats: number = 100,
): Promise<number[]> {
  const cv = new SplitterMap[splitter](...Object.values(splitterArgs));
  const scores = new Array(nRepeats).fill(0);
  const m = typeof measure === 'function' ? measure : MeasuresMap[measure];

  for (let i = 0; i < nRepeats; ++i) {
    const [[XTrain, XTest], [yTrain, yTest]] = cv.split(X, y);
    await estimator.fit(XTrain, yTrain);
    const yPred = await estimator.predict(XTest);
    scores[i] = m(yTest, yPred);
  }
  return scores;
}

/**
 * Splits samples into training and test sets.
 *
 * @export
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
 * Rearranges elements of an array according with an index provided.
 *
 * @param {any[]} items The array.
 * @param {number[]} index The index to take.
 * @return {any[]} Reindexed array.
 */
function _apply(items: any[], index: number[]): any[] {
  return items.map((_, i) => items[index[i]]);
}

/**
 * Declares an estimator which must have both fit and predict methods.
 *
 * @interface Estimator
 */
interface Estimator {
  fit(X: any[][], y: any[]): void;
  predict(X: any[][]): any[];
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
