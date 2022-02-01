import {/*before, after, */category, test} from '@datagrok-libraries/utils/src/test';
import {
  _testViewerIsDrawing,
  _testDimensionalityReducer,
  _testPeptideSpaceData,
  _testTableIsNotEmpty,
} from './utils';
import {DimensionalityReducer} from '@datagrok-libraries/ml/src/reduce-dimensionality';
import {cleanAlignedSequencesColumn} from '../utils/peptide-space-data';
import {aligned1} from './test-data';

import * as DG from 'datagrok-api/dg';
import {StringMetrics} from '@datagrok-libraries/ml/src/typed-metrics';

export const _package = new DG.Package();

let table: DG.DataFrame;

//const table = await grok.data.loadTable(`${_package.webRoot}files/aligned.csv`);
//'/home/www/data/dev/packages/data/peptides/aligned.csv');
//console.log(table);
//const table = await grok.data.files.openTable('Demo:Files/bio/peptides.csv');

category('peptides', async () => {
  /*before(async () => {
    console.log(['before']);
    // const text = await _package.files.readAsText('aligned.csv');
    // console.log([text]);
    // table = DG.DataFrame.fromCsv(text);

    // const path = `${_package.webRoot}files/aligned.csv`;
    // console.log([path]);
    // table = await grok.data.loadTable(path);
    // console.log([table]);

    table = await grok.data.files.openTable('Demo:Files/bio/peptides.csv');
    view = grok.shell.addTableView(table);
  });*/

  //table = await grok.data.files.openTable('Demo:Files/bio/peptides.csv');
  table = DG.DataFrame.fromCsv(aligned1);

  const alignedSequencesColumn = table.getCol('AlignedSequence');
  const activityColumn = table.getCol('IC50');

  test('peptide_space.test_table.is_not_empty', async () => {
    _testTableIsNotEmpty(table);
  });

  test('peptide_space.PeptideSimilaritySpaceWidget.is_drawing', async () => {
    await _testViewerIsDrawing(table, alignedSequencesColumn);
  });

  const columnData = cleanAlignedSequencesColumn(alignedSequencesColumn);

  for (const method of DimensionalityReducer.availableMethods) {
    for (const measure of DimensionalityReducer.availableMetricsByType('String')) {
      test(`peptide_space.DimensinalityReducer.${method}.${measure}.is_numeric`, async () => {
        await _testDimensionalityReducer(columnData, method as StringMetrics, measure);
      });
    }
  }

  for (const method of DimensionalityReducer.availableMethods) {
    for (const measure of DimensionalityReducer.availableMetricsByType('String')) {
      test(`peptide_space.PeptideSimilaritySpaceViewer.${method}.${measure}.is_proper`, async () => {
        await _testPeptideSpaceData(alignedSequencesColumn, activityColumn, method, measure, 100);
      });
    }
  }

  /*after(async () => {
    view.close();
    grok.shell.closeTable(table!);
  });*/
});
