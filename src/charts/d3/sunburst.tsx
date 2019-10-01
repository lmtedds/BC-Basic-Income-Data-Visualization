import { format as d3format } from "d3-format";
import { hierarchy, partition as d3partition } from "d3-hierarchy";
import { interpolate, quantize } from "d3-interpolate";
import { scaleOrdinal, scalePow } from "d3-scale";
import { interpolateRainbow } from "d3-scale-chromatic";
import { create, select } from "d3-selection";
import { arc } from "d3-shape";

import { wrapTextTspanEach } from "~charts/d3/text_wrap";
import { chooseBestContrastColour } from "~utils/colour";

export interface ID3Hierarchy {
	name: string;
	showName: boolean;
	value: number;

	ministry: string;
	program?: string;

	children?: this[];
}

export interface ISunburstChartSetup {
	width: number;

	radiusScaleExponent: number; // 1 for same size torus, < 1 for outer being smaller than inner, > 1 for outer being larger than inner
	showDepth: number; // number of torii to show

	textWrapPadding: number;

	honourShowName: boolean;
}

export interface ISunburstChart extends ID3Hierarchy {
	setup?: ISunburstChartSetup;
}

// Based on https://observablehq.com/@d3/zoomable-sunburst
export function buildZoomableSunburstChart(
	sunburstData: ISunburstChart,
	svgEle?: SVGElement) {

	const showDepth = sunburstData.setup ? sunburstData.setup.showDepth : 3;
	const showDepthMin = 1;
	const showDepthMax = showDepthMin + showDepth;
	const maxOpacity = 0.8;
	const minOpacity = 0.4;

	const fontSize = "10px";
	const fontFace = "sans-serif";

	const textWrapPadding = sunburstData.setup ? sunburstData.setup.textWrapPadding : 10;

	const honourShowName = sunburstData.setup ? sunburstData.setup.honourShowName : true;

	const radiusScaleExponent = sunburstData.setup ? sunburstData.setup.radiusScaleExponent : 1;

	// Create a new svg node or use an existing one.
	const svg = svgEle ? select(svgEle) : create("svg");
	svg.classed("chart-sunburst-zoom", true);

	// FIXME: Configurable dimensions ... non square to allow space for other annotations
	const width = sunburstData.setup ? sunburstData.setup.width : 1000;
	const radius = width / (showDepthMax * 2);

	const radiusScale = scalePow().exponent(radiusScaleExponent).range([0, width / 2]).domain([0, showDepthMax]);

	const arcs = arc()
		.startAngle((d: any) => d.x0) // FIXME: type
		.endAngle((d: any) => d.x1) // FIXME: type
		.padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005)) // FIXME: type
		.padRadius(radius * 1.5)
		.innerRadius((d: any) => radiusScale(d.y0)) // FIXME: type
		.outerRadius((d: any) => Math.max(radiusScale(d.y0), radiusScale(d.y1) - 1)); // FIXME: type

	// Colours for the sunburst will be either chosen automatically or can be provided in the colour property
	// of the data. The colour is based on the parent and then the opacity is varied based on the depth.
	const colour = scaleOrdinal(quantize(interpolateRainbow, sunburstData.children.length + 1));
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
		const rooted = hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value);

		return d3partition()
			.size([2 * Math.PI, rooted.height + 1])
			(rooted);
	};

	const root = partition(sunburstData);

	// Setup properties required for sunburst
	root.each((d: any) => {  // FIXME: Type
		d.current = d;
	});

	svg
		.attr("viewBox", `0 0 ${width} ${width}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.style("font", `${fontSize} ${fontFace}`);

	const g = svg
		.append("g")
			.attr("transform", `translate(${width / 2},${width / 2})`);

	const path = g
		.append("g")
			.attr("class", "arcs")
			.selectAll("path")
			.data(root.descendants().slice(1)) // first entry is root (keep everything else)
			.join("path")
				.attr("fill", selectFillColour)
				.attr("fill-opacity", selectFillOpacity)
				.attr("d", (d: any) => arcs(d.current)); // FIXME: Type

	// Add a click handler to anything with children (i.e. not outermost ring)
	path.filter((d: any) => d.children) // FIXME: Type
		.style("cursor", "pointer")
		.on("click", clicked);

	const format = d3format(",d");
	path.append("title")
		.text((d: any) => `${d.ancestors().map((d2) => d2.data.name).reverse().join("/")}\n${format(d.value)}`); // FIXME: Type

	const label = g
		.append("g")
			.attr("pointer-events", "none")
			.attr("text-anchor", "middle")
			.style("user-select", "none")
			.selectAll("text")
			.data(root.descendants().slice(1)) // first entry is root (keep everything else)
			.join("text")
				.attr("fill-opacity", (d: any) => +labelVisible(d.current)) // FIXME: Type
				.attr("fill", (d) => chooseBestContrastColour(selectFillColour(d), selectFillOpacity(d)))
				.attr("transform", (d: any) => labelTransform(d.current)) // FIXME: Type
				.text((d: any) => { // FIXME: Type
					return honourShowName ? (d.data.showName ? d.data.name : null) : d.data.name;
				})
				.each(function(d) {
					const text = select(this);
					return wrapTextTspanEach(text, {
						width: radiusScale(d.y1) - radiusScale(d.y0),
						height: 50, // FIXME: height is wrong
						padding: textWrapPadding,
						vCenter: false,
						hCenter: false,
						vJust: true,
						fontSize: fontSize,
						fontFace: fontFace,
					});
				});

	const parent = g
		.append("circle")
			.datum(root)
			.attr("r", (d) => radiusScale(1))
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
		path
			.transition(t)
				.tween("scale", (d: any) => {
					// Reset the radiusScale's domain so that we can take advantage of the fact we have fewer levels to display
					const yd = interpolate(radiusScale.domain(), [0, showDepthMax - p.depth]);
					return (t2) => radiusScale.domain(yd(t2));
				})
				.tween("data", (d: any) => {
					const i = interpolate(d.current, d.target);
					return (t2) => d.current = i(t2);
				})
				.filter(function(d: any) { return +this.getAttribute("fill-opacity") || arcVisible(d.target); } as any) // FIXME: Type
				.attr("fill-opacity", (d: any) => arcVisible(d.target) ? opacityInterpolate(d) : 0) // FIXME: Type
				.attrTween("d", (d: any) => () => arcs(d.current)); // FIXME: Type

		label
			.filter(function(d: any) { // FIXME: Type
				return +this.getAttribute("fill-opacity") || labelVisible(d.target);
			} as any)
			.transition(t)
				.attr("fill-opacity", (d: any) => +labelVisible(d.target)) // FIXME: Type
				.attrTween("transform", (d: any) => () => labelTransform(d.current)) // FIXME: Type
				.tween("textwrap", function(d: any) {
					return (t2) => {
						const text = select(this);
						wrapTextTspanEach(text, {
							width: radiusScale(d.y1) - radiusScale(d.y0),
							height: 50, // FIXME: height is wrong
							padding: textWrapPadding,
							vCenter: false,
							hCenter: false,
							vJust: true,
							fontSize: fontSize,
							fontFace: fontFace,
						});
					};
				});

	}

	function arcVisible(d) {
		return d.y1 <= showDepthMax && d.y0 >= showDepthMin && d.x1 > d.x0;
	}

	function labelVisible(d) {
		return d.y1 <= showDepthMax && d.y0 >= showDepthMin && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
	}

	function labelTransform(d) {
		const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
		const y = (radiusScale(d.y0) + radiusScale(d.y1)) / 2;
		return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
	}

	return svg.node();
}
