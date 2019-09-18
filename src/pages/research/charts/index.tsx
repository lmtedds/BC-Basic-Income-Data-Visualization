import { app, Component } from "apprun";

import { buildMatrixForceChart } from "~charts/d3/force_matrix";
import { buildMinistryComplexityCircleChart, buildMinistryComplexitySunburstChart } from "~charts/ministries";
import { buildProgramInteractionChart } from "~charts/programs";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

const matrixChartId: string = "matrixChart";
const linkChartId: string = "linkChart";
const ministryCircleChartId: string = "ministryCircleChart";
const ministrySunburstChartId: string = "ministrySunburstChart";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<h1>Ministry Complexity Chart - NOT FINAL</h1>
			<div class="row">
				<svg className="img-fluid col-6" id={matrixChartId}></svg>
				<svg className="img-fluid col-6" id={linkChartId}></svg>
			</div>
			<div class="row">
				<svg className="img-fluid col-6" id={ministryCircleChartId}></svg>
				<svg className="img-fluid col-6" id={ministrySunburstChartId}></svg>
			</div>
		</>;
	}

	public rendered = (features) => {
		const matrixSvgEle = document.getElementById(matrixChartId);
		const fakeData = {
			axes: {
				xTitles: ["x1", "x2", "x3"],
				yTitles: ["y1", "y2"],
			},
			data: [
				[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
				[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
				[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
				[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
				[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			],
		}; // FIXME: fake data

		const matrixChart = buildMatrixForceChart(fakeData, (matrixSvgEle as unknown) as SVGElement); // Yes, this really is an SVG element
		console.log(matrixChart);

		const linkSvgEle = document.getElementById(linkChartId);
		const linkChart = buildProgramInteractionChart((linkSvgEle as unknown) as SVGElement);
		console.log(linkChart);

		const circleSvgEle = document.getElementById(ministryCircleChartId);
		const ministeryCircleChart = buildMinistryComplexityCircleChart((circleSvgEle as unknown) as SVGElement); // Yes, this really is an SVG element
		console.log(ministeryCircleChart);

		const sunburstSvgEle = document.getElementById(ministrySunburstChartId);
		const ministerySunburstChart = buildMinistryComplexitySunburstChart((sunburstSvgEle as unknown) as SVGElement); // Yes, this really is an SVG element
		console.log(ministerySunburstChart);
	}
}
