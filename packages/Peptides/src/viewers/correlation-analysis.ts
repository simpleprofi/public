import * as DG from 'datagrok-api/dg';
const {RandomForestRegressor} = require('random-forest/async');

import {AlignedSequenceEncoder} from '@datagrok-libraries/utils/src/sequence-encoder';
import {assert, calculateRMSD} from '@datagrok-libraries/utils/src/operations';
import {Vector} from '@datagrok-libraries/utils/src/type-declarations';
import {kendallsTau} from '@datagrok-libraries/statistics/src/correlation-coefficient';

//import os from 'os';
//const coresNumber = os.cpus().length;

export async function correlationAnalysis(
  tableGrid: DG.Grid,
  view: DG.TableView,
  currentDf: DG.DataFrame,
  sequencesCol: DG.Column,
  activityColumnName: string,
  activityScalingMethod: string,
) {
  const activityCol = await _scaleColumn(currentDf.getCol(activityColumnName), activityScalingMethod);
  const encDf = _encodeSequences(sequencesCol);

  _insertColumns(currentDf, [DG.Column.fromList('double', `${activityColumnName}scaled`, activityCol.toList())]);
  _insertColumns(currentDf, encDf.columns);

  const [activityPred, activityPredName] = [await _buildModel(encDf, activityCol), `${activityColumnName}pred`];
  _insertColumns(currentDf, [DG.Column.fromList('double', activityPredName, activityPred)]);

  view.addViewer(DG.VIEWER.SCATTER_PLOT, {
    xColumnName: activityColumnName,
    yColumnName: activityPredName,
    sizeColumnName: activityPredName,
    colorColumnName: activityColumnName,
    showRegressionLine: true,
  });

  /*view.addViewer(DG.VIEWER.CORR_PLOT, {
    xColumnNames: encDf.columns.names(),
    yColumnNames: [activityColumnName],
  });*/

  const corrDf = _measureAssociation(encDf, activityCol);

  view.addViewer(corrDf.plot.bar({
    splitColumnName: corrDf.columns.names()[0],
    valueColumnName: corrDf.columns.names()[1],
    colorColumnName: corrDf.columns.names()[2],
    valueAggrType: 'sum',
    barSortType: 'by category',
    barSortOrder: 'asc',
  }));
}

function _measureAssociation(data: DG.DataFrame, target: DG.Column): DG.DataFrame {
  const y = Array.from<number>(target.getRawData());

  const nCols = data.columns.length;
  const names = ['position', 'Tau', 'p-value'];
  const nOutCols = names.length;
  const outCols = new Array(nOutCols).fill(0).map(() => new Float32Array(nCols).fill(0));

  for (let i = 0; i < nCols; ++i) {
    const col = data.columns.byIndex(i);
    const x = Array.from<number>(col.getRawData());
    const r = kendallsTau(x, y);
    [outCols[0][i], outCols[1][i], outCols[2][i]] = [i+1, r.test, r.prob];
  }

  return DG.DataFrame.fromColumns(
    new Array(nOutCols).fill(0).map((_, i) => DG.Column.fromFloat32Array(names[i], outCols[i])),
  );
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

async function _buildModel(features: DG.DataFrame, observations: DG.Column) {
  const nSamples = features.rowCount;

  assert(observations.length == nSamples, 'Samples count does not match number of observations.');

  const nFeatures = features.columns.length;
  const regression = new RandomForestRegressor({
    nEstimators: 1000,
    maxFeatures: Math.round(Math.sqrt(nFeatures)),
    nJobs: 8, //coresNumber,
  });

  const X = new Array(nSamples);
  const y = Array.from(observations.getRawData());

  for (let i = 0; i < nSamples; ++i) {
    X[i] = Array.from(features.row(i).cells).map((v: DG.Cell) => v.value);
  }
  await regression.init();
  await regression.train(X, y);
  const pred = await regression.predict(X);
  const RMSD = calculateRMSD(Vector.from(y), Vector.from(pred));
  console.log(RMSD);
  return pred;
}
