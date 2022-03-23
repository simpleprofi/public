/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
//import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {Presenter, External} from './presenter/base';
import {genItems} from './utils/sequence-generator';

export const _package = new DG.Package();

//name: main
export function main() {
  const properties = [
    DG.Property.jsString('Sequence'),
    DG.Property.jsFloat('IC50'),
  ];

  const grid = DG.Grid.fromProperties(genItems(), properties);
  const view = grok.shell.addTableView(grid.dataFrame!);

  const options: External = {
    view: view,
    grid: grid,
    sequencesColumnName: properties[0].name,
    activityColumnName: properties[1].name,
  };

  init(options);
}

function init(options: External) {
  const presenter = new Presenter(options);
}
