import { app } from "apprun";
import "bootstrap";

import "~router/main_helper";

import NoRoute from "~pages/404";
import Cv from "~pages/cv";
import Home from "~pages/home";
import Research from "~pages/research";
import Charts from "~pages/research/charts";
import Nunavut from "~pages/research/Nunavutcharts";

// Import components which aren't high level "pages" so they're in the build.
import Footer from "~components/footer";
import Header from "~components/header";

import "~styles/main.scss";

const contentElement = document.getElementById("content");
const appState = {};
const appUpdate = {};
const appView = (state) => {
	return <>
		<Header />
		<div id="app-pages"></div>
		<Footer />
	</>;
};
app.start(contentElement, appState, appView, appUpdate);

// Main pages
const appPagesElement = document.getElementById("app-pages");
new Home().mount(appPagesElement);
new Cv().mount(appPagesElement);
new Research().mount(appPagesElement);
new Charts().mount(appPagesElement);
new Nunavut().mount(appPagesElement);

// Error handler page
new NoRoute().mount(appPagesElement);
