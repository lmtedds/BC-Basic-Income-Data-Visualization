import { app, Component } from "apprun";

import { CHARTS_PAGE_URL } from "~pages/research/charts";

import { NCHARTS_PAGE_URL } from "~pages/research/Nunavutcharts";

import "./style.scss";

export const RESEARCH_PAGE_URL: string = "/research";

export default class ResearchComponent extends Component {
	public state = {};

	public update = {
		[RESEARCH_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<div className="container">
				<ul>
					<li>
						<a className="nav-link" href={CHARTS_PAGE_URL} $prettylink>B.C. Charts</a>
					</li>
					<li>
						<a className="nav-link" href={NCHARTS_PAGE_URL} $prettylink>Nunavut Charts</a>
					</li>

				</ul>
			</div>
			</>;
	}
}
