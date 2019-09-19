import { data as inKindData } from "~data/20190824_cashInKind";

import { buildMatrixForceChart, IMatrixAxes, IMatrixChart } from "~charts/d3/force_matrix";

const program = "Program";
const programType = "Program Type/Target";
const spectrum = "Cash to In-Kind Spectrum";
const category = "Category";
const importance = "Importance Ranking";
const level = "Level of Government";

interface IInKind {
	[program]: string;
	[programType]: string;
	[spectrum]: string;
	[category]: string;
	[importance]: string;
	[level]: string;
}

interface IInKindIntermediateData {
	xTitles: Set<string>;
	yTitles: Set<string>;

	data: Map<string, Map<string, IInKind[]>>;
}

// Find all the unique program types (x axis) and spectrum types (y axis) in the data
function dataToIntermediate(data: IInKind[]): IInKindIntermediateData {
	const xTitlesSet = new Set<string>();
	const yTitlesSet = new Set<string>();
	const positionedData = new Map<string, Map<string, IInKind[]>>(); //  spectrum -> Map<program type, IInKind>

	const missing = [];

	data.forEach((ele) => {
		if(!ele[spectrum] || !ele[programType]) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(ele[programType]);
			yTitlesSet.add(ele[spectrum]);

			// Put the data in the right "quadrant"
			let typeMap = positionedData.get(ele[spectrum]);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IInKind[]>();
				positionedData.set(ele[spectrum], typeMap);
			}

			// Initialize the array if required
			let progs = typeMap.get(ele[programType]);
			if(!progs) {
				progs = [];
				typeMap.set(ele[programType], progs);
			}

			typeMap.set(ele[programType], progs.concat(ele));
		}
	});

	console.log(`program missing spectrum or type: ${missing}`);

	return {
		xTitles: xTitlesSet,
		yTitles: yTitlesSet,

		data: positionedData,
	};
}

function convertData(data): IMatrixChart {
	const intermediate = dataToIntermediate(data);

	const xTitles = Array.from(intermediate.xTitles);
	const yTitles = Array.from(intermediate.yTitles);

	const quadData = [];
	yTitles.forEach((spectrumKey) => {
		const typeMap = intermediate.data.get(spectrumKey);
		if(typeMap) {
			xTitles.forEach((programTypeKey) => {
				const quadArray = [];

				const quadEntry = typeMap.get(programTypeKey); // FIXME: Should be array!
				if(quadEntry) {
					quadEntry.forEach((entry) => {
						quadArray.push({
							data: {spectrum: spectrumKey, type: programTypeKey, program: entry[program]},
							radius: 5, // FIXME: placeholder
						});
					});
				}

				quadData.push(quadArray);
			});
		}
	});

	console.assert(quadData.length === yTitles.length * xTitles.length, `incorrect data array sizing`);

	const matrixData = {
		axes: {
			xTitles: xTitles,
			yTitles: yTitles,
		},
		data: quadData,
	};

	return matrixData;
}

export function buildInKindChart(svgEle?: SVGElement) {
	const fakeData: IMatrixChart = { // FIXME: fake data
		axes: {
			xTitles: ["x1", "x2", "x3"],
			yTitles: ["y1", "y2"],
		},
		data: [
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
		],
	};

	const convertedData = convertData(inKindData);
	convertedData.setup = {
		yAxisWidth: 200,
		xAxisHeight: 200,

		xAxisFontSize: "20px",
		yAxisFontSize: "20px",
	};

	return buildMatrixForceChart(convertedData, svgEle);
}
