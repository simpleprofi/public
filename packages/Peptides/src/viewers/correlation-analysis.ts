import * as DG from 'datagrok-api/dg';

const {RandomForestRegressor} = require('random-forest/async');

import {AlignedSequenceEncoder} from '@datagrok-libraries/utils/src/sequence-encoder';
import {assert, calculateRMSD} from '@datagrok-libraries/utils/src/operations';
import {Vector} from '@datagrok-libraries/utils/src/type-declarations';
import {kendallsTau} from '@datagrok-libraries/statistics/src/correlation-coefficient';
import {
  permuteElements,
  bootstrap,
  permutationImportance,
  Progress,
} from '@datagrok-libraries/statistics/src/cross-validation';

//import os from 'os';
//const coresNumber = os.cpus().length;

export class RegressionAnalysis {
  protected tableGrid: DG.Grid;
  protected view: DG.TableView;
  protected currentDf: DG.DataFrame;
  protected sequencesCol: DG.Column;
  protected activityColumnName: string;
  protected activityScalingMethod: string;
  protected scaledActivity: DG.Column | undefined;
  protected encodedDf: DG.DataFrame | undefined;
  protected progress: Progress;

  constructor(
    tableGrid: DG.Grid,
    view: DG.TableView,
    currentDf: DG.DataFrame,
    sequencesCol: DG.Column,
    activityColumnName: string,
    activityScalingMethod: string,
    progress: Progress,
  ) {
    this.tableGrid = tableGrid;
    this.view = view;
    this.currentDf = currentDf;
    this.sequencesCol = sequencesCol;
    this.activityColumnName = activityColumnName;
    this.activityScalingMethod = activityScalingMethod;
    this.progress = progress;
  }

  public async init() {
    this.scaledActivity = await _scaleColumn(
      this.currentDf.getCol(this.activityColumnName),
      this.activityScalingMethod,
    );

    this.encodedDf = _encodeSequences(this.sequencesCol);

    _insertColumns(
      this.currentDf,
      [DG.Column.fromList('double', `${this.activityColumnName}scaled`, this.scaledActivity.toList())],
    );
    _insertColumns(this.currentDf, this.encodedDf.columns);

    this._addIndividualCorrelationsViewer(this.encodedDf, this.scaledActivity);
  }

  public async assess() {
    const [
      activityPred,
      predErrorsTrue,
      predErrorsRandom,
      fimps,
    ] = await this._buildModel();
    const activityPredName = `${this.activityColumnName}pred`;

    _insertColumns(this.currentDf, [DG.Column.fromList('double', activityPredName, activityPred)]);

    this._addPredictedVsObservedViewer(activityPredName);
    this._addAccuracyViewer(predErrorsTrue, predErrorsRandom);
    this._addFeatureImportancesViewer(fimps);
  }

  protected _addAccuracyViewer(predErrorsTrue: number[], predErrorsRandom: number[]) {
    const errorsDf = DG.DataFrame.fromColumns(
      Array.from([[predErrorsTrue, 'trueAUE'], [predErrorsRandom, 'randomAUE']]).map(
        (v: any[]) => DG.Column.fromFloat32Array(v[1], Float32Array.from(v[0])),
      ),
    );

    this.view.addViewer(errorsDf.unpivot(errorsDf.columns.names(), errorsDf.columns.names(), 'AUE', 'Value').plot.box({
      valueColumnName: 'Value',
      categoryColumnName: 'AUE',
      statistics: [
        'min',
        'max',
        'avg',
        'med',
      ],
    }));
  }

  protected _addFeatureImportancesViewer(fimps: number[][]) {
    const fimpsDf = DG.DataFrame.fromColumns(
      Array.from(fimps).map(
        (v: number[], i: number) => DG.Column.fromFloat32Array(`${i + 1}`, Float32Array.from(v)),
      ),
    );

    this.view.addViewer(
      fimpsDf.unpivot(
        fimpsDf.columns.names(),
        fimpsDf.columns.names(),
        'Position',
        'Importance',
      ).plot.box({
        valueColumnName: 'Importance',
        categoryColumnName: 'Position',
        statistics: [
          'min',
          'max',
          'avg',
          'med',
        ],
      }));
  }

  protected _addIndividualCorrelationsViewer(encDf: DG.DataFrame, activityCol: DG.Column) {
    const corrDf = _measureAssociation(encDf, activityCol);

    this.view.addViewer(corrDf.plot.bar({
      splitColumnName: corrDf.columns.names()[0],
      valueColumnName: corrDf.columns.names()[1],
      colorColumnName: corrDf.columns.names()[2],
      valueAggrType: 'sum',
      barSortType: 'by category',
      barSortOrder: 'asc',
    }));
  }

  protected _addPredictedVsObservedViewer(activityPredName: string) {
    this.view.addViewer(DG.VIEWER.SCATTER_PLOT, {
      xColumnName: this.activityColumnName,
      yColumnName: activityPredName,
      sizeColumnName: activityPredName,
      colorColumnName: this.activityColumnName,
      showRegressionLine: true,
    });
  }

  protected async _buildModel() {
    const nSamples = this.encodedDf!.rowCount;

    assert(this.scaledActivity!.length == nSamples, 'Samples count do not match number of observations.');

    //const nFeatures = features.columns.length;
    const regression = new RandomForestRegressorEstimator({
      nEstimators: 100,
      maxFeatures: 'auto', //Math.round(Math.sqrt(nFeatures)),
      nJobs: 8, //coresNumber,
    });

    const X = new Array(nSamples);
    const y = Array.from(this.scaledActivity!.getRawData());

    for (let i = 0; i < nSamples; ++i) {
      X[i] = Array.from(this.encodedDf!.row(i).cells).map((v: DG.Cell) => v.value);
    }

    await regression.init();
    await regression.train(X, y);
    const pred = await regression.predict(X);
    const RMSD = calculateRMSD(Vector.from(y), Vector.from(pred));
    console.log(RMSD);

    const [fimps, fimpsRaw] = await permutationImportance(X, y, regression);
    console.log(fimps);
    console.log(fimpsRaw);

    const errorsTrue = await bootstrap(X, y, regression, {nRepeats: 10, progress: this.progress});
    const yPermuted = permuteElements(y);
    const errorsRandom = await bootstrap(X, yPermuted, regression, {nRepeats: 10, progress: this.progress});
    return [pred, errorsTrue, errorsRandom, fimpsRaw];
  }
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

class RandomForestRegressorEstimator extends RandomForestRegressor {
  constructor(opts = {}) {
    super(opts);
  }

  public fit(X: any, y: any): void {
    return super.train(X, y);
  }

  public predict(X: any): any {
    return super.predict(X);
  }
}

