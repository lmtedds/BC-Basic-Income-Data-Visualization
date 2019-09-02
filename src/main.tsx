import { app } from "apprun";
import "bootstrap";

import "~router/main_helper";

import NoRoute from "~pages/404";
import Cv from "~pages/cv";
import Home from "~pages/home";
import Research from "~pages/research";

// Import components which aren't high level "pages" so they're in the build.
import Footer from "~components/footer";
import Header from "~components/header";

import "~styles/main.scss";

const App = () => <>
		<Header />
		<div id="app-pages"></div>
		<Footer />
	</>;

const contentElement = document.getElementById("content");
app.render(contentElement, <App />);

// Main pages
const appPagesElement = document.getElementById("app-pages");
new Home().mount(appPagesElement);
new Cv().mount(appPagesElement);
new Research().mount(appPagesElement);

// Error handler page
new NoRoute().mount(appPagesElement);

// import { buildZoomablePackedCircleChart } from "~charts/ministries";

// const chart = buildZoomablePackedCircleChart();

// // Just append this to the body tag for the time being.
// document.getElementsByTagName("body")[0].appendChild(chart);
