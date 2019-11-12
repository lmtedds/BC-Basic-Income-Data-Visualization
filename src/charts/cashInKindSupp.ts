import { data as cashSuppData } from "~data/20191112_cashInKindSupp";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/cashSuppSunburst";

const levelOfGovernment = "Level of Government";
const programName = "Program";
const fullProgramName = "Full Program Name";
const programType = "Program Type/Target";
const description = "Description";
const eligibility = "Eligibility";
const spectrum = "Cash to In-Kind Spectrum";
const childProgram = "Child";
const childFull = "Child Full Name";
const recip2017 = "Number of Recipients (2017/2018)";
const expend2017 = "Expenditures (2017/2018)";
const recip2018 = "Number of Recipients (2018/2019)";
const expend2018 = "Expenditures (2018/2019)";
const notes = "Notes";


interface ICashKindSupp {
	[programName]: string;
	[fullProgramName]: string;
	[levelOfGovernment]: string;
	[spectrum]: string;
	[description]: string;
	[eligibility]: string;
	[expend2018]: string;
	[recip2018]: string;
	[expend2017]: string;
	[recip2017]: string;
	[childProgram]: string;
	[childFull]: string;
	[notes]: string;
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

function makeTooltip(childFullEle, descrip, recip2017Ele, expend2017Ele, recip2018Ele, expend2018Ele, elig): string {
	const tooltip =  `
		<div>
			${childFullEle ? `<hr><p class="header">${childFullEle}</p><hr>` : ""}
			${descrip ? `<p>${descrip}</p>` : ""}
			${elig ? `<p class = "eligibility">${elig}</p>` : ""}
			${recip2017Ele ? `<p class = "recip201718">${recip2017Ele}</p>` : ""}
			${expend2017Ele ? `<p class = "expend201718">${expend2017Ele}</p>` : ""}
			${recip2018Ele ? `<p class = "recip201819">${recip2018Ele}</p>` : ""}
			${expend2018Ele ? `<p class = "expend201819">${expend2018Ele}</p>` : ""}
						</div>`;

	return tooltip;
}

// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {spectrumEle: "root", showName: false, value: 0, name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: ICashKindSupp ) => {
			return {
				fullprogram: ele[fullProgramName],
				programTypeEle: ele[programType],
				spectrumEle: ele[spectrum],
				program: ele[programName],
				level: ele[levelOfGovernment],
				descrip: ele[description],
				elig: ele[eligibility],
				recip2017Ele: ele[recip2017],
				expend2017Ele: ele[expend2017],
				recip2018Ele: ele[recip2018],
				expend2018Ele: ele[expend2018],
				childFullEle: ele[childFull],
				childProgramEle: ele[childProgram],
				notesEle: ele[notes],
				value: 1,
				// showName: ele[showName] ? (ele[showName].toLowerCase() === "true") : false,
				name: ele[childProgram] || ele[programType] || ele[spectrum],
				tooltip: makeTooltip(ele[childFull], ele[description], ele[recip2017], ele[expend2017], ele[recip2018], ele[expend2018], ele[eligibility]),
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {spectrum: key, value: 1, showName: true, name: key});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildCashSuppSunburstChart(svgEle?: SVGElement) {
	const sortKeys = [spectrum, programType, childProgram];
	const sortData = listToSortedTree(cashSuppData, sortKeys);
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

