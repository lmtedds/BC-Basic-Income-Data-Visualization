import { data as applicationData } from "~data/20190824_application";

import { buildMatrixForceChart, IMatrixChart, solidCircleSimulationJoinFn } from "~charts/d3/force_matrix";

const appMethod = "Application Method";
const corrob = "Corroborated";
const category = "Eligibility Category";
const level = "Level of Government";
const otherRequirements = "Other Eligibility Requirements";
const program = "Program";
const progType = "Program Type/Target";

interface IApplication {
	[appMethod]: string;
	[corrob]: string;
	[category]: string;
	[level]: string;
	[otherRequirements]: string;
	[program]: string;
	[progType]: string;
}

// -	Another matrix, should be similar to Cash/In-kind visual.
// -	“Application Method” across bottom. “Corroborated” on vertical.
// -	Each program should have its own circle. Size of circle could be “Importance Ranking” or they could all be the same size. I may eventually want to do size of government expenditure on program or number of participants (if this data ever comes in).
// -	Color circles/programs by “Level of Government” (same colors as in Eligibility visual)
// -	Have names of programs with an “Importance Ranking” of 2 visible. Create legend for 1’s

interface IInKindIntermediateData {
	xTitles: Set<string>;
	yTitles: Set<string>;

	data: Map<string, Map<string, IApplication[]>>;
}

// Find all the unique program types (x axis) and spectrum types (y axis) in the data
function dataToIntermediate(data: IApplication[]): IInKindIntermediateData {
	const xTitlesSet = new Set<string>();
	const yTitlesSet = new Set<string>();
	const positionedData = new Map<string, Map<string, IApplication[]>>(); //  spectrum -> Map<program type, IInKind>

	const missing = [];

	data.forEach((ele) => {
		const corroborated = ele[corrob];
		const method = ele[appMethod];

		if(!corroborated || !method) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(method);
			yTitlesSet.add(corroborated);

			// Put the data in the right "quadrant"
			let typeMap = positionedData.get(corroborated);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IApplication[]>();
				positionedData.set(corroborated, typeMap);
			}

			// Initialize the array if required
			let progs = typeMap.get(method);
			if(!progs) {
				progs = [];
				typeMap.set(method, progs);
			}

			typeMap.set(method, progs.concat(ele));
		}
	});

	console.log(`application program missing corroborated or method: ${missing}`);

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

export function buildApplicationChart(svgEle?: SVGElement) {
	const matrixData = convertData(applicationData);
	matrixData.setup = {
		height: 1000,
		width: 1000,

		margins: {top: 40, right: 20, bottom: 20, left: 60},

		xAxisFontSize: "5px",
		yAxisFontSize: "5px",

		renderMethod: solidCircleSimulationJoinFn,
	};

	buildMatrixForceChart(matrixData);
}
