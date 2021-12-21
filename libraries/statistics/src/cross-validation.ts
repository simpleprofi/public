/**
 * Splits samples into training and test sets.
 *
 * @export
 * @class ShuffleSplit
 * @example const cv = new ShuffleSplit();
 * cv.split([1, 2, 3], [4, 5, 6]); // [[[2, 1], [3]], [[5, 4], [6]]]
 */
export class ShuffleSplit {
  protected testRatio;

  constructor(testRatio = 0.3) {
    this.testRatio = testRatio;
  }

  protected _genPermutation(n: number): number[] {
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

  public split(...items: any[][]): any[][][] {
    const nsItems = items.map((v: any[]) => v.length);

    if (_std(nsItems) > 0) {
      throw new Error('Arrays must have the same lenghts.');
    }

    const nItems = nsItems[0];
    const index = this._genPermutation(nItems);
    const nTrain = Math.round(nItems * (1 - this.testRatio));

    return items.map(function(item) {
      const permuted = _apply(item, index);
      return [permuted.slice(0, nTrain), permuted.slice(nTrain)];
    });
  }
}

function _std(array: number[]) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function _apply(items: any[], index: number[]): any[] {
  return items.map((_, i) => items[index[i]]);
}

type Measure = (a: any, b: any) => number;

interface Estimator {
  fit(X: any[][], y: any[]): void;
  predict(X: any[][]): any[];
}

export function bootstrap(X: number[][], y: number[], estimator: Estimator, measure: Measure, nRepeats: number = 100) {
  const cv = new ShuffleSplit();
  const scores = new Array(nRepeats).fill(0);

  for (let i = 0; i < nRepeats; ++i) {
    const [[XTrain, XTest], [yTrain, yTest]] = cv.split(X, y);
    estimator.fit(XTrain, yTrain);
    const yPred = estimator.predict(XTest);
    scores[i] = measure(yTest, yPred);
  }
  return scores;
}

function _AUE(a: number[], b: number[]): number {
  let sum = 0;

  for (let i = 0; i < a.length; ++i) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum / b.length;
}
