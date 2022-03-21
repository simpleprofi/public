import {Barchart} from './barchart';

export class View {
  private barchart: Barchart;

  constructor() {
    this.barchart = new Barchart();
  }
}
