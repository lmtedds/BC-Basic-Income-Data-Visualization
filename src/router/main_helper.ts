import { app, ROUTER_EVENT } from "apprun";

import "apprun-router/pretty"; // Use the pretty router.

// Actions per route change.
app.on(ROUTER_EVENT, (route) => {
	// Remove active from all navbar tags
	const menus = document.querySelectorAll(".navbar-nav li");
	menus.forEach((menu) => { menu.classList.remove("active"); });

	// Mark the active route element with the active class
	const item = document.querySelector(`.nav-item a[href='${route}']`);
	item && item.parentElement.classList.add("active");
});
