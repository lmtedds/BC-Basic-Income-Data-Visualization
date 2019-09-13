// This is where typescript/javascript starts from. A reference to it is automatically added to index.html (via webpack).
import { data as ministryData } from "~data/20190824_ministries";

import { buildZoomablePackedCircleChart } from "~charts/d3/circle";
import { buildZoomableSunburstChart } from "~charts/d3/sunburst";

interface IMinistry {
	"Program": string;
	"Program Type/Target": string;
	"Level of Government": string;
	"Managed by (Ministry):": string;
	"Ministry - point of contact/administration:": string;
	"Ministry - point of contact/administration - government:": string;
	"Importance Ranking": string;
}

interface ID3Hierarchy {
	ministry: string;
	showName: boolean;
	value: number;

	program?: string;
	children?: this[];
}

function listToSortedTree(array, sortKeys: string[]) {
	// Stuff into a object (used as a map) based on key
	const obj = {};

	array.forEach((ele) => {
		let subObj = obj;
		sortKeys.forEach((key, index) => {
			const value = ele[key];
			if(index === sortKeys.length - 1) {
				// Last level of hierarchy/search. Insert our new element.
				if(subObj[value]) {
					subObj[value].push(ele);
				} else {
					subObj[value] = [ele];
				}
			} else {
				// Not last level of hierarchy. Just create the new level (if required).
				if(!subObj[value]) {
					subObj[value] = {};
				}

				subObj = subObj[value];
			}
		});
	});

	return obj;
}

// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {ministry: "root", showName: false, value: 0}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IMinistry) => {
			return {
				program: ele.Program,
				level: ele["Level of Government"],
				ministry: ele["Managed by (Ministry):"],
				admin: ele["Ministry - point of contact/administration - government:"],
				value: 1, // FIXME: Value
				showName: true,
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {ministry: key, value: 1, showName: true});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildMinistryComplexityCircleChart(svgEle?: SVGElement) {
	const sortKeys = ["Level of Government", "Managed by (Ministry):", "Ministry - point of contact/administration:"];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const hierData = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	return buildZoomablePackedCircleChart(hierData, svgEle);
}

export function buildMinistryComplexitySunburstChart(svgEle?: SVGElement) {
	const sortKeys = ["Level of Government", "Managed by (Ministry):", "Ministry - point of contact/administration:"];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const hierData = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	return buildZoomableSunburstChart(hierData, 3, svgEle);
}
