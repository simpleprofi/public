import * as DG from 'datagrok-api/dg';
import {StringDictionary} from '@datagrok-libraries/utils/src/type-declarations';
import * as rxjs from 'rxjs';

type Operation = (op1: boolean, op2: boolean) => boolean;

const Operations = {
  and: (op1: boolean, op2: boolean) => op1 && op2,
  or: (op1: boolean, op2: boolean) => op1 || op2,
};

type FilterOperation = 'and' | 'or';
type PositionFilter = {[pos: string]: Set<string>};

export class MultipleSelection {
  conjunction: boolean;
  filter: PositionFilter;
  protected operation: Operation;
  protected complete: (v: boolean) => boolean;

  constructor(operation: FilterOperation = 'and') {
    this.conjunction = operation == 'and';
    this.filter = {};
    this.operation = Operations[operation];
    this.complete = (v: boolean) => (this.conjunction && !v) || (!this.conjunction && v);
  }

  input(pos: string, res: string) {
    if (!this.filter[pos])
      this.filter[pos] = new Set([]);

    if (this.filter[pos].has(res))
      this.remove(pos, res);
    else
      this.filter[pos].add(res);
  }

  remove(pos: string, res: string) {
    if (this.filter[pos]) {
      this.filter[pos].delete(res);

      if (this.filter[pos].size == 0)
        delete this.filter[pos];
    }
  }

  set(pos: string, res: string) {
    for (const p of Object.keys(this.filter))
      delete this.filter[p];

    this.filter[pos] = new Set([res]);
  }

  setPos(pos: string, values: string[]) {
    this.filter[pos] = new Set(values);
  }

  setRes(res: string, values: string[]) {
    for (const pos of values) {
      if (this.filter[pos])
        this.filter[pos].add(res);
      else
        this.filter[pos] = new Set([res]);
    }
  }

  eval(pos: DG.DataFrame, mapper: StringDictionary = {}): boolean[] {
    const itemsCount = pos.rowCount;
    const cond = new Array<boolean>(itemsCount).fill(this.conjunction);

    for (let i = 0; i < itemsCount; ++i) {
      for (const [posColumnName, resFilter] of Object.entries(this.filter)) {
        const residue = pos.get(posColumnName, i);
        const isMatched = resFilter.has(mapper[residue] ?? residue);
        cond[i] = this.operation(cond[i], isMatched);

        if (this.complete(cond[i]))
          break;
      }
    }
    return cond;
  }
}

export type ClickHandler = (colName: string, rowIdx: number, ctrlPressed: boolean) => void;

export function addGridCellClickHandler(grid: DG.Grid, handler: ClickHandler, headerClickRowIndex = -1) {
  rxjs.fromEvent<MouseEvent>(grid.overlay, 'click').subscribe((mouseEvent: MouseEvent) => {
    if (mouseEvent.type != 'click')
      return;

    const keyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
    const cell = grid.hitTest(mouseEvent.offsetX, mouseEvent.offsetY);

    if (cell == null)
      return;

    if (cell.isTableCell) {
      const pos = cell.gridColumn.name;
      const rowIdx = cell.tableRowIndex!;
      handler(pos, rowIdx, keyPressed);
    } else if (cell.isColHeader) {
      const pos = cell.gridColumn.name;
      handler(pos, headerClickRowIndex, keyPressed);
    }
  });
}
