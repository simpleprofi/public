import * as DG from 'datagrok-api/dg';
import {StringDictionary} from '@datagrok-libraries/utils/src/type-declarations';
import * as rxjs from 'rxjs';

type Operation = (op1: boolean, op2: boolean) => boolean;

/** Logical operations awailable between selection items. */
const Operations: {[op: string]: Operation} = {
  and: (op1: boolean, op2: boolean) => op1 && op2,
  or: (op1: boolean, op2: boolean) => op1 || op2,
};

type FilterOperation = 'and' | 'or';
type PositionFilter = {[pos: string]: Set<string>};

/** Implements multiple selection in position-residue space. */
export class MultipleSelection {
  conjunction: boolean;
  filter: PositionFilter;
  protected operation: Operation;
  protected complete: (v: boolean) => boolean;

  /**
   * Creates an instance of MultipleSelection.
   * @param {FilterOperation} [operation='and'] Operation to apply to items.
   */
  constructor(operation: FilterOperation = 'and') {
    this.conjunction = operation == 'and';
    this.filter = {};
    this.operation = Operations[operation];
    this.complete = (v: boolean) => (this.conjunction && !v) || (!this.conjunction && v);
  }

  /**
   * Adds position-residue entity into selection.
   * @param {string} pos Position in a sequence.
   * @param {string} res Residue at the position.
   */
  input(pos: string, res: string) {
    if (!this.filter[pos])
      this.filter[pos] = new Set([]);

    if (this.filter[pos].has(res))
      this.remove(pos, res);
    else
      this.filter[pos].add(res);
  }

  /**
   * Removes position-residue entity from selection.
   * @param {string} pos Position in a sequence.
   * @param {string} res Residue at the position.
   */
  remove(pos: string, res: string) {
    if (this.filter[pos]) {
      this.filter[pos].delete(res);

      if (this.filter[pos].size == 0)
        delete this.filter[pos];
    }
  }

  /**
   * Sets the particular residue at position into selection.
   * @param {string} pos Position in a sequence.
   * @param {string} res Residue at the position.
   */
  set(pos: string, res: string) {
    for (const p of Object.keys(this.filter))
      delete this.filter[p];

    this.filter[pos] = new Set([res]);
  }

  /**
   * Sets the particular position with the given residues into selection.
   * @param {string} pos Position in a sequence.
   * @param {string[]} values Residues list at the position.
   */
  setPos(pos: string, values: string[]) {
    this.filter[pos] = new Set(values);
  }

  /**
   * Sets the particular residue to be at given positions into selection.
   * @param {string} res Residue to set.
   * @param {string[]} values Positions list to assign the residue to.
   */
  setRes(res: string, values: string[]) {
    for (const pos of values) {
      if (this.filter[pos])
        this.filter[pos].add(res);
      else
        this.filter[pos] = new Set([res]);
    }
  }

  /**
   * Evaluates selection into a list of booleans of the same length as the given data frame.
   * @param {DG.DataFrame} df Data frame to consider.
   * @param {StringDictionary} [mapper={}] Optional residues mapper.
   * @return {boolean[]} List of trues/falses corresponding selection constructed.
   */
  eval(df: DG.DataFrame, mapper: StringDictionary = {}): boolean[] {
    const itemsCount = df.rowCount;
    const cond = new Array<boolean>(itemsCount).fill(this.conjunction);

    for (let i = 0; i < itemsCount; ++i) {
      for (const [posColumnName, resFilter] of Object.entries(this.filter)) {
        const residue = df.get(posColumnName, i);
        const isMatched = resFilter.has(mapper[residue] ?? residue);
        cond[i] = this.operation(cond[i], isMatched);

        if (this.complete(cond[i]))
          break;
      }
    }
    return cond;
  }

  /**
   * Tests if position-residue is selected.
   * @param {string} pos Position in a sequence.
   * @param {string} res Residue at the position.
   * @param {StringDictionary} [mapper={}] Optional residues mapper.
   * @return {boolean} True if this entity is selected else false.
   */
  test(pos: string, res: string, mapper: StringDictionary = {}): boolean {
    if (this.filter[pos])
      return this.filter[pos].has(mapper[res] ?? res);

    return false;
  }
}

const MouseEventsSource = {
  click: 0,
  mousemove: 1,
  mouseout: 2,
};
const MouseEvents = Object.keys(MouseEventsSource);
export type MouseEventType = keyof typeof MouseEventsSource;
export type CellType = 'isTableCell' | 'isColHeader' | 'unknown';

type MouseEventHandler = (
  eventType: MouseEventType,
  cellType: CellType,
  colName: string | null,
  rowIdx: number | null,
  ctrlPressed: boolean
) => void;

/**
 * Adds mouse event handler to the click event bus.
 * @param {DG.Grid} grid Grid to add to.
 * @param {MouseEventHandler} handler Event handler.
 */
export function addGridMouseHandler(grid: DG.Grid, handler: MouseEventHandler) {
  const onMouseEvent = (mouseEvent: MouseEvent) => {
    if (!MouseEvents.includes(mouseEvent.type))
      return;

    const mouseEventType: MouseEventType = mouseEvent.type as MouseEventType;
    const keyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
    const cell = grid.hitTest(mouseEvent.offsetX, mouseEvent.offsetY);
    let pos: string | null = null;
    let rowIdx: number | null = null;
    let cellType: CellType = 'unknown';

    if (cell) {
      pos = cell.gridColumn.name;

      if (pos.length == 0)
        pos = null;

      if (cell.isTableCell) {
        rowIdx = cell.tableRowIndex!;
        cellType = 'isTableCell';
      } else if (cell.isColHeader)
        cellType = 'isColHeader';
    }

    handler(mouseEventType, cellType, pos, rowIdx, keyPressed);
  };

  for (const e of MouseEvents)
    rxjs.fromEvent<MouseEvent>(grid.overlay, e).subscribe(onMouseEvent);
}
