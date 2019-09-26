import { data as eligibilityData } from "~data/20190824_eligibility";

import { buildMatrixForceChart, circleWithNameSimulationJoinFn, IMatrixChart } from "~charts/d3/force_matrix";

const program = "Program";
const programType = "Program Type/Target";
const govLevel = "Level of Government";
const category = "Category";
const condOrCont = "Conditional or Contributory";
const incOrAss = "Income or Asset Tested";
const eligibility = "Eligibility Category";
const otherRequirements = "Other Eligibility Requirements:";
const overview = "Program Overview";
const importance = "Importance Ranking";
const notes = "Notes";
const website = "Website Link";

interface IEligibility {
	[program]: string;
	[programType]: string;
	[govLevel]: string;
	[category]: string;
	[condOrCont]: string;
	[incOrAss]: string;
	[eligibility]: string;
	[otherRequirements]: string;
	[overview]: string;
	[importance]: string;
	[notes]: string;
	[website]: string;
}

interface IEligibilityIntermediateData {
	xTitles: Set<string>;
	yTitles: Set<string>;

	data: Map<string, Map<string, IEligibility[]>>;
}

function dataToIntermediate(data: IEligibility[]): IEligibilityIntermediateData {
	const xTitlesSet = new Set<string>();
	const yTitlesSet = new Set<string>();
	const catSet = new Set<string>();
	const positionedData = new Map<string, Map<string, IEligibility[]>>(); //  spectrum -> Map<program type, IInKind>

	const missing = [];

	data.forEach((ele) => {
		const progType = ele[programType];
		const eligCat = ele[eligibility];

		if(!progType || !eligCat) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(progType);
			yTitlesSet.add(eligCat);

			// Put the data in the correct "quadrant"
			let typeMap = positionedData.get(eligCat);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IEligibility[]>();
				positionedData.set(eligCat, typeMap);
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

	console.log(`eligibility program missing type or eligibility category: ${missing}`);

	return {
		xTitles: xTitlesSet,
		yTitles: yTitlesSet,

		data: positionedData,
	};
}

// x axis (on top) is “Program Type/Target” Subdivide by “Category”.
// y axis is “Eligibility Category”
// Size of circle could be “Importance Ranking” or they could all be the same size.
function convertData(data: IEligibility[]): IMatrixChart {
	const intermediate = dataToIntermediate(eligibilityData);

	const xTitles = Array.from(intermediate.xTitles);
	const yTitles = Array.from(intermediate.yTitles);

	const quadData = [];
	yTitles.forEach((yKey) => {
		const typeMap = intermediate.data.get(yKey);
		if(typeMap) {
			xTitles.forEach((xKey) => {
				const quadEntry = typeMap.get(xKey); // FIXME: Should be array!
				if(quadEntry) {
					quadData.push(
						quadEntry.map((entry) => {
							return {
								xKey: xKey,
								yKey: yKey,
								data: {program: entry[program]},
								radius: 30,
								name: entry[program],
							};
						}),
					);
				}
			});
		}
	});

	const matrixData = {
		axes: {
			xTitles: xTitles,
			yTitles: yTitles,
		},
		data: quadData,
	};

	return matrixData;
}

export function buildEligibilityChart(svgEle?: SVGElement) {
	const matrixData = convertData(eligibilityData);
	const fudge = 1;
	matrixData.setup = {
		height: 5500 * fudge,
		width: 2200 * fudge,

		margins: {top: 160, right: 10, bottom: 20, left: 260},

		xAxisFontSize: "40px",
		yAxisFontSize: "40px",

		renderMethod: circleWithNameSimulationJoinFn,

		simulateIterationsAtStart: 100,
	};

	return buildMatrixForceChart(matrixData, svgEle);
}
