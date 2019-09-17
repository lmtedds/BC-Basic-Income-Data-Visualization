import * as d3 from "d3";

import { wrapText } from "~charts/d3/text_wrap";

// Based on https://observablehq.com/@d3/zoomable-sunburst
export function buildZoomableSunburstChart(hierarchicalData, showDepth: number, svgEle?: SVGElement) {
	const showDepthMin = 1;
	const showDepthMax = showDepthMin + showDepth;
	const maxOpacity = 0.8;
	const minOpacity = 0.4;

	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");

	const width = 1000;
	const radius = width / (showDepthMax * 2);

	const arc = d3.arc()
		.startAngle((d: any) => d.x0) // FIXME: type
		.endAngle((d: any) => d.x1) // FIXME: type
		.padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005)) // FIXME: type
		.padRadius(radius * 1.5)
		.innerRadius((d: any) => d.y0 * radius) // FIXME: type
		.outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1)); // FIXME: type

	// Colours for the sunburst will be either chosen automatically or can be provided in the colour property
	// of the data. The colour is based on the parent and then the opacity is varied based on the depth.
	const colour = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, hierarchicalData.children.length + 1));
	const selectFillColour = (d: any) => { // FIXME: Type
		while (d.depth > 1) d = d.parent;
		return d.data.colour || colour(d.data.name);
	};
	const opacityInterpolate = (d: any) => {
		const computed = (showDepthMax - 1 - d.y0) / (showDepthMax - 1 - showDepthMin) * (maxOpacity - minOpacity) + minOpacity;
		return computed > minOpacity ? computed : minOpacity;
	};
	const selectFillOpacity = (d: any) => {
		return arcVisible(d.current) ? opacityInterpolate(d) : 0;
	};

	const partition = (data) => {
		const rooted = d3.hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value);

		return d3.partition()
			.size([2 * Math.PI, rooted.height + 1])
			(rooted);
	};

	const root = partition(hierarchicalData);

	// Setup properties required for sunburst
	root.each((d: any) => {
		d.current = d;
		d.data.name = d.data.program || d.data.admin || d.data.ministry; // FIXME: This should be in calling function
	}); // FIXME: Type

	svg
		.attr("viewBox", `0 0 ${width} ${width}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.style("font", "10px sans-serif");

	const g = svg.append("g")
		.attr("transform", `translate(${width / 2},${width / 2})`);

	const path = g.append("g")
		.selectAll("path")
		.data(root.descendants().slice(1)) // first entry is root (keep everything else)
		.join("path")
			.attr("fill", selectFillColour)
			.attr("fill-opacity", selectFillOpacity)
			.attr("d", (d: any) => arc(d.current)); // FIXME: Type

	// Add a click handler to anything with children (i.e. not outermost ring)
	path.filter((d: any) => d.children) // FIXME: Type
		.style("cursor", "pointer")
		.on("click", clicked);

	const format = d3.format(",d");
	path.append("title")
		.text((d: any) => `${d.ancestors().map((d2) => d2.data.name).reverse().join("/")}\n${format(d.value)}`); // FIXME: Type

	const label = g.append("g")
		.attr("pointer-events", "none")
		.attr("text-anchor", "middle")
		.style("user-select", "none")
		.selectAll("text")
		.data(root.descendants().slice(1)) // first entry is root (keep everything else)
		.join("text")
			.attr("fill-opacity", (d: any) => +labelVisible(d.current)) // FIXME: Type
			.attr("transform", (d: any) => labelTransform(d.current)) // FIXME: Type
			.text((d: any) => d.data.name) // FIXME: Type
			.call(wrapText, radius, (d: any) => d.x1 - d.x0);

	const parent = g.append("circle")
			.datum(root)
			.attr("r", radius)
			.attr("fill", "none")
			.attr("pointer-events", "all")
			.on("click", clicked);

	function clicked(p) {
		parent.datum(p.parent || root);

		root.each((d: any) => d.target = { // FIXME: Type
			x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
			x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
			y0: Math.max(0, d.y0 - p.depth),
			y1: Math.max(0, d.y1 - p.depth),
		});

		const t = g.transition().duration(750);

		// Transition the data on all arcs, even the ones that aren’t visible,
		// so that if this transition is interrupted, entering arcs will start
		// the next transition from the desired position.
		path.transition(t)
			.tween("data", (d: any) => {
				const i = d3.interpolate(d.current, d.target);
				return (t2) => d.current = i(t2);
			})
			.filter(function(d: any) { return +this.getAttribute("fill-opacity") || arcVisible(d.target); } as any) // FIXME: Type
			.attr("fill-opacity", (d: any) => arcVisible(d.target) ? opacityInterpolate(d) : 0) // FIXME: Type
			.attrTween("d", (d: any) => () => arc(d.current)); // FIXME: Type

		label.filter(function(d: any) { return +this.getAttribute("fill-opacity") || labelVisible(d.target); } as any) // FIXME: Type
			.transition(t)
			.attr("fill-opacity", (d: any) => +labelVisible(d.target)) // FIXME: Type
			.attrTween("transform", (d: any) => () => labelTransform(d.current)); // FIXME: Type
	}

	function arcVisible(d) {
		return d.y1 <= showDepthMax && d.y0 >= showDepthMin && d.x1 > d.x0;
	}

	function labelVisible(d) {
		return d.y1 <= showDepthMax && d.y0 >= showDepthMin && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
	}

	function labelTransform(d) {
		const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
		const y = (d.y0 + d.y1) / 2 * radius;
		return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
	}

	return svg.node();
}
