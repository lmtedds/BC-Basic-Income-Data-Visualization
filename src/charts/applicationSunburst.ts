import { data as applicationData } from "~data/20200109_application";

import { scaleOrdinal } from "d3-scale";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const workingAgeData = applicationData.filter(function(workingAge) {
	return workingAge.Age === "Working-Age";
},
);

const fullProgramName = "Full Program Name";
const programName = "Program";
const applicationMethod = "Application Method";
const age = "Age";
const programType = "Program Type/Target";
const levelGov = "Level of Government";
const admin = "Administrator";

interface IApplication {
	[fullProgramName]: string;
	[programName]: string;
	[age]: string;
	[applicationMethod]: string;
	[programName]: string;
	[programType]: string;
	[levelGov]: string;
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

const colour = scaleOrdinal(["rgb(197, 27, 125)", "rgb(241, 182, 218)", "#762a83"]);

const colour2 = scaleOrdinal(["rgb(84, 48, 5)", "rgb(140, 81, 10)" , "rgb(191, 129, 45)", "rgb(223, 194, 125)", "rgb(246, 232, 205)",  "rgb(199, 234, 229)", "rgb(128, 205, 193)", "rgb(53, 151, 143)" , "rgb(1, 102, 94)" ]);

function eleToColour(key: string, level: number, parentColour: string): string {
	if(level === 1) {
		return colour(key);
	} else if(level === 2) {
		return colour2(key);
	} else if(level === 3) {
		return parentColour;
	} else {
		console.error(`No colour mapping for level ${level}/${key}`);
		return "red";
	}
}

function treeToHierarchy(tree, obj: any = {levelGov: "root", showName: false, value: 0, name: "root", depth: 1, colour: "black"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IApplication) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[programName],
				levelEle: ele[levelGov],
				programTypeEle: ele[programType],
				adminEle: ele[admin],
				appMethodEle: ele[applicationMethod],
				value: 1,
				name: ele[programName] || ele[applicationMethod] || ele[admin],
				tooltip: makeTooltip(ele[fullProgramName]),
				colour: obj.colour,
				};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {levelGov: key, ministry: key, admin: key,  value: 1, showName: true, name: key, depth: obj.depth + 1 , colour: eleToColour(key, obj.depth, obj.colour)});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildWorkingAgeApplicationSunburstChart(svgEle?: SVGElement) {
	const sortKeys = [levelGov,  applicationMethod, programName];
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
