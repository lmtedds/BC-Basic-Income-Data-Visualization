import { app, Component } from "apprun";

import { buildMinistryComplexityCircleChart, buildMinistryComplexitySunburstChart } from "~charts/ministries";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

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
				<svg className="img-fluid col-6" id={ministryCircleChartId}></svg>
				<svg className="img-fluid col-6" id={ministrySunburstChartId}></svg>
			</div>
			</>;
	}

	public rendered = (features) => {
		const circleSvgEle = document.getElementById(ministryCircleChartId);
		const ministeryCircleChart = buildMinistryComplexityCircleChart((circleSvgEle as unknown) as SVGElement); // Yes, this really is an SVG element
		console.log(ministeryCircleChart);

		const sunburstSvgEle = document.getElementById(ministrySunburstChartId);
		const ministerySunburstChart = buildMinistryComplexitySunburstChart((sunburstSvgEle as unknown) as SVGElement); // Yes, this really is an SVG element
		console.log(ministerySunburstChart);
	}
}
