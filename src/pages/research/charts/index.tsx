import { app, Component } from "apprun";

import { buildMinistryComplexityChart } from "~charts/ministries";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

const ministryChartId: string = "ministryChart";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<h1>Ministry Complexity Chart - NOT FINAL</h1>
			<div>
				<svg className="img-fluid" id={ministryChartId}></svg>
			</div>
			</>;
	}

	public rendered = (features) => {
		const svgEle = document.getElementById(ministryChartId);
		const ministeryChart = buildMinistryComplexityChart((svgEle as unknown) as SVGElement); // Yes, this really is an SVG element

		console.log(ministeryChart);
	}
}
