import { app, Component } from "apprun";

import "./style.scss";

export const CV_PAGE_URL: string = "/cv";
const CV_EXTERNAL_LINK: string = "https://github.com/lmtedds/PaperRepository/raw/gh-pages/Tedds%20full%20CV%20March%202019.pdf";

export default class CvComponent extends Component {
	public state = {};

	public update = {
		[CV_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<div>
				A copy of my CV can be found <a className="nav-link" href={CV_EXTERNAL_LINK}>here</a>
			</div>
			</>;
	}
}
