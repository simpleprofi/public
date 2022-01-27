/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
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

/** Casts an aligned sequences column to clean sequences.
 * @param {DG.Column} col Column to process.
 * @return {Array<string>} Clean sequences array.
 */
export function cleanAlignedSequencesColumn(col: DG.Column): Array<string> {
  return col.toList().map((v, _) => AlignedSequenceEncoder.clean(v));
}

/** Options to control dimensionality reducing calculations.
 * @interface PeptideSpaceDataOptions
 */
interface PeptideSpaceDataOptions {
  alignedSequencesColumn: DG.Column;
  activityColumnName?: string;
  method?: string;
  metrics?: string;
  cycles?: number;
}

/** Performs computations for dimensionality reducing tasks. */
export class PeptideSpaceData {
  public axesNames = ['~X', '~Y', '~MW'];
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

  /** Creates an instance of PeptideSpaceData.
   * @param {PeptideSpaceDataOptions} options Options to control computations.
   */
  constructor(options: PeptideSpaceDataOptions) {
    this.table = options.alignedSequencesColumn.dataFrame;
    this.alignedSequencesColumn = options.alignedSequencesColumn;
    this.activityColumnName = options.activityColumnName ?? inferActivityColumnsName(this.table);
    this.method = options.method ?? this.availableMethods[0];
    this.metrics = options.metrics ?? this.availableMetrics[0];
    this.cycles = options.cycles ?? 100;
    this.reset();
  }

  /** Reduces dimensionality for given sequences.
   * @param {string[]} sequences Sequences to reduce.
   * @return {Promise<DG.Column[]>} Reduced coordinates.
   */
  protected async _reduce(sequences: string[]): Promise<DG.Column[]> {
    const embcols = await createDimensinalityReducingWorker(sequences, this.method, this.metrics, this.cycles);
    const columns = Array.from(
        embcols as Coordinates,
        (v: Float32Array, k) => (DG.Column.fromFloat32Array(this.axesNames[k], v)),
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
      const col = this.table.col(axis);

      if (col != null) {
        for (let i = 0; i < newCol.length; ++i)
          this.table.set(axis, i, newCol.get(i));
      } else
        this.table.columns.insert(newCol);
    }
  }

  /** Starts calculations if needed.
   * @param {boolean} [force=false] Whether to force update.
   */
  async init(force: boolean = false) {
    if (!this.initialized || this.needUpdate || force) {
      const originalColumnNames = (this.table.columns as DG.ColumnList).names();
      const [xAxisName, yAxisName, mwAxisName] = this.axesNames;
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
            this.axesNames[columns.length],
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
    const toConsider = update ? this.axesNames.slice(0, this.axesNames.length - 1) : this.axesNames;

    for (const name of toConsider) {
      if (name in columns.names)
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

  /** Returns known reducing methods. */
  get methods() {
    return this.availableMethods;
  }

  /** Returns known distance metrics. */
  get metrices() {
    return this.availableMetrics;
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

  /** Returns options to control scatter plot visualization. */
  get plotOptions() {
    return {
      x: this.axesNames[0],
      y: this.axesNames[1],
      color: this.activityColumnName ?? this.axesNames[2],
      size: this.axesNames[2],
    };
  }
}

/** Scatter plot which can interactively calculate and show dimensionality reduced peptide space. */
export class PeptideSimilaritySpaceViewer extends DG.ScatterPlotViewer {
  protected _data: PeptideSpaceData;
  protected _inputs: HTMLElement;
  protected _type = 'peptide-similarity-space';
  protected _method: string;
  protected _metrics: string;
  protected _cycles: string;

  /** Creates an instance of PeptideSimilaritySpaceViewer.
   * @param {*} dart An object to integrate.
   * @param {PeptideSpaceDataOptions} options Options for reducer calculations.
   */
  constructor(dart: any, options: PeptideSpaceDataOptions) {
    super(dart);
    this._data = new PeptideSpaceData(options);
    this._inputs = this._drawInputs();
    //this._addDetachedPatch();
    this._method = this.addProperty(
      'Embedding method',
      'string',
      this._data.methods[0],
      {choices: this._data.methods} as {},
    );
    this._metrics = this.addProperty(
      'Distance metrics',
      'string',
      this._data.metrices[0],
      {choices: this._data.metrices} as {},
    );
    this._cycles = this.addProperty('Cycles count', 'int', 100);
  }

  /** Creates the viewer.
   * @param {DG.DataFrame} t Data frame to use.
   * @param {PeptideSpaceDataOptions} opts Options controlling reducer calculations.
   * @param {(object | null)} [options] Options for scatter plot.
   * @return {Promise<PeptideSimilaritySpaceViewer>} Viewer instance.
   */
  static async create(
    t: DG.DataFrame,
    opts: PeptideSpaceDataOptions,
    options?: object | null,
  ): Promise<PeptideSimilaritySpaceViewer> {
    const plot = new PeptideSimilaritySpaceViewer(api.grok_Viewer_ScatterPlot(t.dart, _toJson(options)), opts);
    await plot.init();
    return plot;
  }

  /** Initializes the viewer. */
  async init() {
    await this._redraw();
    this.setOptions(this._data.plotOptions);
  }

  /** Make the viewer redraw. */
  protected async _redraw() {
    await this._data.init();
    this.dataFrame?.fireValuesChanged();
  }

  /** Adds UI controls to change the behaviour of the viewer.
   * @return {HTMLElement} Element with controls included.
   */
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

  /** Fires when a table is attached.
   * @param {DG.DataFrame} dataFrame Table.
   */
  async onFrameAttached(dataFrame: DG.DataFrame): Promise<void> {
    super.onFrameAttached(dataFrame);
    await this._data.init(true);
  }

  /** Gets called when a widget is detached and will no longer be used. Typically used for unsubscribing from events.
   * Be sure to call super.detach() if this method is overridden.  */
  detach(): void {
    super.detach();
    this._data.reset();
  }

  /** Visual root.
   * @type {HTMLElement} */
  get root(): HTMLElement {
    super.root.style.width = 'auto';
    return ui.divV([super.root, this._inputs]);
  }

  /** Subscribes on detach event to clone this into the TableView. */
  protected _addDetachedPatch() {
    this.onEvent('d4-viewer-detached').subscribe((args) => {
      let yetExists = false;
      const view = this.view ?? this.dart.view ?? grok.shell.v;

      for (const v of view.viewers) {
        const opts = v.getOptions() as {[name: string]: any};

        if (opts.type == 'Scatter plot' && opts.look.xColumnName == '~X' && opts.look.yColumnName == '~Y')
          yetExists = true;
      }

      if (!yetExists && view && typeof view.addViewer === 'function')
        view.addViewer(this);
    });
  }

  /** Gets called when viewer's property is changed.
   * @param {Property} property - or null, if multiple properties were changed. */
  async onPropertyChanged(property: DG.Property | null): Promise<void> {
    super.onPropertyChanged(property);
    console.log(['onPropertyChanged', property]);

    if (!property)
      return;

    const value = property.get(this);

    if (property.name === 'Embedding method')
      this._data.currentMethod = value;
    else if (property.name === 'Distance metrics')
      this._data.currentMetrics = value;
    else if (property.name === 'Cycles count')
      this._data.currentCycles = value;

    await this._redraw();
  }
}
