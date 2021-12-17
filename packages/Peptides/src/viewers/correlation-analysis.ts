import * as DG from 'datagrok-api/dg';
import {RandomForestRegression} from 'ml-random-forest';

import {AlignedSequenceEncoder} from '@datagrok-libraries/utils/src/sequence-encoder';
import {assert, calculateEuclideanDistance} from '@datagrok-libraries/utils/src/operations';
import {Vector} from '@datagrok-libraries/utils/src/type-declarations';

export async function correlationAnalysis(
  tableGrid: DG.Grid,
  view: DG.TableView,
  currentDf: DG.DataFrame,
  sequencesCol: DG.Column,
  activityColumnName: string,
  activityScalingMethod: string,
) {
  /*): Function {
  return async () => {*/
  const activityCol = await _scaleColumn(currentDf.getCol(activityColumnName), activityScalingMethod);
  const encDf = _encodeSequences(sequencesCol);

  _insertColumns(currentDf, [DG.Column.fromList('double', `${activityColumnName}scaled`, activityCol.toList())]);
  _insertColumns(currentDf, encDf.columns);

  view.addViewer(DG.VIEWER.CORR_PLOT, {
    xColumnNames: encDf.columns.names(),
    yColumnNames: [activityColumnName],
  });

  const [activityPred, activityPredName] = [_buildModel(encDf, activityCol), `${activityColumnName}pred`];
  _insertColumns(currentDf, [DG.Column.fromList('double', activityPredName, activityPred)]);

  view.addViewer(DG.VIEWER.SCATTER_PLOT, {
    xColumnName: activityColumnName,
    yColumnName: activityPredName,
    showRegressionLine: true,
  });
  //};
}

async function _scaleColumn(column: DG.Column, method: string): Promise<DG.Column> {
  const availableMethods = ['none', 'lg', '-lg'];

  assert(availableMethods.includes(method), `Scaling method '${method}' is not supported.`);

  if (method == 'none') {
    return column;
  }

  const formula = (method.startsWith('-') ? '0-' : '')+'Log10(${'+column.name+'})';
  const newCol = await column.applyFormula(formula);

  if (newCol == null) {
    throw new Error('Column formula returned unexpected null.');
  }
  return newCol!;
}

/**
 * Encodes a series of sequences into a certain scale.
 *
 * @param {string[]} sequencesCol Column containing the sequences.
 * @return {DG.DataFrame} The data frame with seqences encoded.
 */
function _encodeSequences(sequencesCol: DG.Column): DG.DataFrame {
  const nRows = sequencesCol.length;

  assert(nRows > 0, `Number of rows must not be < 1.`);

  const nCols = AlignedSequenceEncoder.clean(sequencesCol.get(0)).length;

  assert(nCols > 0, `Number of columns must not be < 1.`);

  const enc = new AlignedSequenceEncoder('WimleyWhite');
  const positions = new Array(nCols).fill(0).map((_) => new Float32Array(nRows));

  for (let j = 0; j < nRows; ++j) {
    const s = AlignedSequenceEncoder.clean(sequencesCol.get(j));
    for (let i = 0; i < nCols; ++i) {
      positions[i][j] = enc.encodeLettter(s[i]);
    }
  }
  const df = DG.DataFrame.fromColumns(positions.map(
    (v, i) => DG.Column.fromFloat32Array((i+1).toString(), v),
  ));
  return df;
}

function _insertColumns(targetDf: DG.DataFrame, columns: DG.Column[]): DG.DataFrame {
  for (const col of columns) {
    targetDf.columns.add(col);
  }
  return targetDf;
}

function _buildModel(features: DG.DataFrame, observations: DG.Column) {
  const nSamples = features.rowCount;

  assert(observations.length == nSamples, 'Samples count does not match number of observations.');

  //const nFeatures = features.columns.length;
  const regression = new RandomForestRegression(true);/*{
    nEstimators: 100,
    maxFeatures: 1, //Math.sqrt(nFeatures) / nFeatures,
    useSampleBagging: true,
  }*/

  const X = new Array(nSamples);
  const y = Array.from(observations.getRawData());

  for (let i = 0; i < nSamples; ++i) {
    X[i] = Array.from(features.row(i).cells).map((v: DG.Cell) => v.value);//[y[i]+Math.random()]; //
  }
  regression.train(X, y);
  const pred = regression.predict(X);
  const RMSD = calculateEuclideanDistance(Vector.from(y), Vector.from(pred));
  console.log(RMSD);
  return pred;
}
