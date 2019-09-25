import { axisBottom, axisLeft, axisTop } from "d3-axis";
import { forceCollide, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import { quantize } from "d3-interpolate";
import { scaleBand, scaleOrdinal } from "d3-scale";
import { interpolateRainbow } from "d3-scale-chromatic";
import { create, select } from "d3-selection";

import { IWrapTextDimensionsJustification, wrapText } from "~charts/d3/text_wrap";

interface IMatrixDimensionalInfo {
	xAxis: boolean;
	yAxis: boolean;
	cols: number;
	rows: number;
	num: number;
}

export interface IMatrixAxes {
	xTitles: string[];
	yTitles: string[];
}

export interface IMatrixDatum {
	quad?: number; // If this field exists then data must be IMatrixDatum[] not IMatrixDatum[][]
	colour?: string;
	radius: number;
	x?: number;
	y?: number;
	xKey: string;
	yKey: string;
}

export interface IMatrixSetup {
	height: number;
	width: number;

	margins: {
		top: number;
		bottom: number;
		right: number;
		left: number;
	};

	xAxisFontSize: string;
	yAxisFontSize: string;
}

export interface IMatrixChart {
	axes?: IMatrixAxes;
	data: IMatrixDatum[] | IMatrixDatum[][];
	setup?: IMatrixSetup;
}

// Add quadrant and flatten arrays to depth 1
function flattenData(data: IMatrixDatum[][]): IMatrixDatum[] {
	return data.reduce((accum, ele, quadrant) => {
		return accum.concat(ele.map((inner) => {
			return inner.quad ? inner : Object.assign({quad: quadrant}, inner);
		}));
	}, []);
}

const numChartsToDimensions = {
	1: {x: 1, y: 1},
	2: {x: 2, y: 1},
	3: {x: 3, y: 1},
	4: {x: 2, y: 2},
	5: {x: 3, y: 2},
	6: {x: 3, y: 2},
	7: {x: 3, y: 3},
	8: {x: 3, y: 3},
	9: {x: 3, y: 3},
	10: {x: 4, y: 3},
	11: {x: 4, y: 3},
	12: {x: 4, y: 3},
	13: {x: 4, y: 4},
	14: {x: 4, y: 4},
	15: {x: 4, y: 4},
	16: {x: 4, y: 4},
};

function chartToDimensions(data: IMatrixChart): IMatrixDimensionalInfo {
	// Use the information if it's provided.
	if(data.axes) {
		return {
			xAxis: true,
			yAxis: true,
			cols: data.axes.xTitles.length,
			rows: data.axes.yTitles.length,
			num: data.axes.xTitles.length * data.axes.yTitles.length,
		};
	}

	// No information provided. Provide some dimensions
	const dims = numChartsToDimensions[data.data.length];
	return {
		xAxis: false,
		yAxis: false,
		cols: dims.x,
		rows: dims.y,
		num: data.data.length,
	};
}

const colour = scaleOrdinal(quantize(interpolateRainbow, 10));
const selectFillColour = (d: IMatrixDatum): string => { // FIXME: Type
	return d.colour || colour(d.radius as any); // FIXME: reasonable colour is based on what?
};

// See https://www.d3indepth.com/force-layout/ for some hint
export function buildMatrixForceChart(chartData: IMatrixChart, svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? select(svgEle) : create("svg");

	// Set the array into the desired format by adding "quad" properties to each data element.
	const dimensions = chartToDimensions(chartData);
	console.log(`${JSON.stringify(dimensions)}`);

	// Flatten datum array if required.
	if(Array.isArray(chartData.data) && Array.isArray(chartData.data[0])) {
		chartData.data = flattenData(chartData.data as IMatrixDatum[][]);
	}

	// Figure out how to divide up the space
	const sizeHeight = chartData.setup ? chartData.setup.height : 1000;
	const sizeWidth = chartData.setup ? chartData.setup.width : 1000;
	const margin = chartData.setup ? chartData.setup.margins : {top: 20, right: 160, bottom: 35, left: 40};

	const xAxisFontSize = chartData.setup.xAxisFontSize || "25px";
	const yAxisFontSize = chartData.setup.yAxisFontSize || "25px";

	const xSpacing = scaleBand().rangeRound([margin.left, sizeWidth  - margin.right]).padding(0.1).domain(chartData.axes.xTitles);
	const ySpacing = scaleBand().rangeRound([sizeHeight - margin.bottom, margin.top]).padding(0.1).domain(chartData.axes.yTitles);

	const group = svg
		.attr("viewBox", `0 0 ${sizeWidth} ${sizeHeight}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.append("g")
			.style("font", "10px sans-serif");

	const simulation = forceSimulation(chartData.data as any)
		.force("charge", forceManyBody().strength(0.5))
		.force("x", forceX().x(function(d: any) {
			// Find the middle of the appropriate column of the matrix to centre this datum.
			return xSpacing(d.xKey) + xSpacing.bandwidth() / 2;
		}))
		.force("y", forceY().y(function(d: IMatrixDatum) {
			// Find the middle of the appropriate row of the matrix to centre this datum.
			return ySpacing(d.yKey) + ySpacing.bandwidth() / 2;
		}))
		.force("collision", forceCollide().radius(function(d: IMatrixDatum) {
			return d.radius;
		}))
		.on("tick", ticked);    // FIXME: Verify the tick is unregistered when finished

	const xAxisOnTop = true;
	const axisFn = xAxisOnTop ? axisTop : axisBottom;

	// Optionally add axes.
	if(dimensions.xAxis) {
		console.log(`inner tick ${axisFn(xSpacing).tickSizeInner()} outer: ${axisFn(xSpacing).tickSizeOuter()}`);
		group.append("g")
			.attr("class", "x-axis")
			.attr("transform", `translate(0, ${xAxisOnTop ? margin.top : (sizeHeight - margin.top - margin.bottom)})`)
			.call(axisFn(xSpacing)) // Top or bottom axis with no tick marks
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.call((g) => g.selectAll("line").remove()) // Get rid of the ticks lines for the axis
			.selectAll("text")
				.style("font-size", xAxisFontSize)
				.call(wrapText, {
					width: xSpacing.bandwidth(),
					height: xAxisOnTop ? margin.top : margin.bottom,
					padding: 5,
					vCenter: false,
					hCenter: true,
					vJust: false,
					hJust: IWrapTextDimensionsJustification.CENTER,
				});
	}

	if(dimensions.yAxis) {
		group.append("g")
			.attr("class", "y-axis")
			.call(axisLeft(ySpacing)) // Left axis with no tick marks
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.call((g) => g.selectAll("line").remove()) // Get rid of the ticks for the axis
			.selectAll("text")
				.style("font-size", yAxisFontSize)
				.call(wrapText, {
					width: margin.left,
					height: ySpacing.bandwidth(),
					padding: 0,
					vCenter: true,
					hCenter: false,
					vJust: true,
					hJust: IWrapTextDimensionsJustification.RIGHT,
				});
	}

	const circleGroup = group
		.append("g");

	function ticked() {
		const u = circleGroup
				.selectAll("circle")
				.data(chartData.data as IMatrixDatum[]);

		u.enter()
			.append("circle")
			.attr("r", function(d) {
				return d.radius;
			})
			.merge(u as any)
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
			.attr("fill", selectFillColour);

		u.exit().remove();
	}

	return svg.node();
}
