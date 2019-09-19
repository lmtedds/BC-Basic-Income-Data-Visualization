import { data as inKindData } from "~data/20190824_cashInKind";

import { buildMatrixForceChart, IMatrixChart } from "~charts/d3/force_matrix";

export function buildInKindChart(svgEle?: SVGElement) {
	const fakeData: IMatrixChart = {
		axes: {
			xTitles: ["x1", "x2", "x3"],
			yTitles: ["y1", "y2"],
		},
		data: [
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
			[{radius: 10}, {radius: 5}, {radius: 20}, {radius: 60}, {radius: 10}],
		],
	}; // FIXME: fake data

	return buildMatrixForceChart(fakeData, svgEle);
}
