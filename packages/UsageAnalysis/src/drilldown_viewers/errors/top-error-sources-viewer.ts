import {UaFilterableViewer} from "../../viewers/ua-filterable-viewer";
import * as DG from "datagrok-api/dg";
import {UaQueryViewer} from "../../viewers/ua-query-viewer";
import {TopQueriesUsingDataSource} from "../top-queries-using-data-source";
import * as grok from "datagrok-api/grok";
import * as ui from "datagrok-api/ui";
import {UaFilter} from "../../filter2";
import {PropertyPanel} from "../../property-panel";
import {UaDataFrameViewer} from "../../viewers/ua-data-frame-viewer";
import {BehaviorSubject} from "rxjs"

export class TopErrorSourcesViewer extends UaFilterableViewer {

  public constructor(filterStream: BehaviorSubject<UaFilter>) {
    super(
        filterStream,
        'Error Sources',
        'TopErrorSources',
        (t: DG.DataFrame) => {
          let viewer = DG.Viewer.barChart(t, UaQueryViewer.defaultBarchartOptions);
          viewer.onEvent('d4-bar-chart-on-category-clicked').subscribe((args) => {
            let pp = new PropertyPanel(
                  null,
                  [new UaDataFrameViewer(
                  'Function Info By Source',
                  'FunctionInfoBySource',
                  (t: DG.DataFrame) => DG.Viewer.grid(t).root,
                  null as any,
                  {name: args.args.categories[0]},
                  filterStream.getValue(),
                  false
              )
            ],
            `Error Sources: ${args.args.categories[0]}`,
            'Error Sources');

            grok.shell.o = pp.getRoot();
          });
          return viewer.root;
        }
    );
  }

}