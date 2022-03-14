import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import * as OCL from 'openchemlib/full.js';

let sketcherId = 0;

export class OpenChemLibSketcher extends grok.chem.SketcherBase {
  // @ts-ignore
  _sketcher: OCL.StructureEditor;

  constructor() {
    super();
  }

  async init() {
    let id = `ocl-sketcher-${sketcherId++}`;
    this.root.id = id;

    let sketcherConentDiv =  document.querySelectorAll("div.ui-div > div.grok-sketcher.ui-box");
    if (sketcherConentDiv[0])
      sketcherConentDiv[0].setAttribute("style", "width: 335; height: 350;");
     this._sketcher = OCL.StructureEditor.createSVGEditor(id, 1);
    this._sketcher.setChangeListenerCallback((id: any, molecule: any) => {
      this.onChanged.next(null);
    });
  }
  
  get supportedExportFormats() {
    return ['smiles', 'mol'];
  }

  get smiles() { return this._sketcher ? this._sketcher.getSmiles() : ''; }
  set smiles(s) { this._sketcher?.setSmiles(s); }

  get molFile() { return this._sketcher ? this._sketcher.getMolFile() : ''; }
  set molFile(s) { this._sketcher?.setMolFile(s); }
  
  detach() {
    console.log('OCL sketcher detached');
    super.detach();
  }
}