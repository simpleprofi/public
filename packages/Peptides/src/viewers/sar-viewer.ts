import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import $ from 'cash-dom';
import {PeptidesController} from '../peptides';
import * as C from '../utils/constants';

let IS_PROPERTY_CHANGING = false;

export class SARViewerBase extends DG.JsViewer {
  viewerGrid!: DG.Grid;
  sourceGrid!: DG.Grid;
  controller!: PeptidesController;
  scaling: string;
  filterMode: boolean;
  bidirectionalAnalysis: boolean;
  grouping: boolean;
  showSubstitution: boolean;
  maxSubstitutions: number;
  activityLimit: number;
  _titleHost = ui.divText('SAR Viewer', {id: 'pep-viewer-title'});
  initialized = false;
  isPropertyChanging: boolean = false;

  constructor() {
    super();

    this.scaling = this.string('scaling', 'none', {choices: ['none', 'lg', '-lg']});
    this.filterMode = this.bool('filterMode', false);
    this.bidirectionalAnalysis = this.bool('bidirectionalAnalysis', false);
    this.grouping = this.bool('grouping', false);

    this.showSubstitution = this.bool('showSubstitution', false);
    this.maxSubstitutions = this.int('maxSubstitutions', 1);
    this.activityLimit = this.float('activityLimit', 2);
  }

  async onTableAttached() {
    this.sourceGrid = this.view?.grid ?? (grok.shell.v as DG.TableView).grid;
    this.controller = await PeptidesController.getInstance(this.dataFrame!);

    this.subs.push(this.controller!.onGroupMappingChanged.subscribe(() => {this.render(true);}));
  }

  detach() {this.subs.forEach((sub) => sub.unsubscribe());}

  render(refreshOnly = false) {
    if (!this.initialized)
      return;
    if (!refreshOnly) {
      $(this.root).empty();
      const viewerRoot = this.viewerGrid!.root;
      viewerRoot.style.width = 'auto';
      this.root.appendChild(ui.divV([this._titleHost, viewerRoot]));
    }
    this.viewerGrid?.invalidate();
  }

  async onPropertyChanged(property: DG.Property) {
    if (!this.initialized || IS_PROPERTY_CHANGING)
      return;

    super.onPropertyChanged(property);
    const propName = property.name;

    if (propName === 'scaling' && typeof this.dataFrame !== 'undefined') {
      const minActivity = this.dataFrame.getCol(C.COLUMNS_NAMES.ACTIVITY).stats.min;
      if (minActivity && minActivity <= 0 && this.scaling !== 'none') {
        grok.shell.warning(`Could not apply ${this.scaling}: ` +
          `activity column ${C.COLUMNS_NAMES.ACTIVITY} contains zero or negative values, falling back to 'none'.`);
        property.set(this, 'none');
        return;
      }
    }

    if (!this.showSubstitution && ['maxSubstitutions', 'activityLimit'].includes(propName))
      return;

    await this.controller!.updateData(this.scaling, this.sourceGrid!, this.bidirectionalAnalysis, this.grouping,
      this.activityLimit, this.maxSubstitutions, this.showSubstitution, this.filterMode);
    this.render(true);
  }
}

/**
 * Structure-activity relationship viewer.
 */
export class SARViewer extends SARViewerBase {
  _titleHost = ui.divText('Monomer-Positions', {id: 'pep-viewer-title'});
  _name = 'Structure-Activity Relationship';

  constructor() { super(); }

  get name() {return this._name;}

  async onTableAttached() {
    await super.onTableAttached();
    this.viewerGrid = this.controller.sarGrid;

    this.subs.push(this.controller!.onSARGridChanged.subscribe((data) => {
      this.viewerGrid = data;
      this.render();
    }));

    this.initialized = true;
    this.render();
  }

  async onPropertyChanged(property: DG.Property): Promise<void> {
    if (!this.initialized || IS_PROPERTY_CHANGING)
      return;

    await super.onPropertyChanged(property);
    IS_PROPERTY_CHANGING = true;
    this.controller.syncProperties(true);
    IS_PROPERTY_CHANGING = false;
  }
}

/**
 * Vertical structure activity relationship viewer.
 */
export class SARViewerVertical extends SARViewerBase {
  protected _name = 'Sequence-Activity relationship';
  _titleHost = ui.divText('Most Potent Residues', {id: 'pep-viewer-title'});

  constructor() {
    super();
  }

  get name() {return this._name;}

  async onPropertyChanged(property: DG.Property): Promise<void> {
    if (!this.initialized || IS_PROPERTY_CHANGING)
      return;

    await super.onPropertyChanged(property);
    IS_PROPERTY_CHANGING = true;
    this.controller.syncProperties(false);
    IS_PROPERTY_CHANGING = false;
  }

  async onTableAttached() {
    await super.onTableAttached();

    this.viewerGrid = this.controller.sarVGrid;
    this.subs.push(this.controller.onSARVGridChanged.subscribe((data) => {
      this.viewerGrid = data;
      this.render();
    }));

    this.initialized = true;
    this.render();
  }
}
