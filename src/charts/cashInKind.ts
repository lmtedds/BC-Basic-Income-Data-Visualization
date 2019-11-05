import { data as cashInKindData } from "~data/20191028_cashInKind";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/cashInKindSunburst";

const fullProgramName = "Full Program Name";
const programName = "Program";
const programType = "Program Type/Target";
const spectrum = "Cash to In-Kind Spectrum";
const level = "Level of Government";
const childName = "Child";
const childFullName = "Child Full Name";
const colorA = "color";

interface IInKind {
	[fullProgramName]: string;
	[programName]: string;
	[programType]: string;
	[spectrum]: string;
	[level]: string;
	[programType]: string;
	[childName]: string;
	[childFullName]: string;
	[colorA]: string;
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

function treeToHierarchy(tree, obj: any = {programTypeEle: "root", value: 0,  name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IInKind) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[programName],
				levelEle: ele[level],
				spectrumEle: ele[spectrum],
				childProg: ele[childName],
				programTypeEle: ele[programType],
				value: 1,
				name: ele[programName] || ele[childName] || ele[spectrum],
				colorB: ele[colorA],
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {programTypeEle: key, value: 1,  name: key});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildCashInKindSunburstChart(svgEle?: SVGElement) {
	const sortKeys = [level, programType, spectrum, programName, childName];
	const sortData = listToSortedTree(cashInKindData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,
		margin: 10,
		showDepth: 5,
		radiusScaleExponent: 1.4,
		honourShowName: false,
		textWrapPadding: 10,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
