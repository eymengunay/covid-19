import line from 'd3-shape/src/line';
import { monotoneX } from 'd3-shape/src/curve/monotone';
import select from 'd3-selection/src/select';
import scaleLinear from 'd3-scale/src/linear';
import scaleTime from 'd3-scale/src/time';
import dayjs from 'dayjs';

import addAxis from './utils/addAxis';
import addLabels from './utils/addLabels';
import Tooltip from './components/Tooltip';
import addLegend from './utils/addLegend';
import addFont from './utils/addFont';
import addFilter from './utils/addFilter';
import colors from './utils/colors';
import config from './config';

const margin = {
  top: 50, right: 30, bottom: 50, left: 50,
};

class XY {
  constructor(svg, {
    title, xLabel, yLabel, data: { datasets }, options,
  }) {
    this.options = {
      unxkcdify: false,
      dotSize: 1,
      showLine: false,
      timeFormat: '',
      xTickCount: 3,
      yTickCount: 3,
      legendPosition: config.positionType.upLeft,
      dataColors: colors,
      fontFamily: 'xkcd',
      strokeColor: 'black',
      backgroundColor: 'white',
      showLegend: true,
      ...options,
    };
    // TODO: extract a function?
    if (title) {
      this.title = title;
      margin.top = 60;
    }
    if (xLabel) {
      this.xLabel = xLabel;
      margin.bottom = 50;
    }
    if (yLabel) {
      this.yLabel = yLabel;
      margin.left = 70;
    }
    this.data = {
      datasets,
    };

    this.filter = 'url(#xkcdify)';
    this.fontFamily = this.options.fontFamily || 'xkcd';
    if (this.options.unxkcdify) {
      this.filter = null;
      this.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    }

    this.svgEl = select(svg)
      .style('stroke-width', 3)
      .style('font-family', this.fontFamily)
      .style('background', this.options.backgroundColor)
      .attr('width', svg.parentElement.clientWidth)
      .attr('height', this.options.height || Math.min((svg.parentElement.clientWidth * 2) / 3, window.innerHeight));
    this.svgEl.selectAll('*').remove();

    this.chart = this.svgEl.append('g')
      .attr('transform',
        `translate(${margin.left},${margin.top})`);

    this.width = this.svgEl.attr('width') - margin.left - margin.right;
    this.height = this.svgEl.attr('height') - margin.top - margin.bottom;
    addFont(this.svgEl);
    addFilter(this.svgEl);
    this.render();
  }

