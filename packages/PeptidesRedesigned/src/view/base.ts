import {Presenter} from '../presenter/base';
import {Barchart} from './barchart';

export class View {
  barchart: Barchart;

  protected presenter: Presenter;

  constructor(presenter: Presenter) {
    this.presenter = presenter;

    this.barchart = new Barchart(this.presenter.compositionBarchart);
  }
}
