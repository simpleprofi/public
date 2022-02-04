import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

export async function chemblSubstructureSearch(molString: string): Promise<DG.DataFrame> {
  let df: DG.DataFrame = await grok.data.query('Chemblapi:SubstructureSmiles', {'smile': molString});
  df = df.clone(null, ['canonical_smiles', 'molecule_chembl_id']);
  return df;
}

export async function chemblSimilaritySearch(molString: string): Promise<DG.DataFrame> {
  let df: DG.DataFrame = await grok.data.query('Chemblapi:SimilaritySmilesScore', {'smile': molString, 'score': 40});
  df = df.clone(null, ['canonical_smiles', 'molecule_chembl_id']);
  return df;
}
