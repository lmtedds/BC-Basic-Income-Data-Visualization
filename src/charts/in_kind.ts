import { data as inKindData } from "~data/20190824_cashInKind";

import { buildMatrixForceChart, IMatrixChart, solidCircleSimulationJoinFn } from "~charts/d3/force_matrix";

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
		const spect = ele[spectrum];
		const progType = ele[programType];

		if(!spect || !progType) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(progType);
			yTitlesSet.add(spect);

			// Put the data in the right "quadrant"
			let typeMap = positionedData.get(spect);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IInKind[]>();
				positionedData.set(spect, typeMap);
			}

			// Initialize the array if required
			let progs = typeMap.get(progType);
			if(!progs) {
				progs = [];
				typeMap.set(progType, progs);
			}

			typeMap.set(progType, progs.concat(ele));
		}
	});

	console.log(`in kind program missing spectrum or type: ${missing}`);

	return {
		xTitles: xTitlesSet,
		yTitles: yTitlesSet,

		data: positionedData,
	};
}

function convertData(data: IInKind[]): IMatrixChart {
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
							xKey: programTypeKey,
							yKey: spectrumKey,
							data: {program: entry[program]},
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
	const convertedData = convertData(inKindData);
	convertedData.setup = {
		height: 1000,
		width: 1000,

		margins: {top: 40, right: 20, bottom: 20, left: 60},

		xAxisFontSize: "10px",
		yAxisFontSize: "10px",

		renderMethod: solidCircleSimulationJoinFn,

		simulateIterationsAtStart: 100,
	};

	return buildMatrixForceChart(convertedData, svgEle);
}
