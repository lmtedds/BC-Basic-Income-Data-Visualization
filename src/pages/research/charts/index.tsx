import { app, Component } from "apprun";

import { buildApplicationChart } from "~charts/application";
import { buildCashInKindSunburstChart } from "~charts/cashInKind";
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

	constructor() {
		super();

		this.applicationSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.eligibilitySvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.inKindSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.interactionLinkSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.ministryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.cashInKindSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {
		const applicationChart = buildApplicationChart(this.applicationSvgEle);
		// console.log(applicationChart);

		const eligibilityChart = buildEligibilityChart(this.eligibilitySvgEle);
		// console.log(eligibilityChart);

		const matrixChart = buildInKindChart(this.inKindSvgEle); // Yes, this really is an SVG element
		// console.log(matrixChart);

		const linkChart = buildProgramInteractionChart(this.interactionLinkSvgEle);
		// console.log(linkChart);

		const ministrySunburstChart = buildMinistryComplexitySunburstChart(this.ministryComplexitySunburstSvgEle);
		// console.log(ministerySunburstChart);

		const cashInKindSunburstChart = buildCashInKindSunburstChart(this.cashInKindSunburstSvgEle);
		// console.log(cashInKindSunburstChart);

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
					{this.cashInKindSunburstSvgEle}
				</div>
			</div>

		</>;
	}
}
