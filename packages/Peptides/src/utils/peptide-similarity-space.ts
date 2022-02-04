/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {PeptideSpaceData, PeptideSpaceDataOptions} from './peptide-space-data';

export class PeptideSimilaritySpaceViewer extends DG.JsViewer {
  protected _inputs: HTMLElement;
  protected _data: PeptideSpaceData;
  protected _viewer: DG.ScatterPlotViewer;
  protected _method: string;
  protected _metrics: string;
  protected _cycles: number;

  /**
   * Creates an instance of PeptideSimilaritySpaceViewer.
   * @param {PeptideSpaceDataOptions} opts Options to control dimensionality reduction.
   */
  constructor(opts: PeptideSpaceDataOptions) {
    super();

    this._data = new PeptideSpaceData(opts);
    this._viewer = DG.Viewer.scatterPlot(this._data.currentTable);
    this._viewer.setOptions(this._data.plotOptions);

    this._method = this.string(
      'Embedding method',
      PeptideSpaceData.availableMethods[0],
      {choices: PeptideSpaceData.availableMethods},
    );
    this._metrics = this.string(
      'Distance metrics',
      PeptideSpaceData.availableMetrics[0],
      {choices: PeptideSpaceData.availableMetrics},
    );
    this._cycles = this.int('Cycles count', 100);

    this._inputs = this._drawInputs();
    //this._viewer.onContextMenu.subscribe((menu) => menu.item('Foo', () => grok.shell.info('Foo!')));
  }

  /**
   * Create the viewer and asynchronously call dimensionality reduction part.
   * @param {PeptideSpaceDataOptions} options Options to hand over to the reducer.
   * @return {Promise<PeptideSimilaritySpaceViewer>} Viewer instance correctly set after the reduction.
   */
  static async create(options: PeptideSpaceDataOptions): Promise<PeptideSimilaritySpaceViewer> {
    const self = new PeptideSimilaritySpaceViewer(options);
    await self.update();
    return self;
  }

  /** Make the viewer redraw. */
  async update() {
    await this._data.init();
    this._viewer.dataFrame?.fireValuesChanged();
  }

  /** Gets called when a table is attached to the viewer. */
  async onTableAttached() {
    await this.update();
  }

  /** Adds UI controls to change the behaviour of the viewer.
   * @return {HTMLElement} Element with controls included.
   */
  protected _drawInputs(): HTMLElement {
    const methodsList = ui.choiceInput('Embedding method', this._data?.currentMethod, PeptideSpaceData.availableMethods,
      async (currentMethod: string) => {
        this._data.currentMethod = currentMethod;
        await this.update();
      },
    );
    methodsList.setTooltip('Embedding method to apply to the dataset.');

    const metricsList = ui.choiceInput('Distance metric', this._data?.currentMetrics, PeptideSpaceData.availableMetrics,
      async (currentMetrics: string) => {
        this._data.currentMetrics = currentMetrics;
        await this.update();
      },
    );
    metricsList.setTooltip('Custom distance metric to pass to the embedding procedure.');

    const cyclesSlider = ui.intInput('Cycles count', this._data!.currentCycles,
      async (currentCycles: number) => {
        this._data.currentCycles = currentCycles;
        await this.update();
      },
    );
    cyclesSlider.setTooltip('Number of cycles affects the embedding quality.');
    return ui.inputs([methodsList, metricsList, cyclesSlider]);
  }

  /** Visual root.
   * @type {HTMLElement} */
  get root(): HTMLElement {
    this._viewer.root.style.width = 'auto';
    return ui.divV([this._viewer.root, this._inputs]);
  }

  /** Gets called when viewer's property is changed.
   * @param {Property} property - or null, if multiple properties were changed. */
  async onPropertyChanged(property: DG.Property | null): Promise<void> {
    super.onPropertyChanged(property);

    if (!property)
      return;

    const value = property.get(this);

    if (property.name === 'Embedding method')
      this._data.currentMethod = value;
    else if (property.name === 'Distance metrics')
      this._data.currentMetrics = value;
    else if (property.name === 'Cycles count')
      this._data.currentCycles = value;

    await this.update();
  }

  get viewer(): DG.ScatterPlotViewer {
    return this._viewer!;
  }

  /** Subscribes on detach event to clone this into the TableView. */
  protected _addDetachedPatch() {
    this.onEvent('d4-viewer-detached').subscribe((args) => {
      this._data.reset();
    });
  }
}
