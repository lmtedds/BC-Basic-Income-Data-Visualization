import { data as ministryData } from "~data/20200113_expenditure";

import { scaleOrdinal } from "d3-scale";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const levelOfGovernment = "Level of Government";
const programSize = "ExpendituresTotal";
const programName = "Program";
const fullProgramName = "Full Program Name";
const programType = "Program Type/Target";
const responsibleMinistry = "Responsible Ministry";
const administeredBy = "Administered By";
const description = "Description";
const eligibility = "Eligbility";
const conditions = "Conditions";
const expend201819 = "Expenditures (2018/19)";
const recip201819 = "Number of Recipients (2018/19)";
const cases2019 = "Cases (July 2019)";
const expend201718 = "Expenditures (2017/18)";
const child2018 = "Number of Eligible Children (March 2018)";
const baseFund2018 = "Base Program Funding (2018/19)";
const recip2017 = "Recipients (2017)";
const expend2017 = "Expenditures (2017)";
const budget2019 = "Budget (2019/20)";
const expend2019 = "Expenditures (2019 YTD)";
const recip2019 = "Recipient (2019 YTD)";
const recip201718 = "Recipients (2017/18)";
const recip2018 = "Recipients (2018)";
const expend2018 = "Expenditures (2018)";
const expend2016 = "Expenditures (2016)";
const recip201617 = "Recipients (2016/17)";
const colour3 = "colour";

