import { app, Component } from "apprun";

import { buildEligibilityChart } from "~charts/eligibility";
import { buildInKindChart } from "~charts/in_kind";
import { buildMinistryComplexityCircleChart, buildMinistryComplexitySunburstChart } from "~charts/ministries";
import { buildProgramInteractionChart } from "~charts/programs";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	private readonly eligibilitySvgEle: SVGElement;
	private readonly inKindSvgEle: SVGElement;
	private readonly interactionLinkSvgEle: SVGElement;
	private readonly ministryComplexityCircleSvgEle: SVGElement;
	private readonly ministryComplexitySunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.eligibilitySvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.inKindSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.interactionLinkSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.ministryComplexityCircleSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.ministryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	}

	public view = (state) => {
		const eligibilityChart = buildEligibilityChart(this.eligibilitySvgEle);

		const matrixChart = buildInKindChart(this.inKindSvgEle); // Yes, this really is an SVG element
		// console.log(matrixChart);

		const linkChart = buildProgramInteractionChart(this.interactionLinkSvgEle);
		// console.log(linkChart);

		const ministeryCircleChart = buildMinistryComplexityCircleChart(this.ministryComplexityCircleSvgEle);
		// console.log(ministeryCircleChart);

		const ministerySunburstChart = buildMinistryComplexitySunburstChart(this.ministryComplexitySunburstSvgEle);
		// console.log(ministerySunburstChart);

		return <>
			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Eligibility</h2>
					{this.eligibilitySvgEle}
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
			</div>
			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.ministryComplexityCircleSvgEle}
				</div>
				<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.ministryComplexitySunburstSvgEle}
				</div>
			</div>
		</>;
	}
}
