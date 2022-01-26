/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {_toJson} from 'datagrok-api/src/utils';

import {getSequenceMolecularWeight} from './molecular-measure';
import {AlignedSequenceEncoder} from '@datagrok-libraries/bio/src/sequence-encoder';
import {DimensionalityReducer} from '@datagrok-libraries/ml/src/reduce-dimensionality';
import {
  createDimensinalityReducingWorker,
} from '@datagrok-libraries/ml/src/workers/dimensionality-reducing-worker-creator';
import {StringMeasure} from '@datagrok-libraries/ml/src/string-measure';
import {Coordinates} from '@datagrok-libraries/utils/src/type-declarations';

const api = <any>window;

/**
 * Finds a column with an activity.
 *
 * @param {DG.DataFrame} table The data frame to search for.
 * @return {(string | undefined)} Column name or undefined if not found.
 */
function inferActivityColumnsName(table: DG.DataFrame): string | undefined {
  const re = /activity|ic50/i;
  for (const name of table.columns.names()) {
    if (name.match(re))
      return name;
  }
  return undefined;
}

/**
 * Cast an aligned sequences column to clean sequences.
 *
 * @export
 * @param {DG.Column} col Column to process.
 * @return {Array<string>} Clean sequences array.
 */
export function cleanAlignedSequencesColumn(col: DG.Column): Array<string> {
  return col.toList().map((v, _) => AlignedSequenceEncoder.clean(v));
}

interface PeptideSpaceDataOptions {
  alignedSequencesColumn: DG.Column;
  activityColumnName?: string;
  method?: string;
  metrics?: string;
  cycles?: number;
}

class PeptideSpaceData {
  protected axesNames = ['~X', '~Y', '~MW'];
  protected availableMethods = DimensionalityReducer.availableMethods;
  protected availableMetrics = StringMeasure.getMetricByDataType('String');
  protected table: DG.DataFrame;
  protected alignedSequencesColumn: DG.Column;
  protected activityColumnName?: string;
  protected method: string;
  protected metrics: string;
  protected cycles: number;
  protected initialized: boolean = false;
  protected needUpdate: boolean = false;

  constructor(options: PeptideSpaceDataOptions) {
    this.table = options.alignedSequencesColumn.dataFrame;
    this.alignedSequencesColumn = options.alignedSequencesColumn;
    this.activityColumnName = options.activityColumnName ?? inferActivityColumnsName(this.table);
    this.method = options.method ?? this.availableMethods[0];
    this.metrics = options.metrics ?? this.availableMetrics[0];
    this.cycles = options.cycles ?? 100;
    this.reset();
  }

  protected async _reduce(sequences: string[]): Promise<DG.Column[]> {
    const embcols = await createDimensinalityReducingWorker(sequences, this.method, this.metrics, this.cycles);
    const columns = Array.from(
        embcols as Coordinates,
        (v: Float32Array, k) => (DG.Column.fromFloat32Array(this.axesNames[k], v)),
    );
    return columns;
  }

  protected _addMolweight(sequences: string[]): Float32Array {
    const mw: Float32Array = new Float32Array(sequences.length).fill(0);
    let currentSequence;

    for (let i = 0; i < sequences.length; ++i) {
      currentSequence = sequences[i];
      mw[i] = currentSequence == null ? 0 : getSequenceMolecularWeight(currentSequence);
    }
    return mw;
  }

  protected _addAxes(columns: DG.Column[]) {
    const edf = DG.DataFrame.fromColumns(columns);

    for (const axis of this.axesNames) {
      const col = this.table.col(axis);
      const newCol = edf.getCol(axis);

      if (col != null) {
        for (let i = 0; i < newCol.length; ++i) {
          const v = newCol.get(i);
          this.table.set(axis, i, v);
        }
      } else
        this.table.columns.insert(newCol);
    }
  }

  async init(force: boolean = false) {
    if (!this.initialized || this.needUpdate || force) {
      const sequences = cleanAlignedSequencesColumn(this.alignedSequencesColumn);
      const columns = await this._reduce(sequences);

      if (!this.needUpdate) {
        const mw = this._addMolweight(sequences);
        columns.push(DG.Column.fromFloat32Array(this.axesNames[columns.length], mw));
      }

      this._addAxes(columns);
      this.initialized = true;
      this.needUpdate = false;
    }
  }

