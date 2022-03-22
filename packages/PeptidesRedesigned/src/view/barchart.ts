import * as DG from 'datagrok-api/dg';

import {CompositionBarchart, GridCellArgs} from '../presenter/composition-barchart';

interface BarchartActions {
  highlightBar(args: GridCellArgs): void;
  clearHighlight(args: GridCellArgs): void;
  selectBar(args: GridCellArgs): void;
}

interface BarchartRendering {
  renderBar(g: CanvasRenderingContext2D, cell: DG.GridCell, x: number, y: number, w: number, h: number): void;
}

export interface IBarchart extends BarchartActions, BarchartRendering {
}

export class Barchart extends DG.JsViewer implements IBarchart {
  dataEmptyAA: string;
  rowsCount: number;
  presenter: CompositionBarchart;

  constructor(presenter: CompositionBarchart) {
    super();
    this.presenter = presenter;
    this.dataEmptyAA = this.string('dataEmptyAA', '-');
    this.rowsCount = 0;
  }

  renderBar(g: CanvasRenderingContext2D, cell: DG.GridCell, x: number, y: number, w: number, h: number) {
  }

  highlightBar(args: GridCellArgs) {
  }

  clearHighlight(args: GridCellArgs) {
  }

  selectBar(args: GridCellArgs) {
  }
}
