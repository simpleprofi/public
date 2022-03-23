import * as DG from 'datagrok-api/dg';
import * as rxjs from 'rxjs';

import {IBarchart} from '../view/barchart';
import {Composition} from '../model/composition';
import {SplitGrid} from './split-grid';

// TODO: move to an external library.
const semanticType = 'aminoAcids';

export interface External {
  splitGrid: DG.Grid;
}

export interface GridCellArgs {
  cell: DG.GridCell,
  x: number,
  y: number,
}

export type SplitColumnStats = {
  count: number,
  name: string,
  selectedCount: number,
  highlightedCount: number,
};

export type SplitGridStats = {[columnName: string]: SplitColumnStats[]};

export class CompositionBarchart {
  protected view: IBarchart;
  protected model: Composition;
  protected external: External;

  constructor(view: IBarchart, model: Composition, external: External) {
    this.view = view;
    this.model = model;
    this.external = external;
    this.updateGridStatistics();
    this.subscribeRendering();
    this.subscribeOnMouseEvents();
  }

  updateGridStatistics() {
    const comp = this.model.result;
    const stats: SplitGridStats = {};

    for (let i = 0; i < comp.length; ++i) {
      const colComposition = comp[i];
      const colName = SplitGrid.columnFormatter.columnName(i);
      stats[colName] = [];

      for (const key of Object.keys(colComposition)) {
        stats[colName].push({
          name: key,
          count: colComposition[key],
          selectedCount: 0,
          highlightedCount: 0,
        });
      }
    }
    this.view.stats = stats;
  }

  onMouseEvent(event: MouseEvent) {
    const [x, y] = [event.offsetX, event.offsetY];
    const cell = this.external.splitGrid.hitTest(x, y);

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
    const overlay = this.external.splitGrid.overlay;
    rxjs.fromEvent<MouseEvent>(overlay, 'mousemove').subscribe((event: MouseEvent) => this.onMouseEvent(event));
    rxjs.fromEvent<MouseEvent>(overlay, 'click').subscribe((event: MouseEvent) => this.onMouseEvent(event));
    rxjs.fromEvent<MouseEvent>(overlay, 'mouseout').subscribe((event: MouseEvent) => this.onMouseEvent(event));
  }

  subscribeRendering() {
    this.external.splitGrid.onCellRender.subscribe(this.gridRenderer.bind(this));
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

  gridRenderer(args: DG.GridCellRenderArgs) {
    const context = args.g;
    const boundX = args.bounds.x;
    const boundY = args.bounds.y;
    const boundWidth = args.bounds.width;
    const boundHeight = args.bounds.height;
    const cell = args.cell;
    const df = this.external.splitGrid.dataFrame!;
    const validNames = (df.columns as DG.ColumnList).names();

    context.save();
    context.beginPath();
    context.rect(boundX, boundY, boundWidth, boundHeight);
    context.clip();

    if (cell.isColHeader && validNames.includes(cell.gridColumn.name)) {
      this.view.renderBar({
        context: context,
        cell: cell,
        x: boundX,
        y: boundY,
        width: boundWidth,
        height: boundHeight,
      });
      args.preventDefault();
    }
    context.restore();
  }
}
