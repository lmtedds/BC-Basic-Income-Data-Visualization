import { app, Component } from "apprun";

import { CHARTS_PAGE_URL } from "~pages/research/charts";

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
						<a className="nav-link" href={CHARTS_PAGE_URL} $prettylink>Charts</a>
					</li>
				</ul>
			</div>
			</>;
	}
}
