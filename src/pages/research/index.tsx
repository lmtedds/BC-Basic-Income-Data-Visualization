import { app, Component } from "apprun";

import "./style.scss";

export const RESEARCH_PAGE_URL: string = "/research";

export default class ResearchComponent extends Component {
	public state = {};

	public update = {
		[RESEARCH_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			RESEARCH!
			</>;
	}
}
