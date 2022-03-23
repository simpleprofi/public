/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
//import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import {randomFloat, randomInt} from '@datagrok-libraries/utils/src/random';
import {Presenter, External} from './presenter/base';

export const _package = new DG.Package();

interface GridRow {
  Sequence: string,
  IC50: number,
}

function genSequence(alphabet = 'ACDEFGHIKLMNPQRSTVWY-', length = 15): string {
  const alphaLength = alphabet.length;
  let seq = '';

  for (let i = 0; i < length; ++i) {
    seq += alphabet[randomInt(alphaLength)];
  }
  return seq;
}

function genItems(count = 500, activity = 5): GridRow[] {
  const items: GridRow[] = [];

  for (let i = 0; i < count; ++i) {
    items.push({Sequence: genSequence(), IC50: randomFloat(activity)});
  }
  return items;
}

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
