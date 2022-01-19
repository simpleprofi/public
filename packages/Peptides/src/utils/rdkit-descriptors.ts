//import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';

import {peptideToSMILES} from '../widgets/peptide-molecule';

export async function calcDescriptors(peptides: DG.Column): Promise<DG.Column> {
  const SMILESs: string[] = [];

  const startTime = performance.now();

  for (let i = 0; i < peptides.length; ++i) {
    SMILESs[i] = peptideToSMILES(peptides.get(i));
  }

  const endTime = performance.now();
  const timeDiff = endTime - startTime; //in ms

  console.log(`timeDiff: ${timeDiff / peptides.length}`);

  return DG.Column.fromStrings(`${peptides.name}Mol`, SMILESs);
}
