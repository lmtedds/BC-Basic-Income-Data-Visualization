import * as d3 from "d3";

export interface ID3Hierarchy {
	name: string;
	showName: boolean;
	value: number;

	ministry: string;
	program?: string;

	children?: this[];
}

// Adapted from https://observablehq.com/@d3/zoomable-circle-packing
export function buildZoomablePackedCircleChart(hierarchicalData: ID3Hierarchy, svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");
	svg.classed("chart-packed-circle-zoom", true);

	const height: number = 1000;
	const width: number = 1000;
	const aspect: number = width / height;

	const pack = (dataToPack) => {
		return d3.pack()
			.size([width, height])
			.padding(3)
			(d3.hierarchy(dataToPack)
				.sum((d) => d.value)
				.sort((a, b) => b.value - a.value));
	};

	const root = pack(hierarchicalData);
	let focus = root;
	let view;

	const colour = d3.scaleLinear()
		.domain([0, 5])
		.range(["hsl(152,80%,80%)" as any, "hsl(228,30%,40%)" as any]) // FIXME: cast works around typescript def'n bug
		.interpolate(d3.interpolateHcl as any); // FIXME: cast works around typescript def'n bug

	// Mouse events
	const mouseover = function() { d3.select(this).attr("stroke", "#000"); };
	const mouseout = function() { d3.select(this).attr("stroke", null); };
	const mouseclick = function(d) { return focus !== d && (zoom(d), d3.event.stopPropagation()); };

	svg
		.attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.style("display", "block")
		.style("margin", "0 -14px")
		.style("background", colour(0))
		.style("cursor", "pointer")
		.on("click", () => zoom(root));

	const node = svg.append("g")
		.selectAll("circle")
		.data(root.descendants().slice(1))
		.join("circle")
		.attr("fill", (d) => d.children ? colour(d.depth) : "white")
		.attr("pointer-events", (d) => !d.children ? "none" : null)
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", mouseclick);

	const label = svg.append("g")
		.style("font", "10px sans-serif")
		.attr("pointer-events", "none")
		.attr("text-anchor", "middle")
		.selectAll("text")
		.data(root.descendants())
		.join("text")
		.style("fill-opacity", (d) => d.parent === root ? 1 : 0)
		.style("display", (d) => d.parent === root ? "inline" : "none")
		.text((d: any) => {
			return d.data.showName ? d.data.name : null;
		});

	zoomTo([root.x, root.y, root.r * 2]);

	function zoomTo(v) {
		const k = width / v[2];

		view = v;

		label.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
		node.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
		node.attr("r", (d) => d.r * k);
	}

	function zoom(newRoot) {
		const focus0 = focus;

		focus = newRoot;

		const transition = svg.transition()
			.duration(d3.event.altKey ? 7500 : 750)
			.tween("zoom", (d) => {
			const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
			return (t) => zoomTo(i(t));
			});

		label
			.filter(function(d) { return d.parent === focus || (this as HTMLElement).style.display === "inline"; })
			.transition(transition)
				.style("fill-opacity", (d) => d.parent === focus ? 1 : 0)
				.on("start", function(d) { if (d.parent === focus) (this as HTMLElement).style.display = "inline"; })
				.on("end", function(d) { if (d.parent !== focus) (this as HTMLElement).style.display = "none"; });
	}

	return svg.node();
}
