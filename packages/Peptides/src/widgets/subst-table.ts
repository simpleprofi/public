import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export function substTableWidget(table: DG.DataFrame): DG.Widget {
  const substTable = table?.temp['substTable'];
  if (!substTable)
    return new DG.Widget(ui.label('No substitution'));

  const dfRowCount = substTable.rowCount;
  const aminoInputFrom = ui.stringInput('from', '');
  const aminoInputTo = ui.stringInput('to', '');
  const fromToMap: {[key: string]: DG.BitSet} = {};
  let aminoFrom = '';
  let aminoTo = '';
  const initialCol: DG.Column = substTable.columns.byName('Initial');
  const substitutedCol: DG.Column = substTable.columns.byName('Substituted');

  for (let i = 0; i < initialCol.length; ++i) {
    const sequenceDifference = `${initialCol.get(i)}#${substitutedCol.get(i)}`;
    initialCol.set(i, sequenceDifference);
  }

  initialCol.semType = 'alignedSequenceDifference';
  initialCol.name = 'Substitution';
  substTable.columns.remove('Substituted');
  // const substCol = table.getCol('Substitution');

  for (let i = 0; i < dfRowCount; ++i) {
    // const [from, to] = substCol!.get(i).split('#');
    const from = initialCol.get(i);
    const to = substitutedCol.get(i);
    const aminosFrom: [] = from.split('-');
    const aminosTo: [] = to.split('-');

    for (let j = 0; j < aminosFrom.length; ++j) {
      if (aminosFrom[j] != aminosTo[j]) {
        const idx = (aminosFrom[j] === '' ? '-' : aminosFrom[j]) + '#' + (aminosTo[j] === '' ? '-' : aminosTo[j]);

        if (!(idx in fromToMap))
          fromToMap[idx] = DG.BitSet.create(dfRowCount);
        fromToMap[idx].set(i, true);
      }
    }
  }

  aminoInputFrom.onInput(() => {
    aminoFrom = aminoInputFrom.value;
    const fromKey = aminoFrom + '#' + aminoTo;
    if (fromKey in fromToMap)
      substTable.selection.copyFrom(fromToMap[fromKey]);
  });

  aminoInputTo.onInput(() => {
    aminoTo = aminoInputTo.value;
    const toKey = aminoFrom + '#' + aminoTo;
    if (toKey in fromToMap)
      substTable.selection.copyFrom(fromToMap[toKey]);
  });

  const grid = substTable.plot.grid();
  grid.props.allowEdit = false;
  grid.root.style.width = 'auto';
  grid.root.style.height = '150px';
  return new DG.Widget(ui.divV([aminoInputFrom.root, aminoInputTo.root, grid.root]));
}
