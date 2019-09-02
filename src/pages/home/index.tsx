import { app, Component } from "apprun";

import "./style.scss";

import LindsayPic from "~public/img/lindsay.jpg";
const LindsayPicAlt: string = "Lindsay M. Tedds, Associate Professor, School of Public Policy, University of Calgary";

export const HOME_PAGE_URL: string = "/";

export default class HomeComponent extends Component {
	public state = {};

	public update = {
		[HOME_PAGE_URL]: (state) => state,
	};

	public view = (state) => {
		return <>
			<h1 className="d-flex justify-content-center">Lindsay M. Tedds</h1>
			<h2 className="d-flex justify-content-center">Associate Professor</h2>
			<h2 className="d-flex justify-content-center">School of Public Policy, University of Calgary</h2>
			<div className="d-flex justify-content-center">
				<img className="img-fluid" src={LindsayPic} alt={LindsayPicAlt} />
			</div>
			</>;
	}
}