  protected _clearColumns(update: boolean = false) {
    const columns = (this.table.columns as DG.ColumnList);
    const toConsider = update ? this.axesNames.slice(0, this.axesNames.length - 1) : this.axesNames;

    for (const name of toConsider) {
      if (name in columns.names)
        columns.remove(name);
    }
  }

  reset() {
    if (this.initialized) {
      this._clearColumns();
      this.initialized = false;
      this.needUpdate = false;
    }
  }

  protected _markUpdate() {
    this._clearColumns(true);
    this.needUpdate = true;
  }

  get methods() {
    return this.availableMethods;
  }

  get metrices() {
    return this.availableMetrics;
  }

  get currentMethod() {
    return this.method;
  }

  set currentMethod(method: string) {
    this.method = method;
    this._markUpdate();
  }

  get currentMetrics() {
    return this.metrics;
  }

  set currentMetrics(metrics: string) {
    this.metrics = metrics;
    this._markUpdate();
  }

  get currentCycles() {
    return this.cycles;
  }

  set currentCycles(cycles: number) {
    this.cycles = cycles;
    this._markUpdate();
  }

  get plotOptions() {
    return {
      x: this.axesNames[0],
      y: this.axesNames[1],
      color: this.activityColumnName ?? this.axesNames[2],
      size: this.axesNames[2],
    };
  }
}

export class PeptideSimilaritySpaceViewer extends DG.ScatterPlotViewer {
  protected _data: PeptideSpaceData;
  protected _inputs: HTMLElement;

  constructor(dart: any, options: PeptideSpaceDataOptions) {
    super(dart);
    this._data = new PeptideSpaceData(options);
    this._inputs = this._drawInputs();
    //this._addDetachedPatch();
  }

  static async create(
    t: DG.DataFrame,
    opts: PeptideSpaceDataOptions,
    options?: object | null,
  ): Promise<PeptideSimilaritySpaceViewer> {
    const plot = new PeptideSimilaritySpaceViewer(api.grok_Viewer_ScatterPlot(t.dart, _toJson(options)), opts);
    await plot.init();
    return plot;
  }

  async init() {
    this.setOptions(this._data.plotOptions);
    await this._redraw();
  }

  protected async _redraw() {
    await this._data.init();
    //this.root.lastChild?.remove();
    //this.root.appendChild(this.root);
    this.dataFrame?.fireValuesChanged();
  }

  protected _drawInputs(): HTMLElement {
    const methodsList = ui.choiceInput('Embedding method', this._data.currentMethod, this._data.methods,
      async (currentMethod: string) => {
        this._data.currentMethod = currentMethod;
        await this._redraw();
      },
    );
    methodsList.setTooltip('Embedding method to apply to the dataset.');

    const metricsList = ui.choiceInput('Distance metric', this._data.currentMetrics, this._data.metrices,
      async (currentMetrics: string) => {
        this._data.currentMetrics = currentMetrics;
        await this._redraw();
      },
    );
    metricsList.setTooltip('Custom distance metric to pass to the embedding procedure.');

    const cyclesSlider = ui.intInput('Cycles count', this._data.currentCycles,
      async (currentCycles: number) => {
        this._data.currentCycles = currentCycles;
        await this._redraw();
      },
    );
    cyclesSlider.setTooltip('Number of cycles affects the embedding quality.');
    return ui.inputs([methodsList, metricsList, cyclesSlider]);
  }

  async onFrameAttached(dataFrame: DG.DataFrame): Promise<void> {
    super.onFrameAttached(dataFrame);
    await this._data.init();
  }

  detach(): void {
    super.detach();
    this._data.reset();
  }

  get root(): HTMLElement {
    super.root.style.width = 'auto';
    return ui.divV([super.root, this._inputs]);
  }

  protected _addDetachedPatch() {
    this.onEvent('d4-viewer-detached').subscribe((args) => {
      let found = false;

      for (const v of this.view.viewers) {
        const opts = v.getOptions() as {[name: string]: any};

        if (opts.type == 'Scatter plot' && opts.look.xColumnName == '~X' && opts.look.yColumnName == '~Y')
          found = true;
      }

      if (!found)
        this.view.addViewer(this);
    });
  }
}
