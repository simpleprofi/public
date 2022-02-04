import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';
import {chemblSimilaritySearch, chemblSubstructureSearch} from './chembl';

export async function chemblSearchWidget(
    molString: string, searchType: 'similarity' | 'substructure'): Promise<DG.Widget> {
  const headerHost = ui.divH([]);
  const compsHost = ui.divH([ui.loader(), headerHost]);
  const widget = new DG.Widget(compsHost);

  let table: DG.DataFrame;
  switch (searchType) {
  case 'similarity':
    table = await chemblSimilaritySearch(molString);
    break;
  case 'substructure':
    table = await chemblSubstructureSearch(molString);
    break;
  default:
    throw new Error(`Invalid search type \`${searchType}\``);
  }

  compsHost.firstChild?.remove();
  if (table == null) {
    compsHost.appendChild(ui.divText('No matches'));
    return widget;
  }

  const smilesCol = table.col('canonical_smiles');
  if (smilesCol !== null) {
    smilesCol.semType = 'Molecule';
    smilesCol.setTag('cell.renderer', 'Molecule');
  }

  const grid = table.plot.grid();
  const col = grid.columns.byName('molecule_chembl_id');
  if (col !== null)
    col.cellType = 'html';

  const link = `https://www.ebi.ac.uk/chembl/compound_report_card`;
  grid.onCellPrepare(gc => {
    if (gc.isTableCell && gc.gridColumn.name === 'molecule_chembl_id') {
      gc.style.element = ui.divV([
        ui.link(gc.cell.value, `${link}/${gc.cell.value}`),
      ]);
    }
  });
  compsHost.appendChild(grid.root);
  headerHost.appendChild(ui.iconFA('arrow-square-down', () => {
    table.name = `DrugBank Similarity Search`;
    grok.shell.addTableView(table);
  }, 'Open compounds as table'));
  compsHost.style.overflowY = 'auto';

  return widget;
}
