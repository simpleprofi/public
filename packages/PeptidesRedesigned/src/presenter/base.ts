import {CompositionBarchart, External as BarchartExternal} from './composition-barchart';
import {View} from '../view/base';
import {Model} from '../model/base';

interface External extends BarchartExternal {
}

export class Presenter {
  private view: View;
  private model: Model;
  private external: External;

  compositionBarchart: CompositionBarchart;

  constructor(view: View, model: Model, external: External) {
    this.view = view;
    this.model = model;
    this.external = external;

    this.compositionBarchart = new CompositionBarchart(this.view.barchart, this.model.composition, this.external);
  }
}
