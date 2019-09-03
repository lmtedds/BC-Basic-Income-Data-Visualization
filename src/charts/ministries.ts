// This is where typescript/javascript starts from. A reference to it is automatically added to index.html (via webpack).
import * as d3 from "d3";
import clonedeep from "lodash.clonedeep";

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

	// Pull out all the programs for this level from the data.
	const getProgramsForLevelAsChildren = (level: string): ID3Hierarchy[] => {
	// 	const leveledPrograms = rawData.reduce((accum: ID3Hierarchy[], ele: IMinistry, index: number) => {
	// 		// Ignore programs not for this level of government.
	// 		if(ele["Level of Government"] !== level) {
	// 			return accum;
	// 		}

	// 		// Provide an inner circle in the case where the program is
	// 		// administered by another
	// 		if(ele["Ministry - point of contact/administration:"]) {
	// 			return accum.concat([{
	// 				ministry: ele["Ministry - point of contact/administration:"],
	// 				showName: true, // FIXME: What's the decision to show here?
	// 				value: 1,
	// 				children: [{
	// 					ministry: ele["Managed by (Ministry):"],
	// 					showName: ele["Importance Ranking"] === "2" ? true : false,
	// 					value: 1,
	// 					program: ele.Program,
	// 					// children: undefined as does not have administrator
	// 				}],
	// 			}]);
	// 		} else {
	// 			return accum.concat([{
	// 				ministry: ele["Managed by (Ministry):"],
	// 				showName: ele["Importance Ranking"] === "2" ? true : false,
	// 				value: 1,
	// 				program: ele.Program,
	// 				// children: undefined as a program may not have children
	// 			}]);
	// 		}
	// 	}, []);

	// 	console.log(`For level ${level} => ${JSON.stringify(leveledPrograms,  null, 4)}`);

	// 	// Now go through all this list of programs to join all programs under the same ministry
	// 	// so that we don't have millions of bubbles.

	// return leveledPrograms;

		// Alternative implementation using a dictionary:
		// FIXME: The ministries names are incorrect... pushing down the wrong value it seems.
		const programDictionary = {};

		console.log(`Length of the data is ${rawData.length}`);

		for(const ele of rawData) {
			console.log(`${JSON.stringify(ele)}`);

			// Ignore programs not for this level of government.
			if(ele["Level of Government"] !== level) {
				continue;
			}

			// Create the entry
			let entry: ID3Hierarchy;
			if(ele["Ministry - point of contact/administration:"]) {
				entry = {
					ministry: ele["Managed by (Ministry):"],
					showName: true, // FIXME: What's the decision to show here?
					value: 1,
					children: [{
						ministry: ele["Ministry - point of contact/administration:"],
						showName: ele["Importance Ranking"] === "2" ? true : false,
						value: 1,
						program: ele.Program,
						// children: undefined as does not have administrator
					}],
				};
			} else {
				entry = {
					ministry: ele["Managed by (Ministry):"],
					showName: ele["Importance Ranking"] === "2" ? true : false,
					value: 1,
					program: ele.Program,
					// children: undefined as a program may not have children
				};
			}

			console.log(`created entry is ${JSON.stringify(entry)}`);

			// Add or merge it into the dictionary. FIXME: Should be generic.
			if(!programDictionary[entry.ministry]) {
				// Add
				programDictionary[entry.ministry] = entry;
			} else {
				if(!entry.children) {
					// Merge with no child
					if(!programDictionary[entry.ministry].children) {
						// Merge with both no children (so just programs)
						programDictionary[entry.ministry].children = [
							{
								showName: programDictionary[entry.ministry].showName,
								program: programDictionary[entry.ministry].program,
								value: programDictionary[entry.ministry].value,
							},
							entry, // delete below will remove ministry entry.
						];
						delete programDictionary[entry.ministry].program;
						delete entry.ministry;
					} else {
						// Merge with existing having children (programs or ministry w/ or w/o programs) but entry not (program)
						if(entry.program) {
							programDictionary[entry.ministry].children.push(entry);
							delete entry.ministry;
						} else {
							// debugger;
							console.error("Unimplemented");
						}

					}
				} else {
					// Merge with child
					programDictionary[entry.ministry].children.push(clonedeep(entry.children[0])); // FIXME: Doesn't handle a 1st or 2nd level rejig
				}

			}
		}

		// console.log(`For level ${level} => ${JSON.stringify(programDictionary,  null, 4)}`);

		// each key should be an array entry.
		const programArray = [];
		Object.keys(programDictionary).forEach((key) => { programArray.push(programDictionary[key]); });

		console.log(`For level ${level} => ${JSON.stringify(programArray,  null, 4)}`);

		return programArray;
	};

	return {
		ministry: "Ministries",
		showName: true,
		value: 0,
		children: [{
			ministry: "Federal",
			showName: true,
			value: 1,
			children: getProgramsForLevelAsChildren("Federal").concat([{
				ministry: "Province",
				showName: true,
				value: 0,
				children: getProgramsForLevelAsChildren("Provincial"),
			}]),
		}],
	};
}

// Adapted from https://observablehq.com/@d3/zoomable-circle-packing
export function buildZoomablePackedCircleChart(svgEle?: SVGElement) {
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
		.range(["hsl(152,80%,80%)" as any, "hsl(228,30%,40%)" as any]) // FIXME: cast works around typescript def'n bug
		.interpolate(d3.interpolateHcl as any); // FIXME: cast works around typescript def'n bug

	// Mouse events
	const mouseover = function() { d3.select(this).attr("stroke", "#000"); };
	const mouseout = function() { d3.select(this).attr("stroke", null); };
	const mouseclick = function(d) { return focus !== d && (zoom(d), d3.event.stopPropagation()); };

	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");

	svg
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
		.text((d: any) => d.data.ministry /*d.data.showName ? d.data.ministry : null*/);

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
