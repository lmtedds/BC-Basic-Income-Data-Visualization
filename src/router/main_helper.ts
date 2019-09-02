import { app, ROUTER_EVENT } from "apprun";

import "apprun-router/pretty"; // Use the pretty router.

// Actions per route change.
app.on(ROUTER_EVENT, (route) => {
	// Remove active from all navbar tags
	const menus = document.querySelectorAll(".navbar-nav li");
	menus.forEach((menu) => { menu.classList.remove("active"); });

	// Add active back to the active menu. For simplicity, routes
	// start with "/" then have the major header (e.g. fertilizer or food), a "-",
	// and then the minor header. Just look for the "#majorheader" portion of things
	// for the drop down menu's anchor.
	const index: number = route.indexOf("-");
	const major: string = (index > 0 ? route.slice(0, index) : route).replace("/", "#");
	const item = document.querySelector(`[href="${major}"]`);
	item && item.parentElement.classList.add("active");
});
