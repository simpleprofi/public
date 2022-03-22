import * as DG from 'datagrok-api/dg';
import * as rxjs from 'rxjs';

import {IBarchart} from '../view/barchart';
import {Composition} from '../model/composition';

// TODO: move to an external library.
const semanticType = 'aminoAcids';

export interface External {
  grid: DG.Grid;
}

export interface GridCellArgs {
  cell: DG.GridCell,
  x: number,
  y: number,
}

export class CompositionBarchart {
  protected view: IBarchart;
  protected model: Composition;
  protected external: External;

  constructor(view: IBarchart, model: Composition, external: External) {
    this.view = view;
    this.model = model;
    this.external = external;
    this.subscribeOnMouseEvents();
  }

  onMouseEvent(event: MouseEvent) {
    const [x, y] = [event.offsetX, event.offsetY];
    const cell = this.external.grid.hitTest(x, y);

    if (!cell || !cell.isColHeader || cell.tableColumn?.semType != semanticType) {
      return;
    }

    const args: GridCellArgs = {
      cell: cell,
      x: x,
      y: y,
    };

    switch (event.type) {
    case 'mousemove':
      this.onMouseHover(args);
      break;
    case 'click':
      this.onMouseClick(args);
      break;
    case 'mouseout':
      this.onMouseOut(args);
      break;
    }
  }

  subscribeOnMouseEvents() {
    const overlay = this.external.grid.overlay;
    rxjs.fromEvent<MouseEvent>(overlay, 'mousemove').subscribe((event: MouseEvent) => this.onMouseEvent(event));
    rxjs.fromEvent<MouseEvent>(overlay, 'click').subscribe((event: MouseEvent) => this.onMouseEvent(event));
    rxjs.fromEvent<MouseEvent>(overlay, 'mouseout').subscribe((event: MouseEvent) => this.onMouseEvent(event));
  }

  onMouseHover(args: GridCellArgs) {
    this.view.highlightBar(args);
  }

  onMouseOut(args: GridCellArgs) {
    this.view.clearHighlight(args);
  }

  onMouseClick(args: GridCellArgs) {
    this.view.selectBar(args);
  }
}
