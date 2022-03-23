export class FormattedColumnName {
  static _zeroPad(n: number) {
    const exp = Math.floor(Math.log10(n));
    const pad = new Array(exp + 1).fill('0').join();
    return (pad + n).slice(-pad.length);
  }

  static columnName(index: number): string {
    return this._zeroPad(index + 1);
  }
}
