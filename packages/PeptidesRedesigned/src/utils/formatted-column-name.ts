export class ZeroPaddedColumnName {
  pad: string;

  constructor(length: number) {
    const exp = Math.floor(Math.log10(length));
    this.pad = new Array(exp + 1).fill('0').join('');
  }

  protected _zeroPad(n: number) {
    return (this.pad + n).slice(-this.pad.length);
  }

  format(indexZeroBased: number): string {
    return this._zeroPad(indexZeroBased + 1);
  }
}
