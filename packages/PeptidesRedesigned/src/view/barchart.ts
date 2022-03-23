import * as grok from 'datagrok-api/grok';
//import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {GridCellArgs, SplitColumnStats, SplitGridStats} from '../presenter/composition-barchart';

interface BarchartActions {
  highlightBar(args: GridCellArgs): void;
  clearHighlight(args: GridCellArgs): void;
  selectBar(args: GridCellArgs): void;
}

interface BarchartRendering {
  renderBar(options: CellRenderingOptions): void;
}

interface BarchartDataTransfer {
  set stats(gridStats: SplitGridStats);
  set gridRowsCount(count: number);
}
export interface IBarchart extends BarchartActions, BarchartRendering, BarchartDataTransfer {
}

export class Barchart extends DG.JsViewer implements IBarchart {
  dataEmptyAA: string;
  gridStats: SplitGridStats;
  rowsCount: number;

  constructor() {
    super();
    this.dataEmptyAA = this.string('dataEmptyAA', '-');
    this.gridStats = {};
    this.rowsCount = 0;
  }

  set stats(gridStats: SplitGridStats) {
    this.gridStats = gridStats;
  }

  set gridRowsCount(count: number) {
    this.rowsCount = count;
  }

  renderBar(options: CellRenderingOptions) {
    const headerPainter = new BarHeaderPainter(options, this.rowsCount);
    headerPainter.paint(this.gridStats);
  }

  highlightBar(args: GridCellArgs) {
    grok.shell.info('highlightBar');
  }

  clearHighlight(args: GridCellArgs) {
    grok.shell.info('clearHighlight');
  }

  selectBar(args: GridCellArgs) {
    grok.shell.info('selectBar');
  }
}

type BarDrawingOptions = {
  x: number,
  y: number,
  w: number,
  h: number,
  barWidth: number,
  sum: number,
};

class BarHeaderPainter {
  static undefinedColor = 'rgb(100,100,100)';
  static someColor = 'rgb(23,190,207)';
  static innerMargin = 0.02;
  static selectLineRatio = 0.1;
  static fontSize = 11;
  static eps = 0.1;

  options: CellRenderingOptions;
  rowsCount: number;

  constructor(options: CellRenderingOptions, rowsCount: number) {
    this.options = options;
    this.rowsCount = rowsCount;
  }

  paint(barStats: SplitGridStats) {
    const context = this.options.context;
    const name = this.options.cell.tableColumn!.name;
    const colNameSize = context.measureText(name).width;
    const barData = barStats[name];
    const margin = 0.2;
    let sum = 0;

    barData.forEach((obj) => {
      sum += obj['count'];
    });

    const x = this.options.x + this.options.width * margin;
    const y = this.options.y + this.options.height * margin / 4;
    const w = this.options.width - this.options.width * margin * 2;
    const h = this.options.height - this.options.height * margin;
    const barWidth = w - 10;

    context.fillStyle = 'black';
    context.textBaseline = 'top';
    context.font = `${h * margin / 2}px`;
    context.fillText(name, x + (w - colNameSize) / 2, y + h + h * margin / 4);

    for (const obj of barData) {
      this._paintObject(obj, {
        x: x,
        y: y,
        w: w,
        h: h,
        barWidth: barWidth,
        sum: sum,
      });
      sum -= obj['count'];
    }
  }

  protected _paintObject(obj: SplitColumnStats, options: BarDrawingOptions) {
    const context = this.options.context;
    const sBarHeight = options.h * obj.count / this.rowsCount;
    const gapSize = sBarHeight * BarHeaderPainter.innerMargin;
    const verticalShift = (this.rowsCount - options.sum) / this.rowsCount;
    // TODO: make colors to depend from obj.name.
    const [color, aarOuter] = [BarHeaderPainter.someColor, BarHeaderPainter.someColor];
    const textSize = context.measureText(aarOuter);
    const leftMargin = (options.w - (aarOuter.length > 1 ? BarHeaderPainter.fontSize : textSize.width - 8)) / 2;
    const subBartHeight = sBarHeight - gapSize;
    const yStart = options.h * verticalShift + gapSize / 2;
    const xStart = (options.w - options.barWidth) / 2;
    const absX = options.x + leftMargin;
    const absY = options.y + yStart + subBartHeight / 2 + (aarOuter.length == 1 ? + 4 : 0);

    context.strokeStyle = color;
    context.fillStyle = color;

    if (textSize.width <= subBartHeight) {
      const origTransform = context.getTransform();

      if (color != BarHeaderPainter.undefinedColor) {
        context.fillRect(options.x + xStart, options.y + yStart, options.barWidth, subBartHeight);
        context.fillStyle = 'black';
      } else {
        context.strokeRect(options.x + xStart + 0.5, options.y + yStart, options.barWidth - 1, subBartHeight);
      }

      context.font = `${BarHeaderPainter.fontSize}px monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'bottom';

      if (aarOuter.length > 1) {
        context.translate(absX, absY);
        context.rotate(Math.PI / 2);
        context.translate(-absX, -absY);
      }

      context.fillText(aarOuter, absX, absY);
      context.setTransform(origTransform);
    } else {
      context.fillRect(options.x + xStart, options.y + yStart, options.barWidth, subBartHeight);
    }

    if (obj.selectedCount > BarHeaderPainter.eps) {
      context.fillStyle = 'rgb(255,165,0)';
      context.fillRect(
        options.x + xStart - options.w * BarHeaderPainter.selectLineRatio * 2,
        options.y + yStart,
        options.barWidth * BarHeaderPainter.selectLineRatio,
        options.h * obj['selectedCount'] / this.rowsCount - gapSize,
      );
    }

    if (obj.highlightedCount > BarHeaderPainter.eps && obj.highlightedCount > obj.selectedCount) {
      context.fillStyle = 'rgb(209,242,251)';
      context.fillRect(
        options.x + xStart - options.w * BarHeaderPainter.selectLineRatio * 2,
        options.y + yStart + options.h * obj['selectedCount'] / this.rowsCount - gapSize,
        options.barWidth * BarHeaderPainter.selectLineRatio,
        options.h * (obj['highlightedCount'] - obj['selectedCount']) / this.rowsCount - gapSize,
      );
    }
  }
}

export type CellRenderingOptions = {
  context: CanvasRenderingContext2D,
  cell: DG.GridCell,
  x: number,
  y: number,
  width: number,
  height: number,
};

