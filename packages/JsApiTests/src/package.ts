/* Do not change these import lines. Datagrok will import API library in exactly the same manner */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import './dataframe/data_frame';
import './shell/shell';
import './shell/windows';
import './viewer/viewer';
import './dapi/files';
import './dapi/fetch';
import './dapi/admin';
import './dapi/groups';

import {runTests} from "./test";
export let _package = new DG.Package();


//name: test
export async function test() {
  let data = await runTests();
  grok.shell.addTableView(DG.DataFrame.fromObjects(data)!);
}
