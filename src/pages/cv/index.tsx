import { app, Component } from "apprun";

import "./style.scss";

export const CV_PAGE_URL: string = "/cv";

export default class CvComponent extends Component {
	public state = {};

	public update = {
		[CV_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			CV!
			</>;
	}
}
