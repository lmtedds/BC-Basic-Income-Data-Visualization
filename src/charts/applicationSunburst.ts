import { data as applicationData } from "~data/20200109_application";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/cashInKindSunburst";

const workingAgeData = applicationData.filter(function(workingAge) {
	return workingAge.Age === "Working-Age";
},
);

const fullProgramName = "Full Program Name";
const programName = "Program";
const applicationMethod = "Application Method";
const age = "Age";
const programType = "Program Type/Target";
const level = "Level of Government";
const admin = "Administrator";

interface IApplication {
	[fullProgramName]: string;
	[programName]: string;
	[age]: string;
	[applicationMethod]: string;
	[programName]: string;
	[programType]: string;
	[level]: string;
	[admin]: string;

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

function makeTooltip(fullprogram ): string {
	const tooltip =  `
		<div>
			${fullprogram ? `<hr><p class="header">${fullprogram}</p><hr>` : ""}
		</div>`;

	return tooltip;
}

function treeToHierarchy(tree, obj: any = {adminEle: "root", value: 0,  name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IApplication) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[programName],
				levelEle: ele[level],
				programTypeEle: ele[programType],
				adminEle: ele[admin],
				appMethodEle: ele[applicationMethod],
				value: 1,
				name: ele[programName] || ele[applicationMethod] || ele[admin],
				tooltip: makeTooltip(ele[fullProgramName]),
				};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {adminEle: key, value: 1,  name: key});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildWorkingAgeApplicationSunburstChart(svgEle?: SVGElement) {
	const sortKeys = [level,  applicationMethod, programName];
	const sortData = listToSortedTree(applicationData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,
		margin: 10,
		showDepth: 3,
		radiusScaleExponent: 1.5,
		honourShowName: false,
		textWrapPadding: 10,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
