import * as d3 from "d3";

import { wrapText } from "~charts/d3/text_wrap";

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

const colour = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 10));
const selectFillColour = (d: IMatrixDatum): string => { // FIXME: Type
	return d.colour || colour(d.radius as any); // FIXME: reasonable colour is based on what?
};

// See https://www.d3indepth.com/force-layout/ for some hint
export function buildMatrixForceChart(chartData: IMatrixChart, svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");

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

	const xSpacing = d3.scaleBand().rangeRound([margin.left, sizeWidth  - margin.right]).padding(0.1).domain(chartData.axes.xTitles);
	const ySpacing = d3.scaleBand().rangeRound([sizeHeight - margin.bottom, margin.top]).padding(0.1).domain(chartData.axes.yTitles);

	const group = svg
		.attr("viewBox", `0 0 ${sizeWidth} ${sizeHeight}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.append("g")
			.style("font", "10px sans-serif");

	const simulation = d3.forceSimulation(chartData.data as any)
		.force("charge", d3.forceManyBody().strength(0.5))
		.force("x", d3.forceX().x(function(d: any) {
			// Find the middle of the appropriate column of the matrix to centre this datum.
			return xSpacing(d.xKey) + xSpacing.bandwidth() / 2;
		}))
		.force("y", d3.forceY().y(function(d: IMatrixDatum) {
			// Find the middle of the appropriate row of the matrix to centre this datum.
			return ySpacing(d.yKey) + ySpacing.bandwidth() / 2;
		}))
		.force("collision", d3.forceCollide().radius(function(d: IMatrixDatum) {
			return d.radius;
		}))
		.on("tick", ticked);    // FIXME: Verify the tick is unregistered when finished

	// Optionally add axes.
	if(dimensions.xAxis) {
		group.append("g")
			.attr("class", "x-axis")
			.attr("transform", `translate(0, ${sizeHeight - margin.top - margin.bottom})`)
			.call(d3.axisBottom(xSpacing))
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.selectAll("text")
				.style("font-size", chartData.setup.xAxisFontSize || "25px")
				.call(wrapText, xSpacing.bandwidth());
	}

	// FIXME: For axes, should be using scaleBand rather than strange extra adding of stuff
	if(dimensions.yAxis) {
		group.append("g")
			.attr("class", "y-axis")
			.attr("transform", `translate(${margin.left}, 0)`)
			.call(d3.axisLeft(ySpacing))
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.selectAll("text")
				.style("font-size", chartData.setup.yAxisFontSize || "25px")
				.call(wrapText, ySpacing.bandwidth());
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
