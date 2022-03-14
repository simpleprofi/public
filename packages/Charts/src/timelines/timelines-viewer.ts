import * as grok from 'datagrok-api/grok';
import * as ui from 'datagrok-api/ui';
import * as DG from 'datagrok-api/dg';

import * as echarts from 'echarts';
import $ from 'cash-dom';
import {EChartViewer} from '../echart-viewer';
import {options, deepCopy, VISIBILITY_MODE, visibilityModeType} from './echarts-options';

type axisPointerType = 'shadow' | 'cross' | 'line' | 'none' | undefined;
type markerType = 'circle' | 'rect' | 'ring' | 'diamond';

export class TimelinesViewer extends EChartViewer {
  splitByColumnName: string;
  startColumnName: string;
  endColumnName: string;
  colorByColumnName: string;
  showOpenIntervals: boolean;
  eventColumnName: string;
  showEventInTooltip: boolean;
  marker: markerType;
  markerSize: number;
  markerPosition: string;
  lineWidth: number;
  dateFormat: string;
  axisPointer: axisPointerType;
  showZoomSliders: boolean;
  legendVisibility: visibilityModeType;
  splitByRegexps: RegExp[];
  colorByRegexps: RegExp[];
  eventRegexps: any[];
  startRegexps: RegExp[];
  endRegexps: RegExp[];
  defaultDateFormat: string;
  data: any[][][];
  //FIXME: need better type
  columnData: {[key: string]: any};
  count: number;
  selectionColor: any;
  zoomState: number[][];
  tooltipOffset: number;
  initialized: boolean;
  titleDiv: any;
  legendDiv: any;
  colorMap: any;

  constructor() {
    super();

    this.splitByColumnName = this.string('splitByColumnName');
    this.startColumnName = this.string('startColumnName');
    this.endColumnName = this.string('endColumnName');
    this.colorByColumnName = this.string('colorByColumnName');
    this.showOpenIntervals = this.bool('showOpenIntervals', false);
    this.eventColumnName = this.string('eventColumnName');
    this.showEventInTooltip = this.bool('showEventInTooltip', true);

    this.marker = this.string('marker', 'circle', {choices: ['circle', 'rect', 'ring', 'diamond']}) as markerType;
    this.markerSize = this.int('markerSize', 6);
    this.markerPosition = this.string('markerPosition', 'main line',
      {choices: ['main line', 'above main line', 'scatter']});
    this.lineWidth = this.int('lineWidth', 3);
    this.dateFormat = this.string('dateFormat'); // TODO: add an extendable dropdown
    this.axisPointer = this.string('axisPointer', 'shadow',
      {choices: ['cross', 'line', 'shadow', 'none']}) as axisPointerType;
    this.showZoomSliders = this.bool('showZoomSliders', true);
    this.legendVisibility = this.string(
      'legendVisibility', VISIBILITY_MODE.AUTO, {choices: Object.values(VISIBILITY_MODE)}) as visibilityModeType;

    this.splitByRegexps = [/^USUBJID$/, /id/i];
    this.colorByRegexps = [/^([A-Z]{2}(TERM|TEST|TRT|VAL)|(ACT)?ARM|MIDS(TYPE)?|VISIT)$/, /event/i];
    this.eventRegexps = [/^event$/, ...this.colorByRegexps];
    this.startRegexps = [/^((VISIT|[A-Z]{2}(ST)?)DY)$/, /start|begin/i];
    this.endRegexps = [/^((VISIT|[A-Z]{2}(EN)?)DY)$/, /stop|end/i];

    this.defaultDateFormat = '{MMM} {d}';
    this.data = [];
    this.columnData = {};
    this.count = 0;
    this.selectionColor = DG.Color.toRgb(DG.Color.selectedRows);
    this.zoomState = [[0, 100], [0, 100], [0, 100], [0, 100]];
    this.tooltipOffset = 10;
    this.initialized = false;
    this.option = deepCopy(options);
  }

