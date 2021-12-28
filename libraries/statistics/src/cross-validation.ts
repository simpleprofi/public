import * as stat from 'simple-statistics';
const jStat = require('jstat');

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
  const scoresRaw = new Array(nItems).fill(0).map(() => new Array(nRepeats).fill(0));
  const m = typeof measure === 'function' ? measure : MeasuresMap[measure];
  const _sum = (a: number, b: number) => a + b;

  const _measure = async () => {
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
      _setColumn(X, i, stat.shuffle(selF));
      decreases[j] += await _measure();
      scoresRaw[i][j] = decreases[j];

      if (progress) {
        progress.update((i * nRepeats + j) * 100 / nRepeats / nItems, '');
      }
    }
    _setColumn(X, i, selF);
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
  return stat.shuffle(items);
}

/**
 * Calculates confidence intervals for predicted samples.
 *
 * @param {number[]} x Feature population.
 * @param {number[]} y Target variable.
 * @param {number} [p=0.95] Confidence.
 * @link {https://www.real-statistics.com/regression/confidence-and-prediction-intervals/}.
 * @return {{lower: number[], upper: number[]}} Lower & upper bounds of the interval.
 */

/**
 * Calculates confidence intervals for predicted samples.
 *
 * @link {https://www.real-statistics.com/regression/confidence-and-prediction-intervals/}.
 * @param {number[]} x Feature population.
 * @param {number[]} y Target variable.
 * @param {number} [p=0.95] Confidence.
 * @param {('CI' | 'PI')} method Confidence or prediction interval.
 * @return {{lower: number[], upper: number[]}} Lower & upper bounds of the interval.
 */
function confIntervalLinear(
  x: number[],
  y: number[],
  p: number,
  method: 'CI' | 'PI',
): {lower: number[], upper: number[]} {
  const nItems = x.length;
  const df = nItems - 2;
  const xMean = stat.mean(x);
  const model = stat.linearRegression(x.map((v, i) => [v, y[i]]));
  const f = stat.linearRegressionLine(model);
  const R2 = stat.sampleCorrelation(x, y) ** 2;
  const syn = nItems * stat.variance(y);
  const steyx = Math.sqrt(1. / df * syn * (1 - R2));
  const devsq = nItems * stat.variance(x);
  const tCrit = jStat.studentt.inv(p + (1 - p) / 2, df);

  const seCI = (v: number) => steyx * Math.sqrt(1. / nItems + (v - xMean) ** 2 / devsq);
  const sePI = (v: number) => steyx * Math.sqrt(1 + 1. / nItems + (v - xMean) ** 2 / devsq);
  const se = method == 'CI' ? seCI : sePI;
  const _bound = (v: number, sign: -1 | 1) => f(v) + sign * tCrit * se(v);
  const _lBound = (v: number) => _bound(v, -1);
  const _uBound = (v: number) => _bound(v, 1);

  const lower = x.map(_lBound);
  const upper = x.map(_uBound);
  return {lower: lower, upper: upper};
}

export function getCIColors(x: number[], y: number[], p = 0.95, method: 'CI' | 'PI' = 'CI'): number[] {
  const {lower: lower, upper: upper} = confIntervalLinear(x, y, p, method);

  console.log(lower);
  console.log(x);
  console.log(y);
  console.log(upper);

  const colors = y.map((v, i) => lower[i] <= v && v <= upper[i] ? 0 : 1);
  const nOutside = stat.sum(colors);
  const nInside = y.length - nOutside;

  /*if (nOutside > nInside) {
    throw new Error(`Number of predictions outside (${nOutside}) CI is greater than that of inside (${nInside}).`);
  }*/
  console.log([nInside, nOutside]);
  return colors;
}

function _percentileRange(x: number[], alpha: number = 0.05): [number, number] {
  const lower = stat.quantile(x, alpha);
  const upper = stat.quantile(x, 1 - alpha);
  return [lower, upper];
}

function _percentileScore(x: number[], alpha = 0.05): number {
  const [lower, upper] = _percentileRange(x, alpha);
  return x.reduce((a: number, v: number) => a + (lower <= v && v <= upper ? 0 : 1), 0);
}

/**
 * Calculates scores series for every feature column given.
 *
 * Score for a feature column is a number of samples beyond the percentile interval.
 *
 * @export
 * @param {number[]} X Columns.
 * @param {number} [alpha=0.05] Percentile threshold.
 * @return {number[]} Scores.
 */
export function percentileScores(X: number[][], alpha = 0.05): number[] {
  const nFeatures = X.length;
  const scores = new Array(nFeatures);

  for (let i = 0; i < nFeatures; ++i) {
    scores[i] = _percentileScore(X[i], alpha);
  }

  return scores;
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

    if (stat.standardDeviation(nsItems) > 0) {
      throw new Error('Arrays must have the same lenghts.');
    }

    const nItems = nsItems[0];
    const index = stat.shuffleInPlace(new Array(nItems).fill(0).map((_, i) => i));
    const nTrain = Math.round(nItems * (1 - this.testRatio));

    return items.map(function(item) {
      const permuted = _apply(item, index);
      return [permuted.slice(0, nTrain), permuted.slice(nTrain)];
    });
  }
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

