import * as DG from 'datagrok-api/dg';

import {getSequenceMolecularWeight} from './molecular-measure';
import {DimensionalityReducer} from '@datagrok-libraries/ml/src/reduce-dimensionality';
import {
  createDimensinalityReducingWorker,
} from '@datagrok-libraries/ml/src/workers/dimensionality-reducing-worker-creator';
import {AlignedSequenceEncoder, SideChainScales} from '@datagrok-libraries/bio/src/sequence-encoder';
import {Measure, StringMetrics} from '@datagrok-libraries/ml/src/typed-metrics';
import {Coordinates} from '@datagrok-libraries/utils/src/type-declarations';
import {randomInt} from '@datagrok-libraries/utils/src/operations';

/** Options to control dimensionality reducing calculations.
 * @interface PeptideSpaceDataOptions
 */
export interface PeptideSpaceDataOptions {
    alignedSequencesColumn: DG.Column;
    activityColumnName?: string;
    method?: string;
    metrics?: string;
    cycles?: number;
  }

/** Performs computations for dimensionality reducing tasks. */
export class PeptideSpaceData {
    static axesNames = ['~X', '~Y', '~MW'];
    static availableMethods = DimensionalityReducer.availableMethods;
    static availableMetrics = Measure.getMetricByDataType('String');
    static emptyCol = DG.Column.fromStrings('', []);

    protected alignedSequencesColumn: DG.Column = PeptideSpaceData.emptyCol;
    protected table: DG.DataFrame = DG.DataFrame.fromColumns([PeptideSpaceData.emptyCol]);
    protected activityColumnName?: string = '';
    protected method: string = '';
    protected metrics: string = '';
    protected cycles: number = 0;
    protected initialized: boolean = false;
    protected needUpdate: boolean = false;

    /** Creates an instance of PeptideSpaceData.
     * @param {PeptideSpaceDataOptions} options Options to control computations.
     */
    constructor(options: PeptideSpaceDataOptions) {
      this.setOptions(options);
      this.reset();
    }

    /** Sets options to control computations.
     * @param {PeptideSpaceDataOptions} options Options to control computations.
     */
    setOptions(options: PeptideSpaceDataOptions) {
      this.alignedSequencesColumn = options.alignedSequencesColumn;
      this.table = this.alignedSequencesColumn.dataFrame;
      this.activityColumnName = options.activityColumnName ?? inferActivityColumnsName(this.table) ?? '';
      this.method = options.method ?? PeptideSpaceData.availableMethods[0];
      this.metrics = options.metrics ?? PeptideSpaceData.availableMetrics[0];
      this.cycles = options.cycles ?? 100;
      this._fastInit();
    }

    /** Reduces dimensionality for given sequences using a simple approach.
     * @param {string[]} sequences Sequences to reduce.
     * @return {DG.Column[]} Reduced coordinates.
     * @memberof PeptideSpaceData
     */
    protected _fastReduce(sequences: string[]): DG.Column[] {
      const embcols = simpleScaleEmbedding(sequences);
      const columns = Array.from(
        embcols as Coordinates,
        (v: Float32Array, k) => (DG.Column.fromFloat32Array(PeptideSpaceData.axesNames[k], v)),
      );
      return columns;
    }

    /** Initializes coordinates and masses via fast approach. */
    protected _fastInit() {
      const sequences = cleanAlignedSequencesColumn(this.alignedSequencesColumn);
      const columns = this._fastReduce(sequences);

      columns.push(
        DG.Column.fromFloat32Array(
          PeptideSpaceData.axesNames[columns.length],
          this._addMolweight(sequences),
        ),
      );
    }

    /** Reduces dimensionality for given sequences.
     * @param {string[]} sequences Sequences to reduce.
     * @return {Promise<DG.Column[]>} Reduced coordinates.
     */
    protected async _reduce(sequences: string[]): Promise<DG.Column[]> {
      const embcols = await createDimensinalityReducingWorker(
        {data: sequences, metric: this.metrics as StringMetrics},
        this.method,
        this.cycles,
      );
      const columns = Array.from(
          embcols as Coordinates,
          (v: Float32Array, k) => (DG.Column.fromFloat32Array(PeptideSpaceData.axesNames[k], v)),
      );
      return columns;
    }

    /** Computes peptides' molecular weight.
     * @param {string[]} sequences Sequences to process.
     * @return {Float32Array} Weights array.
     */
    protected _addMolweight(sequences: string[]): Float32Array {
      const mw: Float32Array = new Float32Array(sequences.length).fill(0);
      let currentSequence;

      for (let i = 0; i < sequences.length; ++i) {
        currentSequence = sequences[i];
        mw[i] = currentSequence == null ? 0 : getSequenceMolecularWeight(currentSequence);
      }
      return mw;
    }

    /** Adds new columns to the given table.
     * @param {DG.Column[]} columns Columns to add.
     */
    protected _addAxes(columns: DG.Column[]) {
      for (const newCol of columns) {
        const axis = newCol.name;
        const col = this.table?.col(axis);

        if (col != null) {
          for (let i = 0; i < newCol.length; ++i)
            this.table?.set(axis, i, newCol.get(i));
        } else
          this.table?.columns.insert(newCol);
      }
    }

