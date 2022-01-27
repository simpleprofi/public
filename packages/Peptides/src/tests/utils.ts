import * as DG from 'datagrok-api/dg';

import {expect} from '@datagrok-libraries/utils/src/test';
import {PeptideSpaceData, PeptideSimilaritySpaceViewer} from '../utils/peptide-similarity-space';
import {
  createDimensinalityReducingWorker,
} from '@datagrok-libraries/ml/src/workers/dimensionality-reducing-worker-creator';
import {runKalign} from '../utils/multiple-sequence-alignment';

/**
 * Tests if a table has non zero rows and columns.
 *
 * @param {DG.DataFrame} table Target table.
 */
export function _testTableIsNotEmpty(table: DG.DataFrame) {
  expect(table.columns.length > 0 && table.rowCount > 0, true);
}

/**
 * Tests if peptide space viewer is drawing without exceptions.
 *
 * @param {DG.DataFrame} table Demo table.
 * @param {DG.Column} alignedSequenceColumn Aligned sequence column.
 */
export async function _testViewerIsDrawing(table: DG.DataFrame, alignedSequenceColumn: DG.Column) {
  let noException = true;

  try {
    await PeptideSimilaritySpaceViewer.create(
      table,
      {alignedSequencesColumn: alignedSequenceColumn},
    );
  } catch (error) {
    noException = false;
  }
  expect(noException, true);
}

/**
 * Tests if dimensionality reducer works for both the method and the measure chosen.
 *
 * @param {Array<string>} columnData Strings to process.
 * @param {string} method Embedding method.
 * @param {string} measure Measure to apply to a pair of strings.
 */
export async function _testDimensionalityReducer(columnData: Array<string>, method: string, measure: string) {
  let noException = true;
  const cyclesCount = 100;
  let embcols;

  try {
    embcols = await createDimensinalityReducingWorker(columnData, method, measure, cyclesCount);
  } catch (error) {
    noException = false;
  }
  expect(noException, true);

  const [X, Y] = embcols as Array<Float32Array>;

  expect(X.every((v) => v !== null && v !== NaN), true);
  expect(Y.every((v) => v !== null && v !== NaN), true);
}

/**
 * Tests if PeptideSpaceData works for both the method and the measure chosen.
 *
 * @param {DG.Column} alignedSequencesColumn Aligned sequences column.
 * @param {DG.Column} activityColumn Activity column.
 * @param {string} method Embedding method.
 * @param {string} measure Strings similarity measure.
 * @param {number} cyclesCount Number of embedding iterations.
 */
export async function _testPeptideSpaceData(
  alignedSequencesColumn: DG.Column,
  activityColumn: DG.Column,
  method: string,
  measure: string,
  cyclesCount: number,
) {
  let noException = true;
  let data: PeptideSpaceData;
  let df: DG.DataFrame;

  try {
    data = new PeptideSpaceData({
      alignedSequencesColumn: alignedSequencesColumn,
      activityColumnName: activityColumn.name,
      method: method,
      metrics: measure,
      cycles: cyclesCount,
    });
    await data.init();
    df = data.currentTable;
  } catch (error) {
    noException = false;
  }

  expect(noException, true);

  noException = true;

  try {
    const axes = data!.axesNames.map((v) => df.getCol(v).getRawData() as Float32Array);

    for (const ax of axes)
      expect(ax.every((v) => v !== null && v !== NaN), true);
  } catch (error) {
    noException = false;
  }
  expect(noException, true);
}

/**
 * Tests if MSA works and returns consistent result.
 *
 * @export
 * @param {DG.Column} col Aligned sequences column.
 */
export async function _testMSAIsCorrect(col: DG.Column) {
  const msaCol = await runKalign(col, true);
  expect(msaCol.toList().every((v, i) => v == col.get(i)), true);
}

