//import {CompositionBarchart} from './composition-barchart';
import {View} from '../view/base';
import {Model} from '../model/base';

export class Presenter {
  private view: View;
  private model: Model;

  constructor(view: View, model: Model) {
    this.view = view;
    this.model = model;
  }
}
