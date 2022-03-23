/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export const _package = new DG.Package();

//name: test
export function test() {
  const properties = [
    DG.Property.jsInt('age'),
    DG.Property.jsString('sex'),
    DG.Property.jsBool('control'),
  ];

  const items = [
    {age: 28, sex: 'M', control: true},
    {age: 35, sex: 'M', control: false},
    {age: 56, sex: 'F', control: true},
    {age: 30, sex: 'F', control: false},
  ];

  const grid = DG.Grid.fromProperties(items, properties);
  const view = grok.shell.addTableView(grid.dataFrame!);

  view.ribbonMenu.group('Peptides').item('First item', () => grok.shell.info('Item clicked'));
}
