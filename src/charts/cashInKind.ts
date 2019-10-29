import { data as cashInKindData } from "~data/20191028_cashInKind";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const fullProgramName = "Full Program Name";
const program = "Program";
const programType = "Program Type/Target";
const spectrum = "Cash to In-Kind Spectrum";
const level = "Level of Government";
const parentProg = "Parent";

interface IInKind {
	[fullProgramName]: string;
	[program]: string;
	[programType]: string;
	[spectrum]: string;
	[level]: string;
	[parentProg]: string;
}

function listToSortedTree(array, sortKeys: string[]) {
	// Stuff into a object (used as a map) based on key
	const obj = {};

	array.forEach((ele) => {
		let subObj = obj;
		sortKeys.forEach((key, index) => {
			const value = ele[key];
			if(index === sortKeys.length - 1 ) {
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
		});
	});

	return obj;
}
function treeToHierarchy(tree, obj: any = {spectrumEle: "root",  value: 0, name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IInKind) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[program],
				levelEle: ele[level],
				spectrumEle: ele[spectrum],
				parentProg: ele[parentProg],
				value: 1,
				name: ele[program] || ele[spectrum] || ele[parentProg],
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {spectrum: key, value: 1,  name: key});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildcashInKindSunburstChart(svgEle?: SVGElement) {
	const sortKeys = [level, spectrum, program, parentProg];
	const sortData = listToSortedTree(cashInKindData, sortKeys);
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
