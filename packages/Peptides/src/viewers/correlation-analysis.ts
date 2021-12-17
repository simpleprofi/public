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
): Promise<Function> {
  return async () => {
    const progress = DG.TaskBarProgressIndicator.create('Loading correlation analysis...');

    const activityCol = await _scaleColumn(currentDf.getCol(activityColumnName), activityScalingMethod);
    const encDf = _encodeSequences(sequencesCol);

    _insertColumns(currentDf, encDf);
    _addModel(encDf, activityCol);

    view.addViewer(DG.VIEWER.CORR_PLOT, {
      xColumnNames: encDf.columns.names(),
      yColumnNames: [activityColumnName],
    });

    progress.close();
  };
}

async function _scaleColumn(column: DG.Column, method: string): Promise<DG.Column> {
  const availableMethods = ['none', 'lg', '-lg'];

  assert(availableMethods.includes(method), `Scaling method '${method}' is not supported.`);

  if (method == 'none') {
    return column;
  }

  const formula = (method.startsWith('-') ? '0-' : '')+'Log10($[x])';
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

function _insertColumns(targetDf: DG.DataFrame, srcDf: DG.DataFrame): DG.DataFrame {
  for (const col of srcDf.columns) {
    targetDf.columns.add(col);
  }
  return targetDf;
}

function _addModel(features: DG.DataFrame, observations: DG.Column) {
  const nSamples = features.rowCount;

  assert(observations.length == nSamples, 'Samples count does not match number of observations.');

  const nFeatures = features.columns.length;
  const regression = new RandomForestRegression({
    nEstimators: 100,
    maxFeatures: Math.sqrt(nFeatures) / nFeatures,
  });

  const X = new Array(nSamples);
  const y = Array.from(observations.getRawData());

  for (let i = 0; i < nSamples; ++i) {
    X[i] = Array.from(features.row(i).cells).map((v: DG.Cell) => v.value);
  }
  regression.train(X, y);
  const pred = regression.predict(X);
  const RMSD = calculateEuclideanDistance(Vector.from(y), Vector.from(pred));
  console.log(RMSD);
}
