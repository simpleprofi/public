import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import {CompositionBarchart} from './composition-barchart';
import {SplitGrid} from './split-grid';
import {View} from '../view/base';
import {Model} from '../model/base';

export interface External {
  grid: DG.Grid,
  view: DG.TableView,
  sequencesColumnName: string,
  activityColumnName: string,
}

export class Presenter {
  private model: Model;
  private view: View;
  private external: External;

  compositionBarchart: CompositionBarchart;
  splitGrid: SplitGrid;

  constructor(external: External) {
    this.external = external;

    const alignedSequences = this._getSequencesColumnAsList();

    this.model = new Model(alignedSequences);
    this.view = new View();

    this.splitGrid = new SplitGrid(this.model.split);
    this.compositionBarchart = new CompositionBarchart(
      this.view.barchart,
      this.model.composition,
      {splitGrid: this.splitGrid.result},
    );

    this.addSplitGrid();
    this.addRibbonMenu();
  }

  protected _getSequencesColumnAsList(): string[] {
    const col: DG.Column = this.external.grid.dataFrame!.getCol(this.external.sequencesColumnName);
    return col.toList();
  }

  addSplitGrid() {
    this.external.view.addViewer(this.splitGrid.result);
  }

  addRibbonMenu() {
    this.external.view.ribbonMenu.group('Peptides').item('First item', () => grok.shell.info('Item clicked'));
  }
}
