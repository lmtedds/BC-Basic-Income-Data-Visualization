import { axisBottom, axisLeft, axisTop } from "d3-axis";
import { forceCollide, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import { quantize } from "d3-interpolate";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { interpolateRainbow } from "d3-scale-chromatic";
import { create, select, Selection } from "d3-selection";

import { wrapTextForeignObject, wrapTextTspan } from "~charts/d3/text_wrap";

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
	colourKey?: string;
	radius: number;
	name: string;
	x?: number;
	y?: number;
	xKey: string; // What x axis key is this data associate with
	yKey: string; // What y axis key is this data associate with
}

export interface ILegend {
	x: number;
	y: number;

	size: number; // size x size is space for "dot" and the size of font used
	horSpacing: number; // horizontal space between dot and text
	vertSpacing: number; // vertical space between lines
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

	xAxisQuadLines?: boolean;
	yAxisQuadLines?: boolean;

	legend?: ILegend;

	renderMethod: (chartData: IMatrixChart, quadrantGroup: Selection<SVGGElement, unknown, null, undefined>) => void;

	simulateIterationsAtStart?: number;
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

// See https://www.d3indepth.com/force-layout/ for some hint
export function buildMatrixForceChart(chartData: IMatrixChart, svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? select(svgEle) : create("svg");
	svg.classed("chart-matrix-force", true);

	// Set the array into the desired format by adding "quad" properties to each data element.
	const dimensions = chartToDimensions(chartData);
	// console.log(`${JSON.stringify(dimensions)}`);

	// Flatten datum array if required.
	if(Array.isArray(chartData.data) && Array.isArray(chartData.data[0])) {
		chartData.data = flattenData(chartData.data as IMatrixDatum[][]);
	}

	// Figure out how to divide up the space
	const sizeHeight = chartData.setup ? chartData.setup.height : 1000;
	const sizeWidth = chartData.setup ? chartData.setup.width : 1000;
	const margin = chartData.setup ? chartData.setup.margins : {top: 20, right: 160, bottom: 35, left: 40};

	const legend = chartData.setup && chartData.setup.legend;

	const xAxisFontSize = chartData.setup.xAxisFontSize || "25px";
	const yAxisFontSize = chartData.setup.yAxisFontSize || "25px";

	const xAxisQuadLines = chartData.setup && chartData.setup.xAxisQuadLines;
	const yAxisQuadLines = chartData.setup && chartData.setup.yAxisQuadLines;

	const fontSize = "10px";
	const fontFace = "sans-serif";

	const xAxisOnTop = true; // FIXME: Make configurable

	const xSpacing = scaleBand().rangeRound([margin.left, sizeWidth  - margin.right]).padding(0.1).domain(chartData.axes.xTitles);
	const ySpacing = scaleBand().rangeRound([sizeHeight - margin.bottom, margin.top]).padding(0.1).domain(chartData.axes.yTitles);

	const group = svg
		.attr("viewBox", `0 0 ${sizeWidth} ${sizeHeight}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.append("g")
			.style("font", `${fontSize} ${fontFace}`);

	// Optionally add axes.
	if(dimensions.xAxis) {
		const axisFn = xAxisOnTop ? axisTop : axisBottom;

		group.append("g")
			.attr("class", "x-axis")
			.attr("transform", `translate(0, ${xAxisOnTop ? 0 : (sizeHeight - margin.top - margin.bottom)})`) // FIXME: This top start of 0 is probably wrong
			.call(axisFn(xSpacing)) // Top or bottom axis
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.call((g) => g.selectAll("line").remove()) // Get rid of the ticks lines for the axis
			.attr("text-anchor", "middle")
			.selectAll("text")
				.style("font-size", xAxisFontSize)
				.attr("y", 0)
				.call(wrapTextTspan, {
					width: xSpacing.bandwidth(),
					height: xAxisOnTop ? margin.top : margin.bottom,
					padding: 0,
					vCenter: false,
					hCenter: false,
					vJust: false,
					fontSize: xAxisFontSize,
					fontFace: fontFace,
				});
	}

	if(xAxisQuadLines) {
		const spacing = chartData.axes.xTitles.map((title) => {
			return xSpacing(title) + xSpacing.bandwidth() + (xSpacing.paddingInner() * xSpacing.step() / 2);
		}).slice(0, -1);
		const xGridSpacing = scaleLinear().range([0, sizeWidth]).domain([0, sizeWidth]);

		group
			.append("g")
				.attr("class", "x-grid")
				.attr("transform", `translate(0, ${sizeHeight - margin.bottom})`);

		group
			.selectAll(".x-grid")
				.call(axisBottom(xGridSpacing)
					.tickValues(spacing)
					.tickSize(-(sizeHeight - margin.bottom - margin.top))
					.tickFormat("" as any),
				)
				.call((g) => g.select(".domain").remove()); // Get rid of the domain path for the axis
	}

	if(dimensions.yAxis) {
		group.append("g")
			.attr("class", "y-axis")
			.call(axisLeft(ySpacing)) // Left axis with no tick marks
			.call((g) => g.select(".domain").remove()) // Get rid of the domain path for the axis
			.call((g) => g.selectAll("line").remove()) // Get rid of the ticks for the axis
			// .attr("text-anchor", "end")
			.selectAll("text")
				.style("font-size", yAxisFontSize)
				// .call(wrapTextTspan, {
				// 	width: margin.left,
				// 	height: ySpacing.bandwidth(),
				// 	padding: 0,
				// 	vCenter: true,
				// 	hCenter: false,
				// 	vJust: true,
				// 	fontSize: yAxisFontSize,
				// 	fontFace: fontFace,
				// });
				.call(wrapTextForeignObject, {
					width: margin.left,
					height: ySpacing.bandwidth(),
					padding: 0,
					vCenter: true,
					hCenter: false,
					vJust: true,
					fontSize: yAxisFontSize,
					fontFace: fontFace,
				});
	}

	if(yAxisQuadLines) {
		const spacing = chartData.axes.yTitles.map((title) => {
			return ySpacing(title) + ySpacing.bandwidth() + (ySpacing.paddingInner() * ySpacing.step() / 2);
		}).slice(1);
		const yGridSpacing = scaleLinear().range([sizeHeight - margin.bottom, margin.top]).domain([sizeHeight - margin.bottom, margin.top]);

		group
			.append("g")
				.attr("class", "y-grid")
				.attr("transform", `translate(${margin.left}, 0)`);

		group
			.selectAll(".y-grid")
				.call(axisLeft(yGridSpacing)
					.tickValues(spacing)
					.tickFormat("" as any)
					.tickSize(-(sizeWidth - margin.left - margin.right)),
				)
				.call((g) => g.select(".domain").remove()); // Get rid of the domain path for the axis
	}

	// Group to contain all the quadrant data.
	const quadrantGroup = group
		.append("g")
			.attr("class", "quad-group");

	const joinFn = chartData.setup ? chartData.setup.renderMethod : solidCircleSimulationJoinFn;
	const simulationUpdate = joinFn.bind(this, chartData, quadrantGroup);
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
		}));

	// Run a fixed number simulation steps (potentially prior to rendering) or until
	// d3 simulation's alpha < alphaMin is reached?
	if(chartData.setup && chartData.setup.simulateIterationsAtStart ) {
		simulation
			.stop()
			.tick(chartData.setup.simulateIterationsAtStart);

		simulationUpdate();
	} else {
		simulation
			.on("tick", simulationUpdate)
			.on("end", () => { simulation.stop(); }); // Done based on alpha decay.
	}

	if(legend) {
		// FIXME: vert vs horizontal legend?
		// FIXME: border frame or not
		// FIXME: colour & colourKey configurable

		const xLegend = chartData.setup.legend.x;
		const yLegend = chartData.setup.legend.y;
		const size = chartData.setup.legend.size;
		const horSpacing = chartData.setup.legend.horSpacing;
		const vertSpacing = chartData.setup.legend.vertSpacing;

		const colourKeySet = new Set<any>();

		(chartData.data as IMatrixDatum[]).forEach((datum) => {
			colourKeySet.add(datum.colourKey || datum.radius);
		});

		const colourKeys = Array.from(colourKeySet.values());

		const legendGroup = group
			.append("g")
				.attr("class", "legend")
				.attr("transform", `translate(${xLegend}, ${yLegend})`)
				.style("font", `${size}px sans-serif`); // FIXME: Config

		legendGroup
			.selectAll("rect")
			.data(colourKeys)
			.enter()
				.append("rect")
					.attr("x", 0)
					.attr("y", (d, i) => 100 + (i * (size + vertSpacing)))
					.attr("width", size)
					.attr("height", size)
					.attr("fill", (d) => colour(d));

		legendGroup
			.selectAll("text")
			.data(colourKeys)
			.enter()
				.append("text")
					.attr("x", 0 + size + horSpacing)
					.attr("y", (d, i) => 100 + (i * (size + vertSpacing)) + size / 2)
					.attr("fill", (d) => colour(d))
					.text((d) => d)
					.attr("text-anchor", "left")
					.style("alignment-baseline", "middle");
	}

	return svg.node();
}

const colour = scaleOrdinal(quantize(interpolateRainbow, 10));
const selectFillColour = (d: IMatrixDatum): string => {
	return d.colour || (d.colourKey && colour(d.colourKey as any)) || colour(d.radius as any);
};

export function solidCircleSimulationJoinFn(chartData: IMatrixChart, quadrantGroup: Selection<SVGGElement, unknown, null, undefined>): void {

	// data elements are circles
	const circles = quadrantGroup
		.selectAll("circle")
			.data(chartData.data as IMatrixDatum[]);

	circles
		.enter()
			.append("circle")
				.attr("r", function(d) {
					return d.radius;
				})
				.attr("fill", selectFillColour)
			.merge(circles as any) // enter and update
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});

	circles
		.exit()
			.remove();
}

export function circleWithNameSimulationJoinFn(chartData: IMatrixChart, quadrantGroup: Selection<SVGGElement, unknown, null, undefined>): void {
	const data = chartData.data as IMatrixDatum[];

	// FIXME: These shoulnd't be here
	const fontSize = "10px";
	const fontFace = "sans-serif";

	// data elements are circles
	const circles = quadrantGroup
		.selectAll("circle")
			.data(data);

	circles
		.enter()
			.append("circle")
				.attr("r", function(d) {
					return d.radius;
				})
				.attr("fill", "none")
				.attr("stroke", selectFillColour)
				.attr("stroke-width", function(d) {
					return d.radius / 5;
				})
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});

	// updates
	circles
		.attr("cx", function(d) {
			return d.x;
		})
		.attr("cy", function(d) {
			return d.y;
		});

	circles
		.exit()
			.remove();

	const circlesText = quadrantGroup
		.selectAll("text")
			.data(data);

	circlesText
		.enter()
			.append("text")
				.text(function(d) {
					return d.name;
				})
				.attr("text-anchor", "middle")
				.attr("fill", "#000") // FIXME:
				.attr("x", function(d) {
					return d.x;
				})
				.attr("y", function(d) {
					return d.y;
				})
				.call(wrapTextTspan, {
					width: 10, // FIXME: This should be 2*radius or something of the sort
					height: 10, // FIXME: This should be 2*radius or something of the sort
					padding: 0,
					vCenter: false,
					hCenter: false,
					vJust: true,
					fontSize: fontSize,
					fontFace: fontFace,
				});

	// update
	circlesText
		.attr("x", function(d) {
			return d.x;
		})
		.attr("y", function(d) {
			return d.y;
		});

	circlesText
		.exit()
			.remove();

}