  init() {
    if (!this.initialized) {
      this.helpUrl = 'https://raw.githubusercontent.com/datagrok-ai/public/master/packages/Charts/README.md#timelines';

      this.updateZoom();
      this.chart.on('dataZoom', () => {
        this.chart.getOption().dataZoom?.forEach((dataZoom, index) => {
          this.zoomState[index][0] = dataZoom.start!;
          this.zoomState[index][1] = dataZoom.end!;
          if (dataZoom.type === 'slider' && Object.keys(dataZoom).includes('yAxisIndex')) {
            const dataZoomDiff = dataZoom.end! - dataZoom.start!;
            this.lineWidth = dataZoomDiff < 60 ? (dataZoomDiff < 30 ? 3 : 2) : 1;
            this.markerSize = dataZoomDiff < 60 ? (dataZoomDiff < 30 ? 6 : 4) : 3;
          }
        });
      });

      this.chart.on('rendered', () => {
        this.count = 0;
      });

      //FIXME: need better params type
      this.chart.on('click', (params: {[key: string]: any}) => this.dataFrame!.selection.handleClick((i) => {
        if (params.componentType === 'yAxis')
          return this.getStrValue(this.columnData.splitByColumnName, i) === params.value;
        if (params.componentType === 'series') {
          return params.value[0] === this.getStrValue(this.columnData.splitByColumnName, i) &&
                 this.isSameDate(params.value[1], this.getSafeValue(this.columnData.startColumnName, i)) &&
                 this.isSameDate(params.value[2], this.getSafeValue(this.columnData.endColumnName, i));
        }
        return false;
      }, params.event.event));

      //FIXME: need better params type
      this.chart.on('mouseover', (params: {[key: string]: any}) => this.getTooltip(params));

      this.chart.on('mouseout', () => ui.tooltip.hide());

      this.option.tooltip!.axisPointer!.type = this.axisPointer;

      this.titleDiv = ui.div();
      this.legendDiv = ui.div();
      this.root.appendChild(this.titleDiv);
      this.root.appendChild(this.legendDiv);
      this.initialized = true;
    }
  }

  onPropertyChanged(property: DG.Property) {
    if (!this.initialized) return;
    if (property.name === 'axisPointer')
      this.option.tooltip!.axisPointer!.type = property.get(this);
    else if (property.name === 'showZoomSliders') {
      this.option.dataZoom?.forEach((z) => {
        if (z.type === 'slider')
          (z as echarts.SliderDataZoomComponentOption).show = this.showZoomSliders;
      });
    } else if (property.name.endsWith('ColumnName')) {
      const columnData = this.updateColumnData(property);
      if (property.name === 'colorByColumnName') {
        this.colorMap = this.getColorMap(columnData.categories);
        this.updateLegend(columnData.column);
      }
    } else if (property.name === 'legendVisibility')
      this.switchLegendVisibility(property.get(this));

    this.render();
  }

  formatDate(value: Date | string): string {
    return value instanceof Date ? echarts.time.format(value, this.dateFormat, false) : value;
  }

  //FIXME: need better params type
  getTooltip(params: {[key: string]: any}) {
    const x = params.event.event.x + this.tooltipOffset;
    const y = params.event.event.y + this.tooltipOffset;
    if (this.showEventInTooltip) {
      const tooltipContent = params.componentType === 'yAxis' ? ui.div(`${params.value}`) :
        ui.divV([ui.div(`key: ${params.value[0]}`),
          ui.div(`event: ${params.value[4]}`),
          ui.div(`start: ${this.formatDate(params.value[1])}`),
          ui.div(`end: ${this.formatDate(params.value[2])}`),
        ]);
      ui.tooltip.show(tooltipContent, x, y);
    } else {
      ui.tooltip.showRowGroup(this.dataFrame!, (i) => {
        if (params.componentType === 'yAxis')
          return this.getStrValue(this.columnData.splitByColumnName, i) === params.value;
        if (params.componentType === 'series') {
          return params.value[0] === this.getStrValue(this.columnData.splitByColumnName, i) &&
            this.isSameDate(params.value[1], this.getSafeValue(this.columnData.startColumnName, i)) &&
            this.isSameDate(params.value[2], this.getSafeValue(this.columnData.endColumnName, i));
        }
        return false;
      }, x, y);
    }
  }

