import * as DG from 'datagrok-api/dg';

import {Split} from '../model/split';
import {ZeroPaddedColumnName} from '../utils/formatted-column-name';

export class ColumnFormatter extends ZeroPaddedColumnName {
};

export class SplitGrid {
  static gridOptions = {'colHeaderHeight': 130};
  //protected view: ISplitGrid;
  protected model: Split;
  protected splitGrid: DG.Grid;
  protected columnFormatter: ColumnFormatter;

  constructor(model: Split) {
    this.model = model;
    this.columnFormatter = new ColumnFormatter(this.model.result.length);
    this.splitGrid = this.update();
  }

  update(): DG.Grid {
    const columns = this.model.result.map((v, i) => DG.Column.fromStrings(this.columnFormatter.format(i), v));
    const df = DG.DataFrame.fromColumns(columns);
    const grid = DG.Grid.grid(df);
    grid.setOptions(SplitGrid.gridOptions);
    return grid;
  }

  get result(): DG.Grid {
    return this.splitGrid;
  }
}
