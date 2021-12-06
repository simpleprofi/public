import * as ui from 'datagrok-api/ui';
import * as grok from 'datagrok-api/grok';
import * as DG from 'datagrok-api/dg';
import { mcsgetter } from '../scripts-api';

/**
 * Finds most common substructure in molecules column and adds to dataframe.
 * @export
 * @param {DG.Column} Whether to fit view.
 */
export async function findMCS(col: DG.Column): Promise<void>{
  if(col.length >= 100000){
    grok.shell.error("Number of sructures exceeeds 100000");
    return;
  }

  let pi = DG.TaskBarProgressIndicator.create('Estimating MCS');
  let mcs: string = await mcsgetter(col.name, col.dataFrame);
  let name = getName("MCS", col.dataFrame.columns.names());
  let mcsCol = DG.Column.fromList("string", name, new Array(col.length).fill(mcs));
  mcsCol.semType = "molecule";
  col.dataFrame.columns.add(mcsCol);
  pi.close();
}

function getName(initialName: string, existingNames: string[]){
  if(!existingNames.includes(initialName)){
    return initialName;
  } else{
    let counter: number = 1;
    let newName: string = (' ' + initialName + '_' + counter).slice(1);
    while(existingNames.includes(newName)){
      counter++;
      newName = (' ' + initialName + '_' + counter).slice(1);
    }

    return newName;
  }
}