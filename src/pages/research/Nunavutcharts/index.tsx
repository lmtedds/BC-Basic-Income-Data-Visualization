import { app, Component } from "apprun";
import { buildNunavutApplicationSunburst } from "~charts/NunavutApplication";
import { buildNunavutCashInKindSunburst } from "~charts/NunavutCashInKind";
import { buildNunavutExpenditureMinistry } from "~charts/NunavutExpenditure";
import { buildNunavutMinistryComplexitySunburst } from "~charts/NunavutMinistries";
import { buildNunavutTargetSunburst } from "~charts/NunavutTarget";

import "./style.scss";

export const NCHARTS_PAGE_URL: string = "/research-Nunavutcharts";

export default class NunavutChartsComponent extends Component {
	public state = {};

	public update = {
		[NCHARTS_PAGE_URL]: (state) => state,
	};

	private readonly nunavutMinistryComplexitySunburstSvgEle: SVGElement;
	private readonly nunavutCashInKindSunburstSvgEle: SVGElement;
	private readonly nunavutApplicationSunburstSvgEle: SVGElement;
	private readonly nunavutExpenditureSunburstSvgEle: SVGElement;
	private readonly nunavutTargetSunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.nunavutMinistryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutCashInKindSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutApplicationSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutExpenditureSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutTargetSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {

		const nunavutMinistrySunburst = buildNunavutMinistryComplexitySunburst(this.nunavutMinistryComplexitySunburstSvgEle);
		const nunavutCashInKindSunburst = buildNunavutCashInKindSunburst(this.nunavutCashInKindSunburstSvgEle);
		const nunavutApplicationSunburst = buildNunavutApplicationSunburst(this.nunavutApplicationSunburstSvgEle);
		const nunavutExpenditureSunburst = buildNunavutExpenditureMinistry(this.nunavutExpenditureSunburstSvgEle);

		return <>

			<div>
				<h1> Income and Social Support Programs in Nunavut </h1>
			</div>

							<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.nunavutMinistryComplexitySunburstSvgEle}
				</div>

			<div class="row">

				<div className="img-fluid col-xl">
					<h2 class="text-center">Programs by Expenditure</h2>
					{this.nunavutExpenditureSunburstSvgEle}
				</div>
			</div>

			<div class="row">

				<div className="img-fluid col-xl">
					<h2 class="text-center">Programs by Cash In-Kind Spectrum</h2>
					{this.nunavutCashInKindSunburstSvgEle}
				</div>
			</div>

			<div class="row">

				<div className="img-fluid col-xl">
					<h2 class="text-center">Programs by Method of Access</h2>
					{this.nunavutApplicationSunburstSvgEle}
				</div>
			</div>

		</>;
	}
}