  getColorMap(categories: string[]): {[key: string]: string} {
    return categories.reduce((colorMap: {[key: string]: string}, category: string, index: number) => {
      colorMap[category] = DG.Color.toRgb(DG.Color.getCategoricalColor(index));
      return colorMap;
    }, {});
  }

  onTableAttached() {
    this.init();

    const columns: DG.Column[] = this.dataFrame!.columns.toList();

    const strColumns = columns.filter((col) => col.type === DG.COLUMN_TYPE.STRING)
      .sort((a, b) => a.categories.length - b.categories.length);

    const numColumns = [...this.dataFrame!.columns.numerical].sort((a, b) => a.stats.avg - b.stats.avg);
    const numericalTypes = [DG.COLUMN_TYPE.INT, DG.COLUMN_TYPE.FLOAT, DG.COLUMN_TYPE.DATE_TIME];

    if (strColumns.length < 1 || numColumns.length < 1) {
      this.showErrorMessage('Not enough data to produce the result.');
      return;
    }

    this.splitByColumnName = (this.findColumn(columns, this.splitByRegexps) || strColumns[strColumns.length - 1]).name;
    this.startColumnName = (this.findColumn(columns, this.startRegexps, numericalTypes) || numColumns[0]).name;
    this.endColumnName =
      (this.findColumn(columns, this.endRegexps, numericalTypes) || numColumns[numColumns.length - 1]).name;
    this.colorByColumnName =
      (this.findColumn(columns, this.colorByRegexps, [DG.COLUMN_TYPE.STRING]) || strColumns[0]).name;
    this.eventColumnName = (this.findColumn(columns, this.eventRegexps, [DG.COLUMN_TYPE.STRING]) || strColumns[0]).name;

    const columnPropNames =
      ['splitByColumnName', 'startColumnName', 'endColumnName', 'colorByColumnName', 'eventColumnName'];
    const columnNames =
      [this.splitByColumnName, this.startColumnName, this.endColumnName, this.colorByColumnName, this.eventColumnName];

    this.columnData = columnPropNames.reduce((map: {[key: string]: any}, v, i) => {
      const column = this.dataFrame!.getCol(columnNames[i]);
      map[v] = {
        column,
        data: column.getRawData(),
        categories: column.type === DG.COLUMN_TYPE.STRING ? column.categories : null,
      };
      return map;
    }, {});

    this.colorMap = this.getColorMap(this.columnData.colorByColumnName.categories);
    this.updateLegend(this.columnData.colorByColumnName.column);
    this.switchLegendVisibility(this.legendVisibility);

    let prevSubj: any[] | null = null;

    //FIXME: fix types
    (this.option.series![0] as echarts.CustomSeriesOption).renderItem =
      (params: echarts.CustomSeriesRenderItemParams, api: echarts.CustomSeriesRenderItemAPI) => {
        let overlap = false;
        if (params.dataIndex > 0) {
          const prev = this.data[params.dataIndex - 1];
          const curSubj = this.data[params.dataIndex][0];
          //FIXME
          if (curSubj === prev[0] && prev[1] && prev[2] && prev[1] !== prev[2] && api.value(1) < prev[2]) {
            overlap = true;
            if (prevSubj !== curSubj) {
              this.count = 0;
              prevSubj = curSubj;
            }
          }
        }

        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const width = end[0] - start[0];

        const group: echarts.CustomSeriesRenderItemReturn = {
          type: 'group',
          children: [],
        };

        //FIXME
        if (isNaN(api.value(1)) || isNaN(api.value(2)) || this.markerSize > width) {
          const xPos = (shift: number) => isNaN(start[0]) ? end[0] : start[0] - shift;
          const yPos = (shift: number) => end[1] - (this.markerPosition === 'main line' ? shift :
            (this.markerPosition === 'above main line' ? Math.max(this.markerSize, this.lineWidth) + shift :
              ((params.dataIndex % 2) * 2 - 1)*(this.markerSize * 3)));

          const marker = {
            type: this.marker,
            shape: this.marker === 'circle' ? {
              cx: xPos(0),
              cy: yPos(0),
              r: this.markerSize / 2,
            } : (this.marker === 'ring' ? {
              cx: xPos(0),
              cy: yPos(0),
              r: this.markerSize / 2,
              r0: this.markerSize / 4,
            } : {
              x: xPos(this.markerSize / 2),
              y: yPos(this.markerSize / 2),
              width: this.markerSize,
              height: this.markerSize,
            }),
            style: {
              fill: api.value(5) ? this.selectionColor : this.colorMap[isNaN(api.value(3)) ? //FIXME
                this.data[params.dataIndex][3][0] : api.value(3)],
            },
          };

          if (this.marker === 'diamond') {
            marker.type = 'rect';
            marker.x = xPos(0);
            marker.y = yPos(0);
            marker.shape.x = -this.markerSize / 2;
            marker.shape.y = -this.markerSize / 2;
            marker.shape.r = this.markerSize / 4;
            marker.rotation = 0.785398;
          } else if (this.marker === 'rect') {
            marker.x = 0;
            marker.y = 0;
            marker.shape.x = xPos(this.markerSize / 2);
            marker.shape.y = yPos(this.markerSize / 2);
            marker.shape.r = 0;
            marker.rotation = 0;
          }

          group.children.push(marker);
        } else {
          const rectShape = echarts.graphic.clipRectByRect({
            x: start[0],
            y: start[1] - this.lineWidth / 2,
            width: width,
            height: this.lineWidth,
          }, {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height,
          });

          if (overlap) {
            const height = api.size!([0, 1])[1]; //FIXME
            const offset = Math.max(this.markerSize * 2, this.lineWidth);
            // Shift along the Y axis
            rectShape.y += (this.count % 3) ? (this.count % 3 === 2) ?
              0 : offset-height/2 : height/2-offset;
            this.count += 1;
          }

          group.children.push({
            type: 'rect',
            transition: ['shape'],
            shape: rectShape,
            style: {fill: api.value(5) ? this.selectionColor : this.colorMap[isNaN(api.value(3)) ?
              this.data[params.dataIndex][3][0] : api.value(3)]},
          });
        }

        return group;
      };

    super.onTableAttached();
  }

