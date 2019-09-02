import { app, Component, ROUTER_404_EVENT } from "apprun";

import "./style.scss";

const notFoundWarning: string = "Hmmm. I could not find that page!";

export default class NoRouteComponent extends Component {
	public state = {};

	// Handle no route found events with this component
	public update = {
		[ROUTER_404_EVENT]: (state) => state,
	};

	public view = (state) => {
		return <div className="container">
				<p className="mb-4" />
				<h1>{notFoundWarning}</h1>
				<p>Sorry, but that page doesn't seem to exist. Perhaps the page has been moved? You can try to find what you're looking for using the menus above.</p>
			</div>;
	}
}
