import { app, Component } from "apprun";
import { buildNunavutMinistryComplexitySunburst } from "~charts/NunavutMinistries";

import "./style.scss";

export const NCHARTS_PAGE_URL: string = "/research-Nunavutcharts";

export default class NunavutChartsComponent extends Component {
	public state = {};

	public update = {
		[NCHARTS_PAGE_URL]: (state) => state,
	};

	private readonly nunavutMinistryComplexitySunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.nunavutMinistryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {

		const nunavutMinistrySunburst = buildNunavutMinistryComplexitySunburst(this.nunavutMinistryComplexitySunburstSvgEle);
		console.log(nunavutMinistrySunburst);

		return <>

			<div>
				<h1> Income and Social Support Programs in Nunavut </h1>
			</div>

			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.nunavutMinistryComplexitySunburstSvgEle}
				</div>
			</div>

		</>;
	}
}
