import { data as nunavutTargetData } from "~data/nunavut_target";

import { scaleOrdinal } from "d3-scale";

import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const levelOfGovernment = "Level Of Government";
const programTarget = "Program Type/Target";
const programName = "Program Name";
const fullProgramName = "Full Program Name";
const description = "Brief Description";
const cashinkind = "Cash to In-Kind Spectrum";
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

interface InunavutTarget {
	[programName]: string;
	[fullProgramName]: string;
	[levelOfGovernment]: string;
	[description]: string;
	[cashinkind]: string;
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

function makeTooltip(fullProgramNameEle, descrip, elig, eligMinorEle, incomeEle, documentsEle, taxfilingEle, expend201617Ele, recip201617Ele, expend201718Ele, recip201718Ele, expend201819Ele, recip201819Ele, expend201920Ele, recip201920Ele, expend202021Ele, expend202122Ele, recip202122Ele): string {
	const tooltip =  `
		<div>
			${fullProgramNameEle ? `<hr><p class="header">${fullProgramNameEle}</p><hr>` : ""}
			${descrip ? `<p>${descrip}</p>` : ""}
			${elig ? `<p class = "eligibility">${elig}</p>` : ""}
			${eligMinorEle ? `<p class = "otherEligibility">${eligMinorEle}</p>` : ""}
			${incomeEle ? `<p class = "income">${incomeEle}</p>` : ""}
			${documentsEle ? `<p class = "documents">${documentsEle}</p>` : ""}
			${taxfilingEle ? `<p class = "taxfiling">${taxfilingEle}</p>` : ""}
			${expend201617Ele ? `<p class = "expend201617">${expend201617Ele}</p>` : ""}
			${recip201617Ele ? `<p class = "recip201617">${recip201617Ele}</p>` : ""}
			${expend201718Ele ? `<p class = "expend201718">${expend201718Ele}</p>` : ""}
			${recip201718Ele ? `<p class = "recip201718">${recip201718Ele}</p>` : ""}
			${expend201819Ele ? `<p class = "expend201819">${expend201819Ele}</p>` : ""}
			${recip201819Ele ? `<p class = "recip201819">${recip201819Ele}</p>` : ""}
			${expend201920Ele ? `<p class = "expend201920">${expend201920Ele}</p>` : ""}
			${recip201920Ele ? `<p class = "recip201920">${recip201920Ele}</p>` : ""}
			${expend202021Ele ? `<p class = "expend202021">${expend202021Ele}</p>` : ""}
			${expend202122Ele ? `<p class = "expend202122">${expend202122Ele}</p>` : ""}
			${recip202122Ele ? `<p class = "recip202122">${recip202122Ele}</p>` : ""}
		</div>`;

	return tooltip;
}

const colour = scaleOrdinal(["rgb(197, 27, 125)", "rgb(241, 182, 218)", "#762a83"]);

const colour2 = scaleOrdinal(["#8F9978", "#B3AF8B", "#D7D1AF", "#C9AE81", "#A98782", "#87788A"]);

const colorCash = scaleOrdinal(["#006600"]);

const colorCashCost = scaleOrdinal(["#7fb27f"]);

const colorKind = scaleOrdinal(["#992277"]);

const colorRefundable = scaleOrdinal(["#00aeef"]);

const colorNonRefundable = scaleOrdinal(["#66cef5"]);

const colorDeduct = scaleOrdinal(["#cceefb"]);

const colorService = scaleOrdinal(["#fec22d"]);

const colorFavor = scaleOrdinal(["#7f6116"]);

function eleToColour(key: string, level: number, parentColour: string): string {
	if(level === 1) {
		return colour(key);
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
		return tree.map((ele: InunavutTarget) => {
			return {
				program: ele[programName],
				fullProgramNameEle: ele[fullProgramName],
				level: ele[levelOfGovernment],
				target: ele[programTarget],
				descrip: ele[description],
				cashinkindEle: ele[cashinkind],
				elig: ele[eligibility],
				eligMinorEle: ele[eligMinor],
				incomeEle: ele[income],
				documentsEle: ele[documents],
				taxfilingEle: ele[taxfiling],
				expend201617Ele: ele[expend201617],
				recip201617Ele: ele[recip201617],
				expend201718Ele: ele[expend201718],
				recip201718Ele: ele[recip201718],
				expend201819Ele: ele[expend201819],
				recip201818Ele: ele[recip201819],
				expend201920Ele: ele[expend201920],
				recip201920Ele: ele[recip201920],
				expend202021Ele: ele[expend202021],
				expend202122Ele: ele[expend202122],
				recip202122Ele: ele[recip202122],
				value: 1,
				showName: ele[showName] ? (ele[showName].toLowerCase() === "true") : false,
				name: ele[programName] || ele[eligibility] || ele[programTarget],
				tooltip: makeTooltip(ele[fullProgramName], ele[description], ele[eligibility], ele[eligMinor], ele[income], ele[documents], ele[taxfiling], ele[expend201617], ele[recip201617], ele[expend201718], ele[recip201718], ele[expend201819], ele[recip201819], ele[expend201920], ele[recip201920], ele[expend202021], ele[expend202122], ele[recip202122] ),
				colour: obj.colour			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHierarchy(tree[key], {level: key, target: key, elig: key, value: 1, showName: true, name: key, depth: obj.depth + 1 , colour: eleToColour(key, obj.depth, obj.colour)});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

export function buildNunavutTargetSunburst(svgEle?: SVGElement) {
	const sortKeys = [levelOfGovernment, programTarget, eligibility, programName];
	const sortData = listToSortedTree(nunavutTargetData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);

	console.log(`hier: ${JSON.stringify(sortData, null, 4)}`);

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
