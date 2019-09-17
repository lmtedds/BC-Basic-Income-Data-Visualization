import * as d3 from "d3";

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
	quad?: number; // If this field exists then data must be IMatrixDatum[]
	colour?: string;
	radius: number;
	x?: number;
	y?: number;
}

export interface IMatrixChart {
	axes?: IMatrixAxes;
	data: IMatrixDatum[] | IMatrixDatum[][];
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
	const width = 1000;
	const height = 1000;
	const yAxisWidth = dimensions.yAxis ? 200 : 0;
	const xAxisHeight = dimensions.xAxis ? 200 : 0;
	const colSpace = (width - yAxisWidth) / dimensions.cols;
	const rowSpace = (height - xAxisHeight) / dimensions.rows;

	svg
		.attr("viewBox", `0 0 ${width} ${width}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.style("font", "10px sans-serif");

	const simulation = d3.forceSimulation(chartData.data as any)
		.force("charge", d3.forceManyBody().strength(10))
		.force("x", d3.forceX().x(function(d: IMatrixDatum) {
			// Find the middle of the appropriate column of the matrix to centre this datum.
			return (Math.ceil(d.quad % dimensions.cols) + 0.5) * colSpace + yAxisWidth;
		}))
		.force("y", d3.forceY().y(function(d: IMatrixDatum) {
			// Find the middle of the appropriate row of the matrix to centre this datum.
			return (Math.ceil((d.quad + 1) / dimensions.cols) - 0.5) * rowSpace;
		}))
		.force("collision", d3.forceCollide().radius(function(d: any) {
			return d.radius;
		}))
		.on("tick", ticked);    // FIXME: Verify the tick is unregistered when finished

	function ticked() {
		const u = svg
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