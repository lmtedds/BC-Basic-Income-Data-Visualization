import { app, Component } from "apprun";

import { buildApplicationChart } from "~charts/application";
import { buildCashInKindSunburstChart } from "~charts/cashInKind";
import { buildCashSuppSunburstChart } from "~charts/cashInKindSupp";
import { buildEligibilityChart } from "~charts/eligibility";
import { buildInKindChart } from "~charts/in_kind";
import { buildMinistryComplexitySunburstChart } from "~charts/ministries";
import { buildProgramInteractionChart } from "~charts/programs";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	private readonly applicationSvgEle: SVGElement;
	private readonly eligibilitySvgEle: SVGElement;
	private readonly inKindSvgEle: SVGElement;
	private readonly interactionLinkSvgEle: SVGElement;
	private readonly ministryComplexitySunburstSvgEle: SVGElement;
	private readonly cashInKindSunburstSvgEle: SVGElement;
	private readonly cashSuppSunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.applicationSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.eligibilitySvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.inKindSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.interactionLinkSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.ministryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.cashInKindSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.cashSuppSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {
		const applicationChart = buildApplicationChart(this.applicationSvgEle);
		// console.log(applicationChart);

		const eligibilityChart = buildEligibilityChart(this.eligibilitySvgEle);
		// console.log(eligibilityChart);

		const matrixChart = buildInKindChart(this.inKindSvgEle);
		// console.log(matrixChart);

		const linkChart = buildProgramInteractionChart(this.interactionLinkSvgEle);
		// console.log(linkChart);

		const ministrySunburstChart = buildMinistryComplexitySunburstChart(this.ministryComplexitySunburstSvgEle);
		// console.log(ministerySunburstChart);

		const cashInKindSunburstChart = buildCashInKindSunburstChart(this.cashInKindSunburstSvgEle);
		// console.log(cashInKindSunburstChart);

		const cashSuppSunburstChart = buildCashSuppSunburstChart(this.cashSuppSunburstSvgEle);

		return <>
			{/* <div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Eligibility</h2>
					{this.eligibilitySvgEle}
				</div>
				<div className="img-fluid col-xl">
					<h2 class="text-center">Application</h2>
					{this.applicationSvgEle}
				</div>
			</div>
			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">In Kind</h2>
					{this.inKindSvgEle}
				</div>
				<div className="img-fluid col-xl">
					<h2 class="text-center">Interactions</h2>
					{this.interactionLinkSvgEle}
				</div>
			</div> */}
			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.ministryComplexitySunburstSvgEle}
				</div>
			</div>

			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Cash In-Kind</h2>
			<p>This sunburst arranges all 177 income and social support programs offered in B.C. into method of receipt. The methods are: 
		<ul>
			<li>Pure cash transfer: these programs are paid out as cash with cash amounts set without regard to actual expenses incurred.</li>
			<li>Refundable tax credit: these programs are offered through the tax system and may result in an actual cash payment to an eligible recipient (if there is money left over after first being applied to taxes owing). </li>
			<li>Non-refundable tax credit: these programs are offered through the tax system and are used to reduce taxes owing. Any remainder after paying off taxes owing is not recieved by an eligible recipient.</li>
			<li>Cash geared to cost: these program are paid out as cash with the amount of benefit tied to an actual expense to be incurred by an eligible recipient.</li>
			<li>Bill repayment: these programs are paid out as case with the amount of beneefit tied to an expense already incurred.</li>
		<li>Pure In-kind: these programs irectly cover the cost of a service used by an eligible recipient, such as health care or education. </li>
			<li>Services: these are programs where the funding goes to an eligible third-party such as an employer.</li>
			</ul>
		</p>
					{this.cashInKindSunburstSvgEle}
				</div>
			</div>

				<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">B.C. General and Health Supplements</h2>
			<p>This sunburst contains only those programs provided by the Government of B.C. to recipients of Income Assistance, Disability, and Hardship Assistance as either a General Supplement or a Disability Supplement.</p>
					{this.cashSuppSunburstSvgEle}
				</div>
			</div>

		</>;
	}
}
