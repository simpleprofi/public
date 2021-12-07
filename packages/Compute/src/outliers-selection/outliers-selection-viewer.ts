import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export class OutliersSelectionViewer extends DG.JsViewer {
  constructor() {
    super();
  }

  // override to handle property changes
  onPropertyChanged(prop: any) {
    grok.shell.info(`${prop.name}: ${prop.get(this)}`);
  }

  onTableAttached() {
    if (this.dataFrame) {
      this.initialRender();
    }
  }

  render() {

  }

  initialRender() {
    if (!this.dataFrame) {
      this.root.innerHTML = '';
      return;
    }

    const inputData = this.dataFrame;
    const IS_OUTLIER_COL_LABEL = 'isOutlier';
    const OUTLIER_RATIONALE_COL_LABEL = 'Rationale';
    const OUTLIER_COUNT_COL_LABEL = 'Count';
    const IS_GROUP_CONFIRMED_LABEL = 'isConfirmed';
    const FLUX = 't/V (hr/L)';

    if (!inputData.columns.byName(IS_OUTLIER_COL_LABEL)) {
      inputData.columns
        .add(DG.Column.fromBitSet(IS_OUTLIER_COL_LABEL, DG.BitSet.create(inputData.rowCount, () => false)));
    }

    if (!inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL)) {
      inputData.columns
        .add(DG.Column.fromStrings(OUTLIER_RATIONALE_COL_LABEL, Array.from({length: inputData.rowCount}, () => '')));
    }

    if (!inputData.columns.byName(FLUX)) {
      (inputData.columns as DG.ColumnList).addNew(FLUX, 'double').init((index) => (inputData.cell(index, 'filtrate volume (mL)').value/1000.0) / (inputData.cell(index, 'time (min)').value/60.0));
    }

    const initialData = inputData.clone();

    const clearTable = () => {
      return DG.DataFrame.fromColumns([
        DG.Column.fromStrings(OUTLIER_RATIONALE_COL_LABEL, []),
        DG.Column.fromInt32Array(OUTLIER_COUNT_COL_LABEL, new Int32Array([])),
        DG.Column.fromStrings('Actions', []),
        DG.Column.fromBitSet(IS_GROUP_CONFIRMED_LABEL, DG.BitSet.create(0, () => false)),
      ]);
    };

    const groupsListGrid = DG.Viewer.grid(clearTable());
    groupsListGrid.root.style.width = '100%';
    groupsListGrid.columns.setVisible([OUTLIER_RATIONALE_COL_LABEL, OUTLIER_COUNT_COL_LABEL, 'Actions']);

    groupsListGrid.onCellPrepare((gc) => {
      if (!gc.isTableCell) {
        return;
      }

      const confirmBtn = () => ui.div(
        ui.iconFA('check', () => {
          if (!groupsListGrid.dataFrame) return;

          const newRationale =
            groupsListGrid.dataFrame?.cell(groupsListGrid.dataFrame.rowCount-1, OUTLIER_RATIONALE_COL_LABEL).value;

          inputData.selection.getSelectedIndexes().forEach((selectedIndex: number) => {
            inputData.set(IS_OUTLIER_COL_LABEL, selectedIndex, true);
            inputData.set(
              OUTLIER_RATIONALE_COL_LABEL,
              selectedIndex,
              newRationale,
            );
          });
          inputData.selection.setAll(false);
        }, 'Confirm the outliers'), {style: {'text-align': 'center', 'margin': '6px'}},
      );

      const cancelBtn = () => ui.div(
        ui.iconFA('times', () => {
          if (!groupsListGrid.dataFrame) return;

          groupsListGrid.dataFrame.rows.removeAt(groupsListGrid.dataFrame.rowCount-1);
          inputData.selection.setAll(false);
        }, 'Cancel the outliers'), {style: {'text-align': 'center', 'margin': '6px'}},
      );

      const deleteBtn = (rationale: string) => ui.div(
        ui.icons.delete(() => {
          for (let i = 0; i < inputData.rowCount; i++) {
            if (inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL).get(i) === rationale) {
              inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL).set(i, '');
              inputData.columns.byName(IS_OUTLIER_COL_LABEL).set(i, false);
            }
          }
        }, 'Remove the outliers group'), {style: {'text-align': 'center', 'margin': '6px'}},
      );

      if (gc.gridColumn.name === 'Actions') {
        gc.gridColumn.cellType = 'html';
        gc.style.element =
          ui.divH([
            ...!gc.grid.dataFrame?.get(IS_GROUP_CONFIRMED_LABEL, gc.gridRow) ?
              [confirmBtn(), cancelBtn()] :
              [deleteBtn(gc.grid.dataFrame?.get(OUTLIER_RATIONALE_COL_LABEL, gc.gridRow))],
          ]);
      }
    });

    groupsListGrid.onCellValueEdited.subscribe((editedCell) => {
      if (!groupsListGrid.dataFrame || editedCell.gridColumn.name !== OUTLIER_RATIONALE_COL_LABEL) return;

      if (!(groupsListGrid.dataFrame.columns as DG.ColumnList)
        .byName(IS_GROUP_CONFIRMED_LABEL).get(editedCell.gridRow)) return;

      const uniqueValues= new Set<string>();
      for (let i = 0; i < groupsListGrid.dataFrame?.rowCount; i++) {
        const record = groupsListGrid.dataFrame?.columns.byName(OUTLIER_RATIONALE_COL_LABEL).get(i);
        uniqueValues.add(record);
      }

      for (let i = 0; i < inputData.rowCount; i++) {
        const currentCellValue = inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL).get(i);
        if (currentCellValue != '' && !uniqueValues.has(currentCellValue)) {
          inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL).set(i, editedCell.cell.value);
        }
      }
    });

    const updateGroupsTable = () => {
      const uniqueValues: {[key:string]: number} = {};
      for (let i = 0; i < inputData.rowCount; i++) {
        const record = inputData.columns.byName(OUTLIER_RATIONALE_COL_LABEL).get(i);
        const count = uniqueValues[record];
        if (record != '') {
          count ?
            uniqueValues[record]++ :
            uniqueValues[record] = 1;
        }
      }
      groupsListGrid.dataFrame = clearTable();
      groupsListGrid.columns.setVisible([OUTLIER_RATIONALE_COL_LABEL, OUTLIER_COUNT_COL_LABEL, 'Actions']);

      Object.keys(uniqueValues).map((key: string) => {
        groupsListGrid.dataFrame?.rows.addNew([key, uniqueValues[key], '', true]);
      });
    };

    inputData.onDataChanged.subscribe(updateGroupsTable);
    inputData.onSelectionChanged.subscribe(() => {
      if (!groupsListGrid.dataFrame || !inputData.selection.trueCount) return;

      const isConfirmedColumn = (groupsListGrid.dataFrame.columns as DG.ColumnList)
        .byName(IS_GROUP_CONFIRMED_LABEL).toList();

      if (isConfirmedColumn.some((value) => value === false)) {
        groupsListGrid.dataFrame.set(
          OUTLIER_COUNT_COL_LABEL,
          groupsListGrid.dataFrame.rowCount-1,
          inputData.selection.trueCount,
        );
      } else {
        const newRow = groupsListGrid.dataFrame.rows.addNew(['Manual', inputData.selection.trueCount, '', false]);
        groupsListGrid.dataFrame.currentCell = groupsListGrid.dataFrame.cell(newRow.idx, OUTLIER_RATIONALE_COL_LABEL);
      }
    });

    const resetSelectedBtn = ui.button(
      'RESET SELECTED',
      () => {
        inputData.selection.getSelectedIndexes().forEach((selectedIndex: number) => {
          inputData.set(IS_OUTLIER_COL_LABEL, selectedIndex, false);
          inputData.set(OUTLIER_RATIONALE_COL_LABEL, selectedIndex, '');
        });
        inputData.selection.setAll(false);
      },
      'Remove the selected points from oultiers list',
    );

    const resetAllBtn = ui.button(
      'RESET ALL',
      () => {
        (inputData.columns as DG.ColumnList).byName(IS_OUTLIER_COL_LABEL).init(
          (index) => initialData.get(IS_OUTLIER_COL_LABEL, index),
        );
        (inputData.columns as DG.ColumnList).byName(OUTLIER_RATIONALE_COL_LABEL).init(
          (index) => initialData.get(OUTLIER_RATIONALE_COL_LABEL, index),
        );
      },
      'Cancel all changes',
    );

    const autoOutlierGroupBtn = ui.button(
      'AUTO DETECT...',
      () => {
        const intInput = ui.intInput('N', 3);
        const columnInput = ui.columnInput('Column', inputData, null);
        ui.dialog('Detect outliers automatically')
          .add(columnInput.root)
          .add(intInput.root)
          .onOK(()=>{
            const meanValue = (columnInput.value as DG.Column).stats.avg;
            const stddev = (columnInput.value as DG.Column).stats.stdev;
            inputData.selection.init((index)=>
              Math.abs(meanValue - (columnInput.value as DG.Column).get(index)) > stddev*intInput.value,
            );
            inputData.selection.getSelectedIndexes().forEach((selectedIndex: number) => {
              inputData.set(IS_OUTLIER_COL_LABEL, selectedIndex, true);
              inputData.set(OUTLIER_RATIONALE_COL_LABEL, selectedIndex, `${intInput.value}x stddev rule`);
            });
            inputData.selection.setAll(false);
          })
          .show();
      },
      'Detect outliers automatically',
    );

    inputData.selection.setAll(false);

    inputData.onSelectionChanged.subscribe(() => {
      if (inputData.selection.trueCount === 0) {
        resetSelectedBtn.classList.add('disabled');
      } else {
        resetSelectedBtn.classList.remove('disabled');
      }
    });

    updateGroupsTable();
    resetSelectedBtn.classList.add('disabled');

    this.root.replaceWith(ui.panel([
      ui.divV([
        ui.info(
          ui.div([
            ui.p('Hold the “SHIFT” key and start to draw a freehand selection on the plot area'),
          ], {style: {'white-space': 'pre-wrap'}}),
        ),
        ui.divV([
          ui.divH([
            resetSelectedBtn, resetAllBtn, autoOutlierGroupBtn,
          ], {style: {'text-align': 'center'}}),
          groupsListGrid.root,
        ], {style: {'height': '75%'}}),
      ], {style: {'height': '100%', 'min-width': '230px'}}),
    ], {style: {'height': '100%'}}));
  }
}
