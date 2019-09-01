// This is where typescript/javascript starts from. A reference to it is automatically added to index.html (via webpack).
import * as d3 from "d3";

import { data } from "~data/20190824_ministries";

interface IMinistry {
	"Program": string;
	"Program Type/Target": string;
	"Level of Government": string;
	"Managed by (Ministry):": string;
	"Ministry - point of contact/administration:": string;
	"Ministry - point of contact/administration - government:": string;
	"Importance Ranking": string;
}

interface ID3Hierarchy {
	ministry: string;
	showName: boolean;
	value: number;

	program?: string;
	children?: this[];
}

// Rearrange the data into the format that d3 is expecting
function generateHierarchicalData(rawData: IMinistry[]): ID3Hierarchy {

	const getMinistriesForLevelAsChildren = (level: string): ID3Hierarchy[] => {
		const leveledMinistries = rawData.reduce((accum: ID3Hierarchy[], ele: IMinistry, index: number) => {
			// Ignore programs not for this level of government.
			if(ele["Level of Government"] !== level) {
				return accum;
			} else {
				// Provide an inner circle in the case where the program is
				// administered by another
				if(ele["Ministry - point of contact/administration:"]) {
					return accum.concat([{
						ministry: ele["Ministry - point of contact/administration:"],
						showName: true, // FIXME: What's the decision to show here?
						value: 1,
						children: [{
							ministry: ele["Managed by (Ministry):"],
							showName: ele["Importance Ranking"] === "2" ? true : false,
							value: 1,
							program: ele.Program,
							// children: undefined as does not have administrator
						}],
					}]);
				} else {
					return accum.concat([{
						ministry: ele["Managed by (Ministry):"],
						showName: ele["Importance Ranking"] === "2" ? true : false,
						value: 1,
						program: ele.Program,
						// children: undefined as a program may not have children
					}]);
				}
			}
		}, []);

		// FIXME: Do we need to go through and find anything that has the same ministry or adminstrators etc?

		console.log(`For level ${level} => ${JSON.stringify(leveledMinistries,  null, 4)}`);

		return leveledMinistries;
	};

	return {
		ministry: "Ministries",
		showName: true,
		value: 0,
		children: [{
			ministry: "Federal",
			showName: true,
			value: 1,
			children: getMinistriesForLevelAsChildren("Federal").concat([{
				ministry: "Province",
				showName: true,
				value: 0,
				children: getMinistriesForLevelAsChildren("Provincial"),
			}]),
		}],
	};
}

// Adapted from https://observablehq.com/@d3/zoomable-circle-packing
function buildZoomablePackedCircleChart() {
	const height: number = 932;
	const width: number = 932;

	const pack = (dataToPack) => {
		return d3.pack()
			.size([width, height])
			.padding(3)
			(d3.hierarchy(dataToPack)
				.sum((d) => d.value)
				.sort((a, b) => b.value - a.value));
	};

	const root = pack(generateHierarchicalData(data));
	// const root = pack(data);
	let focus = root;
	let view;

	const colour = d3.scaleLinear()
	.domain([0, 5])
	.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	.interpolate(d3.interpolateHcl);

	const svg = d3.create("svg")
		.attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
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
		.on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
		.on("mouseout", function() { d3.select(this).attr("stroke", null); })
		.on("click", (d) => focus !== d && (zoom(d), d3.event.stopPropagation()));

	const label = svg.append("g")
		.style("font", "10px sans-serif")
		.attr("pointer-events", "none")
		.attr("text-anchor", "middle")
		.selectAll("text")
		.data(root.descendants())
		.join("text")
		.style("fill-opacity", (d) => d.parent === root ? 1 : 0)
		.style("display", (d) => d.parent === root ? "inline" : "none")
		.text((d) => d.data.showName ? d.data.ministry : null);

	console.log(`root is ${root}`);
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
			.filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
			.transition(transition)
				.style("fill-opacity", (d) => d.parent === focus ? 1 : 0)
				.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
				.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
	}

	return svg.node();
}

const chart = buildZoomablePackedCircleChart();

// Just append this to the body tag for the time being.
document.getElementsByTagName("body")[0].appendChild(chart);