  /** Find a column based on provided name patterns and types.
   * The list of patterns should be sorted by priority in descending order. */
  findColumn(columns: DG.Column[], regexps: RegExp[], types: string[] = []): DG.Column | null {
    if (types.length)
      columns = columns.filter((c) => types.includes(c.type));

    for (const regex of regexps) {
      const column = columns.find((c) => c.name.match(regex));
      if (column)
        return column;
    }
    return null;
  }

  updateColumnData(prop: DG.Property) {
    const column = this.dataFrame!.col(prop.get(this));
    if (column == null)
      return null;
    this.columnData[prop.name] = {
      column,
      data: column.getRawData(),
      categories: column.type === DG.COLUMN_TYPE.STRING ? column.categories : null,
    };
    return this.columnData[prop.name];
  }

  updateZoom() {
    this.option.dataZoom?.forEach((z, i) => {
      z.start = this.zoomState[i][0];
      z.end = this.zoomState[i][1];
    });
  }

  updateLegend(column: DG.Column) {
    $(this.legendDiv).empty();
    const legend = DG.Legend.create(column);
    this.legendDiv.appendChild(legend.root);
    $(legend.root).addClass('charts-legend');
  }

  showLegend() {
    $(this.legendDiv).show();
    $(this.chart.getDom()).css('marginRight', '100px');
  }

  hideLegend() {
    $(this.legendDiv).hide();
    $(this.chart.getDom()).css('marginRight', '');
  }

  switchLegendVisibility(mode: visibilityModeType) {
    const {column, categories} = this.columnData.colorByColumnName;
    const autoShow = column.matches(DG.TYPE.CATEGORICAL) && categories.length < 100;
    if (mode === VISIBILITY_MODE.ALWAYS || (mode === VISIBILITY_MODE.AUTO && autoShow))
      this.showLegend();
    else
      this.hideLegend();
  }

  //FIXME: columnData type
  getStrValue(columnData: {[key: string]: any}, idx: number): string {
    const {column, categories, data} = columnData;
    return column.type === DG.COLUMN_TYPE.STRING ? categories[data[idx]] : column.getString(idx);
  }

