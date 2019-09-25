import { app, Component } from "apprun";

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

	private readonly matrixSvgEle: SVGElement;
	private readonly linkSvgEle: SVGElement;
	private readonly circleSvgEle: SVGElement;
	private readonly sunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.matrixSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.linkSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.circleSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.sunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	}

	public view = (state) => {
		const matrixChart = buildInKindChart(this.matrixSvgEle); // Yes, this really is an SVG element
		console.log(matrixChart);

		const linkChart = buildProgramInteractionChart(this.linkSvgEle);
		console.log(linkChart);

		const ministeryCircleChart = buildMinistryComplexityCircleChart(this.circleSvgEle);
		console.log(ministeryCircleChart);

		const ministerySunburstChart = buildMinistryComplexitySunburstChart(this.sunburstSvgEle);
		console.log(ministerySunburstChart);

		return <>
			<h1>Ministry Complexity Chart - NOT FINAL</h1>
			<div class="row">
				<div className="img-fluid col-xl">{this.matrixSvgEle}</div>
				<div className="img-fluid col-xl">{this.linkSvgEle}</div>
			</div>
			<div class="row">
				<div className="img-fluid col-xl">{this.circleSvgEle}</div>
				<div className="img-fluid col-xl">{this.sunburstSvgEle}</div>
			</div>
		</>;
	}
}
