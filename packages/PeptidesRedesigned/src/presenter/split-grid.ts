import * as DG from 'datagrok-api/dg';

import {Split} from '../model/split';
import {FormattedColumnName} from '../utils/formatted-column-name';

export class SplitGrid {
  //protected view: ISplitGrid;
  static columnFormatter = FormattedColumnName;
  protected model: Split;
  protected splitGrid: DG.Grid;

  constructor(model: Split) {
    this.model = model;
    this.splitGrid = this.update();
  }

  update(): DG.Grid {
    const columns = this.model.result.map((v, i) => DG.Column.fromStrings(SplitGrid.columnFormatter.columnName(i), v));
    const df = DG.DataFrame.fromColumns(columns);
    return DG.Grid.grid(df);
  }

  get result(): DG.Grid {
    return this.splitGrid;
  }
}
