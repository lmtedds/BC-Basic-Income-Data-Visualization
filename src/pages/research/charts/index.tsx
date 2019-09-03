import { app, Component } from "apprun";

import { buildZoomablePackedCircleChart } from "~charts/ministries";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/charts";

const ministryChartId: string = "ministryChart";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<h1>Ministry Complexity Chart</h1>
			<svg id={ministryChartId}></svg>
			</>;
	}

	public rendered = (features) => {
		const ministeryChart = buildZoomablePackedCircleChart(ministryChartId);

		console.log(ministeryChart);
	}
}
