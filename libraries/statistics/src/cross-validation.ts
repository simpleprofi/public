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
    console.log(items.length);
    const nsItems = items.map((v: any[]) => v.length);
    console.log(nsItems);


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

export function bootstrap(X: number[][], y: number[], nRepeats: number = 100) {

}