  render() {
    if (this.title) addLabels.title(this.svgEl, this.title, this.options.strokeColor);
    if (this.xLabel) addLabels.xLabel(this.svgEl, this.xLabel, this.options.strokeColor);
    if (this.yLabel) addLabels.yLabel(this.svgEl, this.yLabel, this.options.strokeColor);

    const tooltip = new Tooltip({
      parent: this.svgEl,
      title: '',
      items: [{ color: 'red', text: 'weweyang' }, { color: 'blue', text: 'timqian' }],
      position: { x: 60, y: 60, type: config.positionType.dowfnRight },
      unxkcdify: this.options.unxkcdify,
      strokeColor: this.options.strokeColor,
      backgroundColor: this.options.backgroundColor,
    });

    if (this.options.timeFormat) {
      this.data.datasets.forEach((dataset) => {
        dataset.data.forEach((d) => {
          // eslint-disable-next-line no-param-reassign
          d.x = dayjs(d.x);
        });
      });
    }

    const allData = this.data.datasets
      .reduce((pre, cur) => pre.concat(cur.data), []);

    const allDataX = allData.map((d) => d.x);
    const allDataY = allData.map((d) => d.y);

    const minX = Math.min(...allDataX)
    const maxX = Math.max(...allDataX)
    const marginX = Math.round((maxX - minX) / (100 / 5))
    let xScale = scaleLinear()
      .domain([Math.min(...allDataX), Math.max(...allDataX)])
      .range([0, this.width]);

    if (this.options.timeFormat) {
      xScale = scaleTime()
        .domain([Math.min(...allDataX) - marginX, Math.max(...allDataX) + marginX])
        .range([0, this.width]);
    }

    const minY = Math.min(...allDataY)
    const maxY = Math.max(...allDataY)
    const marginY = Math.round((maxY - minY) / (100 / 5))
    const yScale = scaleLinear()
      .domain([Math.min(...allDataY) - marginY, Math.max(...allDataY) + marginY])
      .range([this.height, 0]);
    
    const yScale100 = scaleLinear()
      .domain([0, 100])
      .range([this.height, 0]);

    const graphPart = this.chart.append('g')
      .attr('pointer-events', 'all');

    // axis
    addAxis.xAxis(graphPart, {
      xScale,
      tickCount: this.options.xTickCount === undefined ? 3 : this.options.xTickCount,
      moveDown: this.height,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });
    addAxis.yAxis(graphPart, {
      yScale,
      tickCount: this.options.yTickCount === undefined ? 3 : this.options.yTickCount,
      fontFamily: this.fontFamily,
      unxkcdify: this.options.unxkcdify,
      stroke: this.options.strokeColor,
    });

    // styles
    const stroke = (d, i, nodes) => {
      // FIXME: here I want to pass xyGroupIndex down to the circles by reading parent attrs
      // It might have perfomance issue with a large dataset, not sure there are better ways
      const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
      return this.options.dataColors[xyGroupIndex];
    }

    // events
    const mouseover = (d, i, nodes) => {
      const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
      select(nodes[i])
        .attr('r', dotHoverSize);
      const tipX = xScale(d.x) + margin.left + 5;
      const tipY = yScale(d.y) + margin.top + 5;
      let tooltipPositionType = config.positionType.downRight;
      if (tipX > this.width / 2 && tipY < this.height / 2) {
        tooltipPositionType = config.positionType.downLeft;
      } else if (tipX > this.width / 2 && tipY > this.height / 2) {
        tooltipPositionType = config.positionType.upLeft;
      } else if (tipX < this.width / 2 && tipY > this.height / 2) {
        tooltipPositionType = config.positionType.upRight;
      }
      tooltip.update({
        title: this.options.timeFormat ? dayjs(this.data.datasets[xyGroupIndex].data[i].x).format(this.options.timeFormat) : `${this.data.datasets[xyGroupIndex].data[i].x}`,
        items: [{
          color: this.options.dataColors[xyGroupIndex],
          text: this.data.datasets[xyGroupIndex].options.tooltipText ? this.data.datasets[xyGroupIndex].options.tooltipText(this.data.datasets[xyGroupIndex].label, d) : `${this.data.datasets[xyGroupIndex].label || ''}: ${d.y}`,
        }],
        position: {
          x: tipX,
          y: tipY,
          type: tooltipPositionType,
        },
      });
      tooltip.show();
    }

    const mouseout = (d, i, nodes) => {
      select(nodes[i])
        .attr('r', dotInitSize);

      tooltip.hide();
    }

    // lines
    if (this.options.showLine) {
      const theLine = line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
        .curve(monotoneX);
      this.theLine = theLine

      graphPart.selectAll('.xkcd-chart-xyline')
        .data(this.data.datasets)
        .enter()
        .append('path')
        .attr('class', 'xkcd-chart-xyline')
        .attr('d', (d) => theLine(d.data))
        .attr('fill', 'none')
        .attr('stroke', (d, i) => (this.options.dataColors[i]))
        .attr('filter', this.filter)
        .style('visibility', d => {
          if (d.options.showLine) {
            return 'visible'
          } else {
            return 'hidden'
          }
        });
    }

    // markers
    graphPart.selectAll('.xkcd-chart-xycircle-group')
      .data([this.data.datasets[1]])
      .enter()
      .append('g')
      .attr('filter', this.filter)
      .attr('xy-group-index', 1)
      .selectAll('.xkcd-chart-xycircle-circle')
      .data((dataset) => dataset.data)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d.x))
      .attr('y1', 10)
      .attr('x2', d => xScale(d.x))
      .attr('y2', this.height)
      .attr('stroke', stroke)
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '7,7');

    // dots
    const dotInitSize = 3.5 * (this.options.dotSize === undefined ? 1 : this.options.dotSize);
    const dotHoverSize = 6 * (this.options.dotSize === undefined ? 1 : this.options.dotSize);
    graphPart.selectAll('.xkcd-chart-xycircle-group')
      .data(this.data.datasets)
      .enter()
      .append('g')
      .attr('class', '.xkcd-chart-xycircle-group')
      .attr('filter', this.filter)
      .attr('xy-group-index', (d, i) => i)
      .selectAll('.xkcd-chart-xycircle-circle')
      .data((dataset) => dataset.data)
      .enter()
      .append('circle')
      .style('stroke', stroke)
      .style('fill', (d, i, nodes) => {
        const xyGroupIndex = Number(select(nodes[i].parentElement).attr('xy-group-index'));
        return this.options.dataColors[xyGroupIndex];
      })
      .attr('r', dotInitSize)
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d, i, a) => {
        const dataset = this.data.datasets.find(dataset => {
          return !!dataset.data.find(data => data === d)
        })
        if (dataset.options.type === 'marker') {
          return yScale100(d.y)
        } else {
          return yScale(d.y)
        }
      })
      .attr('pointer-events', 'all')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

    // Legend
    if (this.options.showLegend) {
      const legendItems = this.data.datasets.map(
        (dataset, i) => ({
          color: this.options.dataColors[i],
          text: dataset.label,
        }),
      );

      addLegend(graphPart, {
        items: legendItems,
        position: this.options.legendPosition,
        unxkcdify: this.options.unxkcdify,
        parentWidth: this.width,
        parentHeight: this.height,
        strokeColor: this.options.strokeColor,
        backgroundColor: this.options.backgroundColor,
      });
    }
  }

  // TODO: update chart
  update() {
  }
}

export default XY;
