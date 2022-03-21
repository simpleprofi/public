import {IBarchart} from '../view/barchart';
import {Composition} from '../model/composition';

export class CompositionBarchart {
  private view: IBarchart;
  private model: Composition;

  constructor(view: IBarchart, model: Composition) {
    this.view = view;
    this.model = model;
  }
}
