import { data as applicationData } from "~data/20190926_application";

import { buildMatrixForceChart, IMatrixChart, solidCircleSimulationJoinFn } from "~charts/d3/force_matrix";

const appMethod = "Application Method";
const corroborated = "Corroborated";
const category = "Eligibility Category";
const level = "Level of Government";
const otherRequirements = "Other Eligibility Requirements";
const program = "Program";
const progType = "Program Type/Target";

interface IApplication20190824Version {
	[appMethod]: string;
	[corroborated]: string;
	[category]: string;
	[level]: string;
	[otherRequirements]: string;
	[program]: string;
	[progType]: string;
}

interface IApplication {
	[appMethod]: string;
	[corroborated]: "Corroborated" | "Not Corroborated";
	[level]: string;
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
		const corrob = ele[corroborated];
		const method = ele[appMethod];

		if(!corrob || !method) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(corrob);
			yTitlesSet.add(method);

			// Put the data in the right "quadrant"
			let typeMap = positionedData.get(method);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IApplication[]>();
				positionedData.set(method, typeMap);
			}

			// Initialize the array if required
			let progs = typeMap.get(corrob);
			if(!progs) {
				progs = [];
				typeMap.set(corrob, progs);
			}

			typeMap.set(corrob, progs.concat(ele));
		}
	});

	if(missing.length) console.log(`application program missing corroborated or method: ${missing}`);

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
	yTitles.forEach((yKey) => {
		const typeMap = intermediate.data.get(yKey);
		if(typeMap) {
			xTitles.forEach((xKey) => {
				const quadArray = [];

				const quadEntry = typeMap.get(xKey); // FIXME: Should be array!
				if(quadEntry) {
					quadEntry.forEach((entry) => {
						quadArray.push({
							xKey: xKey,
							yKey: yKey,
							data: {program: entry[program]},
							radius: 10, // FIXME: placeholder
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
		height: 1200,
		width: 800,

		margins: {top: 40, right: 20, bottom: 20, left: 160},

		xAxisFontSize: "25px",
		yAxisFontSize: "25px",

		// yAxisQuadLines: true,
		// xAxisQuadLines: true,

		renderMethod: solidCircleSimulationJoinFn,

		// simulateIterationsAtStart: 200,
	};

	return buildMatrixForceChart(matrixData, svgEle);
}
