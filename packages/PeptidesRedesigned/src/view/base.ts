import {Barchart} from './barchart';

export class View {
  barchart: Barchart;

  constructor() {
    this.barchart = new Barchart();
  }
}
