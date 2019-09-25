import { data as eligibilityData } from "~data/20190824_eligibility";

import { buildMatrixForceChart, IMatrixChart } from "~charts/d3/force_matrix";

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
		const elig = ele[eligibility];
		const cat = ele[category];

		if(!progType || !elig || !cat) {
			// NOTE: We're tossing these entries.
			missing.push(ele[program]);
		} else {
			// Build Sets for axes
			xTitlesSet.add(elig);
			yTitlesSet.add(progType);
			catSet.add(cat);

			// Put the data in the right "quadrant"
			let typeMap = positionedData.get(progType);

			// Initialize 2nd level Map if required
			if(!typeMap) {
				typeMap = new Map<string, IEligibility[]>();
				positionedData.set(progType, typeMap);
			}

			// Initialize the array if required
			let progs = typeMap.get(elig);
			if(!progs) {
				progs = [];
				typeMap.set(elig, progs);
			}

			typeMap.set(elig, progs.concat(ele));
		}
	});

	console.log(`program missing type, eligibility, or category: ${missing}`);

	return {
		xTitles: xTitlesSet,
		yTitles: yTitlesSet,

		data: positionedData,
	};
}

// x axis (on top) is “Program Type/Target” Subdivide by “Category”.
// y axis is “Eligibility Category”
// Size of circle could be “Importance Ranking” or they could all be the same size.
function convertData(data): IMatrixChart {
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
								radius: 2, // FIXME: placeholder
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
	matrixData.setup = {
		height: 1000,
		width: 1000,

		margins: {top: 40, right: 20, bottom: 20, left: 60},

		xAxisFontSize: "5px",
		yAxisFontSize: "5px",
	};

	return buildMatrixForceChart(matrixData, svgEle);
}
