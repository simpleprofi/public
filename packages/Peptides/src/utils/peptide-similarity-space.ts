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
  protected _initialized: boolean = false;

  /** Creates an instance of PeptideSimilaritySpaceViewer. */
  constructor() {
    super();

    const emptyDF = DG.DataFrame.fromColumns([
      DG.Column.fromList('double', '~X', [0]),
      DG.Column.fromList('double', '~Y', [0]),
    ]);

    this._data = new PeptideSpaceData({});
    this._viewer = DG.Viewer.scatterPlot(emptyDF);

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
  }

  /** Initializes the viewer.
  * @param {PeptideSpaceDataOptions} options Options for reducer calculations.
  */
  async init(options: PeptideSpaceDataOptions): Promise<PeptideSimilaritySpaceViewer> {
    this._data.setOptions(options);
    //this.root.removeChild(this._viewer.root);
    this._viewer.dataFrame = this._data.currentTable;
    //this._viewer = DG.Viewer.scatterPlot(this._data.currentTable);
    //this.root.appendChild(this._viewer.root);
    this._initialized = true;

    await this._redraw();

    this._viewer.setOptions(this._data.plotOptions);
    //this.dataFrame?.fireValuesChanged();
    //this._viewer.onContextMenu.subscribe((menu) => menu.item('Foo', () => grok.shell.info('Foo!')));
    return this;
  }

  /** Make the viewer redraw. */
  protected async _redraw() {
    if (!this._initialized) {
      const detected = (this.dataFrame?.columns as DG.ColumnList).bySemType('alignedSequence');
      this.init({alignedSequencesColumn: detected!});
    }
    await this._data?.init();
    this._viewer?.dataFrame?.fireValuesChanged();
  }

  /** Gets called when a table is attached to the viewer. */
  async onTableAttached() {
    console.log(['onTableAttached', this.view, this.dataFrame, this.table]);
    // eslint-disable-next-line max-len
    // this.subs.push(DG.debounce(this.dataFrame!.selection.onChanged, 50).subscribe(async (_) => await this._redraw()));
    // this.subs.push(DG.debounce(this.dataFrame!.filter.onChanged, 50).subscribe(async (_) => await this._redraw()));
    // this.subs.push(DG.debounce(ui.onSizeChanged(this.root), 50).subscribe(async (_) => await this._redraw()));
    await this._redraw();
  }

  /** Adds UI controls to change the behaviour of the viewer.
   * @return {HTMLElement} Element with controls included.
   */
  protected _drawInputs(): HTMLElement {
    const methodsList = ui.choiceInput('Embedding method', this._data?.currentMethod, PeptideSpaceData.availableMethods,
      async (currentMethod: string) => {
        this._data!.currentMethod = currentMethod;
        await this._redraw();
      },
    );
    methodsList.setTooltip('Embedding method to apply to the dataset.');

    const metricsList = ui.choiceInput('Distance metric', this._data?.currentMetrics, PeptideSpaceData.availableMetrics,
      async (currentMetrics: string) => {
        this._data!.currentMetrics = currentMetrics;
        await this._redraw();
      },
    );
    metricsList.setTooltip('Custom distance metric to pass to the embedding procedure.');

    const cyclesSlider = ui.intInput('Cycles count', this._data!.currentCycles,
      async (currentCycles: number) => {
        this._data!.currentCycles = currentCycles;
        await this._redraw();
      },
    );
    cyclesSlider.setTooltip('Number of cycles affects the embedding quality.');
    return ui.inputs([methodsList, metricsList, cyclesSlider]);
  }

  /** Visual root.
   * @type {HTMLElement} */
  get root(): HTMLElement {
    if (!this._viewer || !this._inputs)
      return ui.divV([ui.divText('Was not initialized.')]);

    console.log(['root', (this._viewer.dataFrame?.columns as DG.ColumnList).length]);

    this._viewer.root.style.width = 'auto';
    return ui.divV([this._viewer.root, this._inputs]);
  }

  /** Gets called when viewer's property is changed.
   * @param {Property} property - or null, if multiple properties were changed. */
  async onPropertyChanged(property: DG.Property | null): Promise<void> {
    super.onPropertyChanged(property);
    console.log(['onPropertyChanged', property]);

    if (!property)
      return;

    const value = property.get(this);

    console.log(['property.get(this)', value, this]);

    if (property.name === 'Embedding method')
      this._data!.currentMethod = value;
    else if (property.name === 'Distance metrics')
      this._data!.currentMetrics = value;
    else if (property.name === 'Cycles count')
      this._data!.currentCycles = value;

    await this._redraw();
  }

  get viewer(): DG.ScatterPlotViewer {
    return this._viewer!;
  }

  /** Subscribes on detach event to clone this into the TableView. */
  protected _addDetachedPatch() {
    this.onEvent('d4-viewer-detached').subscribe((args) => {
      this._data?.reset();
    });
  }
}