  //FIXME: columnData type, return type
  getSafeValue(columnData: {[key: string]: any}, idx: number) {
    const {column, data} = columnData;
    return column.isNone(idx) ? null : column.type === DG.COLUMN_TYPE.DATE_TIME ?
      new Date(data[idx] * 1e-3) : data[idx];
  }

  isSameDate(x: Date, y: Date): boolean | null {
    if (x instanceof Date && y instanceof Date)
      return x.getTime() === y.getTime();
    else if ((typeof x === typeof y && typeof x === 'number') || (x == null || y == null))
      return x === y;

    grok.shell.warning('The columns of different types cannot be used for representing dates.');
    return null;
  }

  getColumnMin(column: DG.Column): number | Date {
    return column.type === DG.COLUMN_TYPE.DATE_TIME ? new Date(column.min * 1e-3) : column.min;
  }

  getColumnMax(column: DG.Column): number | Date {
    return column.type === DG.COLUMN_TYPE.DATE_TIME ? new Date(column.max * 1e-3) : column.max;
  }

  //FIXME: return type
  getSeriesData() {
    this.data.length = 0;
    const tempObj: {[key: string]: any} = {};

    const {categories: colorCategories, data: colorBuf} = this.columnData.colorByColumnName;
    const {categories: eventCategories, data: eventBuf} = this.columnData.eventColumnName;
    const {column: startColumn} = this.columnData.startColumnName;
    const {column: endColumn} = this.columnData.endColumnName;
    (startColumn.type !== DG.COLUMN_TYPE.DATE_TIME || endColumn.type !== DG.COLUMN_TYPE.DATE_TIME) ?
      this.removeTimeOptions() : this.addTimeOptions();

    for (const i of this.dataFrame!.filter.getSelectedIndexes()) {
      const id = this.getStrValue(this.columnData.splitByColumnName, i);
      let start = this.getSafeValue(this.columnData.startColumnName, i);
      let end = this.getSafeValue(this.columnData.endColumnName, i);
      if (start === end && end === null)
        continue;
      if (this.showOpenIntervals) {
        // TODO: handle edge case of different column types
        start ??= Math.min(this.getColumnMin(startColumn) as number, this.getColumnMin(endColumn) as number);
        end ??= Math.max(this.getColumnMax(startColumn) as number, this.getColumnMax(endColumn) as number);
      }
      const color = colorCategories[colorBuf[i]];
      const event = eventCategories[eventBuf[i]];
      const key = `${id}-${event}-${start}-${end}`;
      if (tempObj.hasOwnProperty(key)) {
        tempObj[key][3].push(color);
        tempObj[key][4].push(event);
      } else
        tempObj[key] = [id, start, end, [color], [event], this.dataFrame!.selection.get(i)];
    }

    this.data = Object.values(tempObj).sort((a, b) => {
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;

      // Items with the same id are sorted based on `start` value
      if (a[1] > b[1]) return 1;
      if (a[1] < b[1]) return -1;
      return 0;
    });

    return this.data;
  }

  addTimeOptions() {
    if (this.dateFormat === null)
      this.props.set('dateFormat', this.defaultDateFormat);

    this.option.xAxis = {
      type: 'time',
      boundaryGap: ['5%', '5%'],
      axisLabel: {formatter: this.dateFormat},
    };
  }

  removeTimeOptions() {
    this.option.xAxis = {
      type: 'value',
      boundaryGap: ['0%', '0%'],
      axisLabel: {},
    };
  }

  showErrorMessage(msg: string) {
    this.titleDiv.innerText = msg;
    $(this.titleDiv).addClass('d4-viewer-error');
    $(this.legendDiv).hide();
    $(this.chart.getDom()).hide();
  }

  updateContainers() {
    $(this.titleDiv).removeClass().empty();
    this.switchLegendVisibility(this.legendVisibility);
    $(this.chart.getDom()).show();
  }

  render() {
    this.updateContainers();
    if (!this.splitByColumnName || !this.startColumnName || !this.endColumnName) {
      this.showErrorMessage('Not enough data to produce the result.');
      return;
    }
    this.option.series[0].data = this.getSeriesData();
    this.updateZoom();
    this.chart.setOption(this.option);
  }
}
