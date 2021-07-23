import { app, Component } from "apprun";
import { buildNunavutCashInKindSunburst } from "~charts/NunavutCashInKind";
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
	private readonly nunavutTargetSunburstSvgEle: SVGElement;
	private readonly nunavutCashInKindSunburstSvgEle: SVGElement;

	constructor() {
		super();

		this.nunavutMinistryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutTargetSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.nunavutCashInKindSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {

		const nunavutMinistrySunburst = buildNunavutMinistryComplexitySunburst(this.nunavutMinistryComplexitySunburstSvgEle);
		const nunavutTargetSunburst = buildNunavutTargetSunburst(this.nunavutTargetSunburstSvgEle);
		const nunavutCashInKindSunburst = buildNunavutCashInKindSunburst(this.nunavutCashInKindSunburstSvgEle);

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
					<h2 class="text-center">Program Targets</h2>

					<div  style="transform:translate(0px, 0px)">
						<svg width="2000" height="50">
							<rect x="10" y="0" width="20" height="20"  style="fill:#006600"/>
							<rect x="210" y="0" width="20" height="20" style="fill:#7fb27f"/>
							<rect x="430" y ="0" width="20" height="20" style="fill:#00aeef"/>
							<rect x="660" y="0" width="20" height="20" style="fill:#66cef5"/>
							<rect x="920" y="0" width="20" height="20" style="fill:#cceefb"/>
							<rect x="10" y="25" width="20" height="20" style="fill:#992277"/>
							<rect x="210" y="25" width="20" height="20" style="fill:#fec22d"/>
							<rect x="430" y="25" width="20" height="20" style="fill:#7f6116"/>
							<text x="35" y="17" font-size="large">Pure Cash Transfer</text>
							<text x="235" y="17" font-size="large">Cash Geared to Cost</text>
							<text x="455" y="17" font-size="large">Refundable Tax Credit</text>
							<text x="685" y="17" font-size="large">Non-refundable Tax Credit</text>
							<text x="945" y="17" font-size="large">Tax Deduction</text>
							<text x="35" y="43" font-size="large">Pure In-Kind</text>
							<text x="235" y="43" font-size="large">Service/Third Party</text>
							<text x="455" y="43" font-size="large">Favorable Terms of Sale/Purchase</text>

						</svg>

					</div>
					{this.nunavutTargetSunburstSvgEle}
				</div>
			</div>

			<div class="row">

				<div className="img-fluid col-xl">
					<h2 class="text-center">Cash In-Kind Spectrum</h2>
					{this.nunavutCashInKindSunburstSvgEle}
				</div>
			</div>

		</>;
	}
}