    /** Starts calculations if needed.
     * @param {boolean} [force=false] Whether to force update.
     */
    async init(force: boolean = false) {
      if (!this.initialized || this.needUpdate || force) {
        const originalColumnNames = (this.table?.columns as DG.ColumnList).names();
        const [xAxisName, yAxisName, mwAxisName] = PeptideSpaceData.axesNames;
        const coordAxesExist = [xAxisName, yAxisName].every((v) => originalColumnNames.includes(v));
        const mwAxisExists = originalColumnNames.includes(mwAxisName);
        let sequences: string[] = [];
        let columns: DG.Column[] = [];

        if (this.needUpdate || force || !coordAxesExist) {
          sequences = cleanAlignedSequencesColumn(this.alignedSequencesColumn);
          columns = await this._reduce(sequences);
        }

        if (force || !mwAxisExists) {
          if (sequences.length == 0)
            sequences = cleanAlignedSequencesColumn(this.alignedSequencesColumn);

          columns.push(
            DG.Column.fromFloat32Array(
              PeptideSpaceData.axesNames[columns.length],
              this._addMolweight(sequences),
            ),
          );
        }

        this._addAxes(columns);
        this.initialized = true;
        this.needUpdate = false;
      }
    }

    /** Removes calculated columns from the current table.
     * @param {boolean} [update=false]
     */
    protected _clearColumns(update: boolean = false) {
      const columns = (this.table.columns as DG.ColumnList);

      if (!columns)
        return;

      const axesNames = PeptideSpaceData.axesNames;
      const toConsider = update ? axesNames.slice(0, -1) : axesNames;
      const names = columns.names();

      for (const name of toConsider) {
        if (name in names)
          columns.remove(name);
      }
    }

    /** Cleans data. */
    reset() {
      if (this.initialized) {
        this._clearColumns();
        this.initialized = false;
        this.needUpdate = false;
      }
    }

    /** Flags that coordinates update is needed. */
    protected _markUpdate() {
      this._clearColumns(true);
      this.needUpdate = true;
    }

    /**
     * Returns options to control scatter plot visualization.
     * @param {boolean} [title=false] Whether to add title to a scatter plot.
     * @return {*} Scatter plot options.
     */
    plotOptions(title = false) {
      return {
        x: PeptideSpaceData.axesNames[0],
        y: PeptideSpaceData.axesNames[1],
        color: this.activityColumnName ?? PeptideSpaceData.axesNames[2],
        size: PeptideSpaceData.axesNames[2],
        title: title ? 'Peptide space' : undefined,
      };
    }

    /** Returns current reducing method. */
    get currentMethod() {
      return this.method;
    }

    /** Sets current reducing method.
     * @param {string} method Method to set.
     */
    set currentMethod(method: string) {
      this.method = method;
      this._markUpdate();
    }

    /** Returns current distance metrics. */
    get currentMetrics() {
      return this.metrics;
    }

    /** Sets current distance metrics.
     * @param {string} metrics Metrics to set.
     */
    set currentMetrics(metrics: string) {
      this.metrics = metrics;
      this._markUpdate();
    }

    /** Returns current number of reducer iterations. */
    get currentCycles() {
      return this.cycles;
    }

    /** Sets current number of reducer iterations.
     * @param {number} cycles Number of iterations to set.
     */
    set currentCycles(cycles: number) {
      this.cycles = cycles;
      this._markUpdate();
    }

    /** Returns current table. */
    get currentTable() {
      return this.table;
    }
}

/**
 * Finds a column with an activity.
 *
 * @param {DG.DataFrame} table The data frame to search for.
 * @return {(string | undefined)} Column name or undefined if not found.
 */
export function inferActivityColumnsName(table: DG.DataFrame): string | undefined {
  const re = /activity|ic50/i;
  for (const name of table.columns.names()) {
    if (name.match(re))
      return name;
  }
  return undefined;
}

/** Casts an aligned sequences column to clean sequences.
     * @param {DG.Column} col Column to process.
     * @return {Array<string>} Clean sequences array.
     */
export function cleanAlignedSequencesColumn(col: DG.Column): Array<string> {
  return col.toList().map((v, _) => AlignedSequenceEncoder.clean(v));
}

/**
 * Reduce sequences using a naive approach.
 * @param {string[]} seqs Sequences to reduce.
 * @return {Float32Array[]} Reduced sequences.
 */
function simpleScaleEmbedding(seqs: string[]): Float32Array[] {
  const scale = SideChainScales.scales['WimleyWhite'];
  const seqLen = seqs[0].length;
  const seqsCount = seqs.length;
  const pos = [randomInt(seqLen), randomInt(seqLen)];

  while (pos[1] == pos[0])
    pos[0] = randomInt(seqLen);

  const coords = pos.map((v) => new Float32Array(seqsCount).fill(0).map((_, i) => (scale[seqs[i][v]])));
  return coords;
}

// eslint-disable-next-line no-unused-vars
function simpleScoreEmbedding(seqs: string[]) {
  const scale = SideChainScales.scales['WimleyWhite'];
  const seqLen = seqs[0].length;
  const seqsCount = seqs.length;
  const center = Math.round(seqLen / 2);
  const pos = [randomInt(seqLen), randomInt(seqLen)];

  while (pos[1] == pos[0])
    pos[0] = randomInt(seqLen);

  function score_(s: string, index: number): number {
    let sum = 1;
    for (const c of s.slice(index == 0 ? 0 : center, index == 0 ? center : -1))
      sum *= scale[c] + 1;
    return sum;
  }

  const coords = pos.map((v) => new Float32Array(seqsCount).fill(0).map((_, i) => (score_(seqs[i], i))));
  return coords;
}
