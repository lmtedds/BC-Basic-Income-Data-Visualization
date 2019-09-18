import * as d3 from "d3";

export interface ILinkForceChartLink {
	target: number; // 0 indexed node id
	type?: string;
}

export interface ILinkForceChartNode {
	id: number; // 0 indexed id.
	name: string;
	links: ILinkForceChartLink[];
}

export interface ILinkForceChart {
	nodes: ILinkForceChartNode[];
}

function getLinks(data: ILinkForceChart) {
	const links = data.nodes.reduce((accum, ele) => {
		const linksForThisNode = ele.links.map((link) => {
			const l = {
				source: ele.id,
				target: link.target,
			};
			// return Object.assign(l, link);
			return l;
		});
		return accum.concat(linksForThisNode);
	}, []);

	return links;
}

export function buildLinkedForceChart(chartData, svgEle?: SVGElement) {
	// Create a new svg node or use an existing one.
	const svg = svgEle ? d3.select(svgEle) : d3.create("svg");

	const nodes = chartData.nodes;
	const links = getLinks(chartData);

	// Figure out how to divide up the space
	const width = 1000;
	const height = 1000;
	const yAxisWidth = 100;
	const xAxisHeight = 100;

	svg
		.attr("viewBox", `0 0 ${width} ${width}`)
		.attr("perserveAspectRatio", "xMinYMin meet")
		.style("font", "10px sans-serif");

	svg.append("g")
		.attr("class", "links");

	svg.append("g")
		.attr("class", "nodes");

	const simulation = d3.forceSimulation(nodes as any)
		.force("charge", d3.forceManyBody().strength(-10))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("link", d3.forceLink(links))
		.on("tick", ticked);

	function updateLinks() {
		const u = d3.select(".links")
			.selectAll("line")
			.data(links);

		u.enter()
			.append("line")
			.merge(u as any)
			.attr("stroke", "#ccc") // FIXME: move to CSS
			.attr("x1", function(d: any) {
				return d.source.x;
			})
			.attr("y1", function(d: any) {
				return d.source.y;
			})
			.attr("x2", function(d: any) {
				return d.target.x;
			})
			.attr("y2", function(d: any) {
				return d.target.y;
			});

		u.exit().remove();
	}

	function updateNodes() {
		const u = d3.select(".nodes")
			.selectAll("text")
			.data(nodes as any);

		u.enter()
			.append("text")
			.text(function(d: any) {
				return d.name;
			})
			.merge(u as any)
			.attr("x", function(d: any) {
				return d.x;
			})
			.attr("y", function(d: any) {
				return d.y;
			})
			.attr("dy", function(d: any) {
				return 5;
			});

		u.exit().remove();
	}

	function ticked() {
		updateLinks();
		updateNodes();
	}

	return svg.node();
}