interface IExpenditure {
	[programSize]: string; // string represention a number
	[programName]: string;
	[fullProgramName]: string;
	[levelOfGovernment]: string;
	[administeredBy]: string;
	[responsibleMinistry]: string;
	[description]: string;
	[eligibility]: string;
	[conditions]: string;
	[expend201819]: string;
	[recip201819]: string;
	[cases2019]: string;
	[expend201718]: string;
	[child2018]: string;
	[baseFund2018]: string;
	[recip2017]: string;
	[expend2017]: string;
	[budget2019]: string;
	[expend2019]: string;
	[recip2019]: string;
	[recip201718]: string;
	[recip2018]: string;
	[expend2018]: string;
	[expend2016]: string;
	[recip201617]: string;
	[colour3]: string;
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

function makeTooltip(fullprogram, descrip, elig, condit, expend201819Ele, recip201819Ele, cases2019Ele, expend201718Ele, child2018Ele, baseFund2018Ele, recip2017Ele, expend2017Ele, budget2019Ele, expend2019Ele, recip2019Ele, recip201718Ele, recip2018Ele, expend2018Ele, expend2016Ele, recip201617Ele): string {
	const tooltip =  `
		<div>
			${fullprogram ? `<hr><p class="header">${fullprogram}</p><hr>` : ""}
			${descrip ? `<p>${descrip}</p>` : ""}
			${recip201617Ele ? `<p class = "recip201617">${recip201617Ele}</p>` : ""}
			${expend2016Ele ? `<p class = "expend2016">${expend2016Ele}</p>` : ""}
			${recip2017Ele ? `<p class = "recip2017">${recip2017Ele}</p>` : ""}
			${recip201718Ele ? `<p class = "recip201718">${recip201718Ele}</p>` : ""}
			${expend2017Ele ? `<p class = "expend2017">${expend2017Ele}</p>` : ""}
			${expend201718Ele ? `<p class = "expend201718">${expend201718Ele}</p>` : ""}
			${recip2018Ele ? `<p class = "recip2018">${recip2018Ele}</p>` : ""}
			${child2018Ele ? `<p class = "child2018">${child2018Ele}</p>` : ""}
			${recip201819Ele ? `<p class = "recip201819">${recip201819Ele}</p>` : ""}
			${expend201819Ele ? `<p class = "expend201819">${expend201819Ele}</p>` : ""}
			${expend2018Ele ? `<p class = "expend2018">${expend2018Ele}</p>` : ""}
			${baseFund2018Ele ? `<p class = "baseFund2018">${baseFund2018Ele}</p>` : ""}
			${recip2019Ele ? `<p class = "recip2019">${recip2019Ele}</p>` : ""}
			${cases2019Ele ? `<p class = "cases2019">${cases2019Ele}</p>` : ""}
			${expend2019Ele ? `<p class = "expend2019">${expend2019Ele}</p>` : ""}
			${budget2019Ele ? `<p class = "budget2019">${budget2019Ele}</p>` : ""}
			${elig ? `<p class = "eligibility">${elig}</p>` : ""}
			${condit ? `<p class = "condition">${condit}</p>` : ""}

		</div>`;

	return tooltip;
}

const colour = scaleOrdinal(["rgb(197, 27, 125)", "rgb(241, 182, 218)", "#762a83"]);

const colour2 = scaleOrdinal(["#8c510a", "#d8b365", "#f6e8c3",  "#c7eae5", "#5ab4ac", "#01665e" ]);

const colourESD = scaleOrdinal(["#29A28F"]);

const colourDfin = scaleOrdinal(["#5FB9AB"]);

const colourSDPR = scaleOrdinal(["#ab5c18"]);

const colourFin = scaleOrdinal(["#be8147"]);

const colourMun = scaleOrdinal(["#b87437"]);

const colourLab = scaleOrdinal(["#cfa977"]);

const colourHealth = scaleOrdinal(["#d3b686"]);

const colourChild = scaleOrdinal(["#ca9c67"]);

const colourAdv = scaleOrdinal(["#b16828"]);

function eleToColour(key: string, level: number, parentColour: string): string {
	if(level === 1) {
		return colour(key);
	} else if(level === 2 && key === "Employment & Social Development"){
		return colourESD(key);
	} else if(level === 2 && key === "D.Finance"){
		return colourDfin(key);
	} else if(level === 2 && key === "Social Development & Poverty Reduction"){
		return colourSDPR(key);
	} else if(level === 2 && key === "Finance"){
		return colourFin(key);
	} else if(level === 2 && key === "Municipal Affairs & Housing"){
		return colourMun(key);
	} else if(level === 2 && key === "Labour"){
		return colourLab(key);
	} else if(level === 2 && key === "Health"){
		return colourHealth(key);
	} else if(level === 2 && key === "Children & Family Development"){
		return colourHealth(key);
	} else if(level === 2 && key === "Advanced Education, Skills & Training"){
		return colourHealth(key);
	} else if(level === 2) {
		return colour2(key);
	} else if(level === 3) {
		return parentColour; 
	} else if(level === 4) {
		return parentColour; 
	} else {
		console.error(`No colour mapping for level ${level}/${key}`);
		return "red";
	}
}


// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {level: "root", showName: false, value: 0, name: "root", depth: 1, colour: "black"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IExpenditure) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[programName],
				level: ele[levelOfGovernment],
				ministry: ele[responsibleMinistry],
				admin: ele[administeredBy],
				value: ele[programSize] ,
				name: ele[programName] ,
				descrip: ele[description],
				elig: ele[eligibility],
				condit: ele[conditions],
				expend201819Ele: ele[expend201819],
				recip201819Ele: ele[recip201819],
				cases2019Ele: ele[cases2019],
				expend201718Ele: ele[expend201718],
				child2018Ele: ele[child2018],
				baseFund2018Ele: ele[baseFund2018],
				recip2017Ele: ele[recip2017],
				expend2017Ele: ele[expend2017],
				budget2019Ele: ele[budget2019],
				expend2019Ele: ele[expend2019],
				recip2019Ele: ele[recip2019],
				recip201718Ele: ele[recip201718],
				recip2018Ele: ele[recip2018],
				expend2018Ele: ele[expend2018],
				expend2016Ele: ele[expend2016],
				recip201617Ele: ele[recip201617],
				tooltip: makeTooltip(ele[fullProgramName], ele[description], ele[eligibility], ele[conditions], ele[expend201819], ele[recip201819], ele[cases2019], ele[expend201718], ele[child2018], ele[baseFund2018], ele[recip2017], ele[expend2017], ele[budget2019], ele[expend2019], ele[recip2019], ele[recip201718], ele[recip2018], ele[expend2018], ele[expend2016], ele[recip201617]),
				colour: obj.colour,
				};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

	
		const sub = treeToHierarchy(tree[key], {level: key, ministry: key, admin: key,  value: 1, showName: true, name: key, depth: obj.depth + 1 , colour: eleToColour(key, obj.depth, obj.colour)});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

//By Ministry
export function buildExpenditureMinistryChart(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, responsibleMinistry, administeredBy, programName];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,
		margin: 10,

		showDepth: 4,
		radiusScaleExponent: 1.4,

		textWrapPadding: 10,

		honourShowName: false,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}


//By Program Type
export function buildExpenditureTypeChart(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, programType, programName];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,
		margin: 10,

		showDepth: 3,
		radiusScaleExponent: 1.4,

		textWrapPadding: 10,

		honourShowName: false,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
