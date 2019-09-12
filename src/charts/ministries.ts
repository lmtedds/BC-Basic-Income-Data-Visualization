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

function genData(rawData: IMinistry[]): ID3Hierarchy {
	return {
		ministry: "root",
		showName: false,
		value: 0,

		children: [],
	};
}

function listToSortedTree(array, sortKeys: string[]) {
	// USEFUL?
	// Add an id to each element
	array.forEach((ele, index) => {ele._id = index; });

	// Stuff into a object (used as a map) based on key
	const obj = {};

	array.forEach((ele) => {
		let subObj = obj;
		sortKeys.forEach((key, index) => {
			const value = ele[key];
			if(index === sortKeys.length - 1) {
				// Last level of hierarchy/search. Insert our new element.
				if(subObj[value]) {
					subObj[value].push(ele);
				} else {
					subObj[value] = [ele];
				}
			} else {
				// Not last level of hierarchy. Just create the new level (if required).
				if(!subObj[value]) {
					subObj[value] = {};
				}

				subObj = subObj[value];
			}
		});
	});

	return obj;
}

function treeToHier(tree, obj: any = {ministry: "root", showName: false, value: 0}): any {
	if(Array.isArray(tree)) {
		return tree.map((ele: IMinistry) => {
			return {
				program: ele.Program,
				level: ele["Level of Government"],
				ministry: ele["Managed by (Ministry):"],
				admin: ele["Ministry - point of contact/administration - government:"],
				value: 1, // FIXME: Value
				showName: true,
			};
		});
	}

	Object.keys(tree).forEach((key) => {
		if(!obj.children) {
			obj.children = [];
		}

		const sub = treeToHier(tree[key], {ministry: key, value: 1, showName: true});
		if(Array.isArray(sub)) {
			obj.children = obj.children.concat(sub);
		} else {
			obj.children.push(sub);
		}
	});

	return obj;
}

// Adapted from https://observablehq.com/@d3/zoomable-circle-packing
export function buildZoomablePackedCircleChart(svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");

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

	const sortKeys = ["Level of Government", "Managed by (Ministry):", "Ministry - point of contact/administration:"];
	const sortData = listToSortedTree(data, sortKeys);
	const hierData = treeToHier(sortData);
	// console.log(`hier: ${JSON.stringify(hierData, null, 4)}`);

	const root = pack(hierData);
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
		.text((d: any) => d.data.showName ? d.data.ministry : null);

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
