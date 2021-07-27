import { data as nunavutApplicationData } from "~data/nunavut_application";

import { scaleOrdinal } from "d3-scale";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const levelOfGovernment = "Level Of Government";
const responsibleMinistry = "Administering Agency";
const administeredBy = "Delivery Agency";
const programName = "Program Name";
const fullProgramName = "Full Program Name";
const description = "Brief Description";
const application = "Method of Access";
const mode = "Mode of Access";
const eligibility = "Major Eligibility Conditions";
const eligMinor = "Other Eligibility Conditions";
const income = "Income Tested?";
const documents = "Documents required";
const taxfiling = "Is tax filing a requirement?";
const expend201617 = "2016/2017 Budget";
const recip201617 = "2016/2017 Number of recipients";
const expend201718 = "2017/2018 Budget";
const recip201718 = "2017/2018 Number of recipients";
const expend201819 = "2018/2019 budget";
const recip201819 = "2018/2019 Number of Recipients";
const expend201920 = "2019/2020 Budget";
const recip201920 = "2019/2020 Recipients";
const expend202021 = "2020/2021 budget";
const expend202122 = "2021/2022 budget";
const recip202122 = "2021/2022 Recipients";
const showName = "Show Name";

interface InunavutApplication {
	[programName]: string;
	[fullProgramName]: string;
	[levelOfGovernment]: string;
	[administeredBy]: string;
	[responsibleMinistry]: string;
	[description]: string;
	[application]: string;
	[mode]: string;
	[eligibility]: string;
	[eligMinor]: string;
	[income]: string;
	[documents]: string;
	[taxfiling]: string;
	[expend201617]: string;
	[recip201617]: string;
	[expend201718]: string;
	[recip201718]: string;
	[expend201819]: string;
	[recip201819]: string;
	[expend201920]: string;
	[recip201920]: string;
	[expend202021]: string;
	[expend202122]: string;
	[recip202122]: string;
	[showName]: string;

}

function listToSortedTree(array, sortKeys: string[]) {
	// Stuff into a object (used as a map) based on key
	const obj = {};

	array.forEach((ele) => {
		let subObj = obj;

		// Iterate over all the sort keys until we encounter one that doesn't exist.
		sortKeys.every((key, index) => {
			const value = ele[key];

			// If there is no value for the key, we should stop iterating keys here.
			if(!value) return false;

			// Last level of the hierarchy?
			if(index === sortKeys.length - 1 ||
				(ele[sortKeys[index + 1]] === "")) {
				// Last level of hierarchy/search. Insert our new element.
				if(subObj[value]) {
					subObj[value].push(ele);
				} else {
					subObj[value] = [ele];
				}
			} else {
				// Not last level of hierarchy. Just create the new level (if required)
				if(!subObj[value]) {
					subObj[value] = {};
				}

				subObj = subObj[value];
			}

			return true;
		});
	});

	return obj;
}

function makeTooltip(fullProgramNameEle, descrip, elig, eligMinorEle, incomeEle, documentsEle, taxfilingEle, modeEle): string {
	const tooltip =  `
		<div>
			${fullProgramNameEle ? `<hr><p class="header">${fullProgramNameEle}</p><hr>` : ""}
			${descrip ? `<p>${descrip}</p>` : ""}
			${elig ? `<p class = "eligibility">${elig}</p>` : ""}
			${eligMinorEle ? `<p class = "otherEligibility">${eligMinorEle}</p>` : ""}
			${incomeEle ? `<p class = "income">${incomeEle}</p>` : ""}
			${documentsEle ? `<p class = "documents">${documentsEle}</p>` : ""}
			${taxfilingEle ? `<p class = "taxfiling">${taxfilingEle}</p>` : ""}
			${modeEle ? `<p class = "modeAccess">${modeEle}</p>` : ""}
		</div>`;

	return tooltip;
}

const colour = scaleOrdinal(["rgb(197, 27, 125)", "rgb(241, 182, 218)", "#762a83"]);

const colour2 = scaleOrdinal(["rgb(84, 48, 5)", "rgb(140, 81, 10)" , "rgb(191, 129, 45)", "rgb(246, 232, 205)",  "rgb(199, 234, 229)", "rgb(128, 205, 193)", "rgb(53, 151, 143)" , "rgb(1, 102, 94)" ]);

const colourAuto = scaleOrdinal([ "rgb(223, 194, 125)"]);

function eleToColour(key: string, level: number, parentColour: string): string {
	if(level === 1) {
		return colour(key);
	} else if(level === 2 && key === "Automatic with Other Self Initiated Application") {
		return colourAuto(key);
	} else if(level === 2) {
		return colour2(key);
	} else if(level === 3) {
		return parentColour;
	} else if(level === 4) {
		return  parentColour;
	} else {
		console.error(`No colour mapping for level ${level}/${key}`);
		return "red";
	}
}

// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {level: "root", showName: false, value: 0, name: "root", depth: 1, colour: "black"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: InunavutApplication) => {
			return {
				program: ele[programName],
				fullProgramNameEle: ele[fullProgramName],
				level: ele[levelOfGovernment],
				ministry: ele[responsibleMinistry],
				admin: ele[administeredBy],
				descrip: ele[description],
				applicationEle: ele[application],
				elig: ele[eligibility],
				eligMinorEle: ele[eligMinor],
				incomeEle: ele[income],
				documentsEle: ele[documents],
				taxfilingEle: ele[taxfiling],
				modeEle: ele[mode],
				value: 1,
				showName: ele[showName] ? (ele[showName].toLowerCase() === "true") : false,
				name: ele[programName] || ele[application],
				tooltip: makeTooltip(ele[fullProgramName], ele[description], ele[eligibility], ele[eligMinor], ele[income], ele[documents], ele[taxfiling], ele[mode] ),
				colour: obj.colour			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {level: key, applicationEle: key,  value: 1, showName: true, name: key, depth: obj.depth + 1 , colour: eleToColour(key, obj.depth, obj.colour)});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildNunavutApplicationSunburst(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, application, programName];
	const sortData = listToSortedTree(nunavutApplicationData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);

	/// console.log(`hier: ${JSON.stringify(sortData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,
		margin: 10,

		showDepth: 3,
		radiusScaleExponent: 1.5,

		textWrapPadding: 10,

		honourShowName: false,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
