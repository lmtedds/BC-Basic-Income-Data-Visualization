import { data as ministryData } from "~data/20191008_ministries";

import { buildZoomablePackedCircleChart, ID3Hierarchy } from "~charts/d3/circle";
import { buildZoomableSunburstChart, ISunburstChart } from "~charts/d3/sunburst";

const levelOfGovernment = "Level of Government";
const responsibleMinistry = "Responsible Ministry:";
const administeredBy = "Administered By:";
const showName = "Show Name";
const programName = "Program";
const fullProgramName = "Full Program Name";
const programSize = "$ amount of benefits (BC only)";
const numReceipientsBcOnly = "Number of Recipients (BC only)";
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

interface IMinistry20191005Version {
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
	[fullProgramName]: string;
	[showName]: string; // string representation of a boolean
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

<<<<<<< HEAD
function makeTooltip(fullprogram, descrip, elig, condit, expend201819Ele, recip201819Ele, cases2019Ele, expend201718Ele, child2018Ele, baseFund2018Ele, recip2017Ele, expend2017Ele, budget2019Ele, expend2019Ele, recip2019Ele, recip201718Ele, recip2018Ele, expend2018Ele, expend2016Ele, recip201617Ele): string {
	return `
		<div>
		<hr> <p class="header">${fullprogram}</p><hr>
			<p>${descrip}</p>
			<p class = "recip201617">${recip201617Ele}</p>
			<p class = "expend2016">${expend2016Ele}</p>
			<p class = "recip2017">${recip2017Ele}</p>
			<p class = "recip201718">${recip201718Ele}</p>
			<p class = "expend2017">${expend2017Ele}</p>
			<p class="expend201718">${expend201718Ele}</p>
			<p class = "recip2018">${recip2018Ele}</p>
			<p class="child2018">${child2018Ele}</p>
			<p class="recip201819">${recip201819Ele}</p>
			<p class="expend201819">${expend201819Ele}</p>
			<p class = "expend2018">${expend2018Ele}</p>
			<p class = "baseFund2018">${baseFund2018Ele}</p>
			<p class = "recip2019">${recip2019Ele}</p>
			<p class = "cases2019">${cases2019Ele}</p>
			<p class = "expend2019">${expend2019Ele}</p>
			<p class = "budget2019">${budget2019Ele}</p>
			<p class = "eligibility">${elig}</p>
			<p class="condition">${condit}</p>
		<div>`;
=======
function makeTooltip(program): string {
	if(program === "Disability Assistance") {
		return `
			<div>
				<hr>
				<p style = "font-size: 20px"><strong>${program}</strong></font></p>
				<hr>
							<p>The BCEA Program for Persons with Disabilities provides disability assistance and supplements to provide greater independence for people with disabilities, including security of income, enhanced well-being, and participation in the community. </p>
				<p><b>Number of Cases (July 2019):</b> 190,227</p>
				<p><b>Total Expenditures (2017/2018):</b> $1,300M</p>
				<p><b>Major Eligibility Requirements:</b> persons with disability, low income, means-tested</p>
				<a href="https://www2.gov.bc.ca/gov/content/family-social-supports/services-for-people-with-disabilities/disability-assistance">https://www2.gov.bc.ca/gov/content/family-social-supports/services-for-people-with-disabilities/disability-assistance</a>
			</div>`;
	} else if(program === "Income Assistance") {
		return `
			<div>
				<hr>
				<p style = "font-size: 20px"><strong>${program}</strong></font></p> <hr>
					<p>The BC Employment and Assistance (BCEA) program is an income and asset tested program that provides income assistance and employment supports to people in need who have no other resources. The program is intended to help move people from income assistance to sustainable employment and to provide income assistance to those who are unable to fully participate in the workforce. </p>
				<p><b>Number of Cases (July 2019):</b> 44,059</p>
				<p><b>Total Expenditures (2017/2018):</b> $347M</p>
						<p><b>Major Eligibility Requirements:</b> low income, means-tested</p>
				<p><b>Programs and Eligibility Requirements:</b> <ol style="margin-top: -12px;"> <li>Expected-to-Work: 3 week work search,and financially independent for at least consecutive 2 years prior to;</li>
					<li>Not Expected to Work: PWD, single parent with child under 3, fleeing abuse, or cannot legally work in Canada;</li>
					<li>Persons with Persistent and Multiple Barriers to Work: health condition that impede's employment and additional barrier to employment such as homelessness, fleeing abuse, former child in care, or criminal record ;</li>
					<li> Medical Condition: short-term medical condition</li>
					</ol>	</p>
				<a href="https://www2.gov.bc.ca/gov/content/family-social-supports/income-assistance/apply-for-assistance">https://www2.gov.bc.ca/gov/content/family-social-supports/income-assistance/apply-for-assistance</a>
			</div>`;
	} else if(program === "General Supplements") {
		return `
			<div>
				<hr>
				<p style = "font-size: 20px"><strong>${program}</strong></font></p> <hr>
				<p>Includes 19 different programs available through the BC Employment and Assistance program (BCEA) to assist with specified needs and circumstances. Eligibility for supplements is generally determined through consultation with Ministry staff.</p>
				<p> <b>Major Eligiblity Requirements:</b> recipient of Income Assistance, Disability Assistance, and/or Hardship Assistance" </p>
			</div>`;
	} else if(program === "Hardship Assistance") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>${program}</strong></font></p><hr>
				<p> Hardship assistance is intended to meet the essential needs of persons or families who are not eligible for Income Assistance or Disability Assistance for a number of reasons specified by regulation. Hardship assistance is not an entitlement, but may be provided at the discretion of the Minister according to legislative and regulatory criteria.  It is provided on a temporary basis for only one month at a time.  Eligibility for hardship assistance must be re-established each month.</p>
				<p> <b> Number of cases/Expenditure:</b> Included under Income Assistance.</p>
				<p> <b>Major Eligiblity Requirements:</b> low-income, means-tested, immediate need, and not eligibile for IA or DA because: waiting for EI or other income, assets or income in excess, identity not established, SIN required, or strike/lockout. </p>
				<a href="https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/hardship-assistance/eligibility-for-hardship-assistance">https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/hardship-assistance/eligibility-for-hardship-assistance</a>
			</div>`;

	} else if(program === "Health Supp.") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>Health Supplements</strong></font></p><hr>
				<p> Include 21 programs available through the BC Employment and Assistance program to assist with specific health needs and circumstances. </p>
				<p> <b>Major Eligiblity Requirements:</b> recipients or those transitioning off of Income Assistance, Hardship Assistance, and Disability Assistance. </p>
				<a href="https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/health-supplements-and-programs/health-supplement-summary">https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/health-supplements-and-programs/health-supplement-summary</a>
			</div>`;
	} else if(program === "Healthy Kids") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>Healthy Kids</strong></font></p><hr>
				<p> The Healthy Kids Program provides coverage for basic dental treatment, optical care and hearing assistance to children in low-income families, who are not in receipt of income assistance, disability assistance or hardship assistance. </p>
				<p><b> Number of Eligible Children (Mar. 2018):</b> 144,484 </p>
				<p><b> Take-up Rate:</b>Included under numbers for Health Supps.</p>
				<p> <b>Major Eligiblity Requirements:</b> Low income, not a recipient of IA, DA, or HA</p>
			</div>`;
	} else if(program === "LMDA") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>Labour Market Development Agreement (LMDA)</strong></font></p><hr>
				<p> Provides support for those on Employment Insurance (EI) with skills training and employment assistance.</p>
				<p><b>WorkBC Clients (2018/2019):</b> 89,035</p>
				<p><b>CEP (2018/2019):</b> 219 inclusion groups in 24 projects</p>
				<p><b>Base Program Funding (2018/2019):</b> $299.79M LMDA, $29M Provincial </p>
				<p> <b>Major Eligiblity Requirements:</b> current and former EI claimants,or persons who have made EI contributions in last 5 of 10 years, or unemployed persons </p>
				<p><br> Programs: <br> <ol  style="margin-top: -12px;">
				<li>Single Parent Employment Initiative</li>
				<li>Employment Assistance Services</li>
				<li>Apprentice Services</li>
				<li>Assistive Technology Services</li>
				<li>Community and Employer Partnerships (CEP)</li>
			</div>`;
	} else if(program === "Seniors Supplement") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>Seniors Supplement</strong></font></p><hr>
				<p> The Senior’s Supplement is a provincial top-up to federal OAS/GIS. The Senior’s Supplement ensures a conditionally guaranteed minimum income level for residents of BC and is paid to low-income residents of BC who are 65 years of age and older and who are receiving OAS/GIS or the federal Allowance.</p>
				<p><b>Take-up (individuals, 2017/2018):</b> 56,021</p>
				<p><b>Expenditures (2017/2018):</b> $25.7M </p>
				<p> <b>Major Eligiblity Requirements:</b> low-income seniors 65 years+ receiving OAS/GIS or the Allowance </p>
			</div>`;
	} else if(program === "Nutrition Program") {
		return `
			<div>
				<hr> <p style = "font-size: 20px"><strong>Farmers Market Nutrition Program</strong></font></p><hr>
				<p>The BC Farmer’s Market Nutrition Program helps low-income individuals and seniors gain access to healthy, locally grown food through the provision of coupons. Each household is eligible to receive a minimum of $21/week in coupons which can be redeemed at participating farmers markets. The program runs throughout the summer months.</p>
				<p><b>Take-up (individuals):</b> about 12,000 </p>
				<p><b>Take-up (households):</b> about 4,000 over 79 communities </p>
				<p> <b>Major Eligiblity Requirements:</b> low-income and pregnant or dependent children or senior  </p>
			</div>`;
	}
>>>>>>> 9a2a5cd1bacea811429ba293bb18596f98996215
}

// FIXME: value should be pulled out and moved to a chart type specific function
function treeToHierarchy(tree, obj: any = {ministry: "root", showName: false, value: 0, name: "root"}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IMinistry20191010Version) => {
			return {
				fullprogram: ele[fullProgramName],
				program: ele[programName],
				level: ele[levelOfGovernment],
				ministry: ele[responsibleMinistry],
				admin: ele[administeredBy],
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
				value: 1,
				showName: ele[showName] ? (ele[showName].toLowerCase() === "true") : false,
				name: ele[programName] || ele[administeredBy] || ele[responsibleMinistry],

				tooltip: makeTooltip(ele[fullProgramName], ele[description], ele[eligibility], ele[conditions], ele[expend201819], ele[recip201819], ele[cases2019], ele[expend201718], ele[child2018], ele[baseFund2018], ele[recip2017], ele[expend2017], ele[budget2019], ele[expend2019], ele[recip2019], ele[recip201718], ele[recip2018], ele[expend2018], ele[expend2016], ele[recip201617] ),
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
	const sortKeys = [levelOfGovernment, responsibleMinistry, administeredBy, programName];
	const sortData = listToSortedTree(ministryData, sortKeys);
	const sunburstChartData: ISunburstChart = treeToHierarchy(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	sunburstChartData.setup = {
		width: 1000,

		showDepth: 4,
		radiusScaleExponent: 1.4,

		textWrapPadding: 10,

		honourShowName: false,
	};

	return buildZoomableSunburstChart(sunburstChartData, svgEle);
}
