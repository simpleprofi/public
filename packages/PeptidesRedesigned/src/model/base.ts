import * as DG from 'datagrok-api/dg';

import {Composition} from './composition';

export class Model {
  private dataFrame: DG.DataFrame;
  private composition: Composition;

  constructor(dataFrame: DG.DataFrame) {
    this.dataFrame = dataFrame;

    this.composition = new Composition([]);
  }

  private split() {
    this.composition.update([]);
  }
}
