import { app, Component } from "apprun";

import "./style.scss";

export const HOME_PAGE_URL: string = "/";

export default class HomeComponent extends Component {
	public state = {};

	public update = {
		[HOME_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			HOME!
			</>;
	}
}
