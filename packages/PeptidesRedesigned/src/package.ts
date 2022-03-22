/* Do not change these import lines to match external modules in webpack configuration */
import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

export const _package = new DG.Package();

//name: test
export function test() {
  const df = grok.shell.table('peptides');
  const view = grok.shell.addTableView(df);

  //view.ribbonMenu.

  const menu = grok.shell.topMenu
    .group('Custom')
    .item('Foo!', () => grok.shell.info('Foo clicked'));
}

//name: peptidesEmbedding
//description: Peptides embedding
//top-menu: Peptides | Embedding
export function peptidesEmbedding() {
  grok.shell.info('Peptides | Embedding');
}
