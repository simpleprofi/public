/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import {chemblSearchWidget} from './widget';

export const _package = new DG.Package();

//name: Chembl Get by Id
//input: string id
//output: dataframe result
export async function getById(id: string): Promise<DG.DataFrame | null> {
  if (!id.toLowerCase().startsWith('chembl'))
    id = 'CHEMBL' + id;
  return await grok.data.query(`${_package.name}:MoleculeJson`, {'molecule_chembl_id__exact': id});
}

//name: Chembl Substructure Search
//tags: panel, widgets
//input: string molString {semType: Molecule}
//output: widget result
//condition: true
export async function ChemblSubstructureSearchPanel(molString: string): Promise<DG.Widget> {
  return await chemblSearchWidget(molString, 'substructure');
}

//name: Chembl Similarity Search
//tags: panel, widgets
//input: string molString {semType: Molecule}
//output: widget result
//condition: true
export async function ChemblSimilaritySearchPanel(molString: string): Promise<DG.Widget> {
  return await chemblSearchWidget(molString, 'similarity');
}
