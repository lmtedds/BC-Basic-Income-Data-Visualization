import { data as ministryData } from "~data/20190927_ministries";

import { buildZoomablePackedCircleChart, ID3Hierarchy } from "~charts/d3/circle";
import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const levelOfGovernment = "Level of Government";
const responsibleMinistry = "Responsible Ministry:";
const administeredBy = "Administered By:";
const showName = "Show Name";
const programName = "Program";
const programSize = "$ amount of benefits (BC only)";
const numReceipientsBcOnly = "Number of Recipients (BC only)";

// Older version of data looks like this
interface IMinistry20190824Version {
	"Program": string;
	"Program Type/Target": string;
	[levelOfGovernment]: string;
	"Managed by (Ministry):": string;
	"Ministry - point of contact/administration:": string;
	"Ministry - point of contact/administration - government:": string;
	"Importance Ranking": string;
}

interface IMinistry20190913Version {
	[programSize]: string; // string represention a number
	[programName]: string;
	[showName]: string; // string representation of a boolean
	[levelOfGovernment]: string;
	[administeredBy]: string;
	[responsibleMinistry]: string;
	[numReceipientsBcOnly]: string; // string representation of a number
}

interface IMinistry {
	[programSize]: string; // string represention a number
	[programName]: string;
	[showName]: string; // string representation of a boolean
	[levelOfGovernment]: string;
	[administeredBy]: string;
	[responsibleMinistry]: string;
	[numReceipientsBcOnly]: string; // string representation of a number
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

function makeTooltip(program): string {
				// Disability Assistance
				// Number of Recipients (July 2019): 190,227
				// Total Expenditures (2017/2018): $1,300M
				// The BCEA Program for Persons with Disabilities provides disability assistance and supplements to provide greater independence for people with disabilities, including security of income, enhanced well-being, and participation in the community.
				// Major Eligibility Requirements: persons with disability, low income, means-tested
				// Website link: https://www2.gov.bc.ca/gov/content/family-social-supports/services-for-people-with-disabilities/disability-assistance

	return `
		<div>
			<em>${program}</em>
			<p>Number of Recipients (July 2019): 190,227</p>
			<p>Total Expenditures (2017/2018): $1,300M</p>
			<p>The BCEA Program for Persons with Disabilities provides disability assistance and supplements to provide greater independence for people with disabilities, including security of income, enhanced well-being, and participation in the community. Major Eligibility Requirements: persons with disability, low income, means-tested</p>
			<a href="https://www2.gov.bc.ca/gov/content/family-social-supports/services-for-people-with-disabilities/disability-assistance">https://www2.gov.bc.ca/gov/content/family-social-supports/services-for-people-with-disabilities/disability-assistance</a>
		</div>`;
}

// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {ministry: "root", showName: false, value: 0, name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IMinistry) => {
			return {
				program: ele[programName],
				level: ele[levelOfGovernment],
				ministry: ele[responsibleMinistry],
				admin: ele[administeredBy],
				value: 1,
				showName: ele[showName] ? (ele[showName].toLowerCase() === "true") : false,
				name: ele[programName] || ele[administeredBy] || ele[responsibleMinistry],

				tooltip: makeTooltip(ele[programName]),
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {ministry: key, value: 1, showName: true, name: key});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildMinistryComplexityCircleChart(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, responsibleMinistry, administeredBy];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const hierData: ID3Hierarchy = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	return buildZoomablePackedCircleChart(hierData, svgEle);
}

export function buildMinistryComplexitySunburstChart(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, responsibleMinistry, administeredBy];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,

		showDepth: 3,
		radiusScaleExponent: 1.4,

		textWrapPadding: 10,

		honourShowName: false,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
