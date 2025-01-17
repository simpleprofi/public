import * as DG from 'datagrok-api/dg';

import {drugBankSearchWidget} from './widgets';

export const _package = new DG.Package();

let dbdf: DG.DataFrame;

//tags: init
export async function initDrugBank() {
  dbdf = DG.DataFrame.fromCsv(await _package.files.readAsText('db.csv'));
}

//name: DrugBank Substructure Search
//tags: panel, widgets
//input: string mol {semType: Molecule}
//output: widget result
//condition: true
export async function drugBankSubstructureSearchPanel(mol: string) {
  return drugBankSearchWidget(mol, 'substructure', dbdf);
}

//name: DrugBank Similarity Search
//tags: panel, widgets
//input: string mol {semType: Molecule}
//output: widget result
//condition: true
export async function drugBankSimilaritySearchPanel(mol: string) {
  return drugBankSearchWidget(mol, 'similarity', dbdf);
}

//name: Drug Name Molecule
//meta.role: converter
//meta.inputRegexp: (db\:.+)
//connection: DrugBank
//input: string id
//output: string smiles { semType: Molecule }
export async function drugNameMolecule(id: string) {
  const drugName = id.slice(3);
  for (var i = 0; i < dbdf.rowCount; i++) {
    if (dbdf.get('SYNONYMS', i).toLowerCase().includes(drugName)) {
      return dbdf.get('Smiles', i);
    }
  }
}
