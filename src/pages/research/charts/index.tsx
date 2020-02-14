import { app, Component } from "apprun";
import { buildWorkingAgeApplicationSunburstChart } from "~charts/applicationSunburst.ts";
import { buildCashInKindSunburstChart } from "~charts/cashInKind";
import { buildCashSuppSunburstChart } from "~charts/cashInKindSupp";
import { buildExpenditureChart } from "~charts/expenditure.ts";
import { buildMinistryComplexitySunburstChart } from "~charts/ministries";
import { buildWorkingAgeTypeSunburstChart } from "~charts/workingAgeType.ts";
import { buildTypeSunburstChart } from "~charts/workingAgeType.ts";

import "./style.scss";

export const CHARTS_PAGE_URL: string = "/research-charts";

export default class ChartsComponent extends Component {
	public state = {};

	public update = {
		[CHARTS_PAGE_URL]: (state) => state,
	};

	private readonly ministryComplexitySunburstSvgEle: SVGElement;
	private readonly cashInKindSunburstSvgEle: SVGElement;
	private readonly cashSuppSunburstSvgEle: SVGElement;
	private readonly workingAgeTypeSvgEle: SVGElement;
	private readonly typeSvgEle: SVGElement;
	private readonly workingAgeApplicationSvgEle: SVGElement;
	private readonly expenditureSvgEle: SVGElement;

	constructor() {
		super();

		this.ministryComplexitySunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.cashInKindSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.cashSuppSunburstSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.workingAgeTypeSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.typeSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.workingAgeApplicationSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.expenditureSvgEle = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	}

	public view = (state) => {

		const ministrySunburstChart = buildMinistryComplexitySunburstChart(this.ministryComplexitySunburstSvgEle);
		// console.log(ministerySunburstChart);

		const cashInKindSunburstChart = buildCashInKindSunburstChart(this.cashInKindSunburstSvgEle);
		// console.log(cashInKindSunburstChart);

		const cashSuppSunburstChart = buildCashSuppSunburstChart(this.cashSuppSunburstSvgEle);

		const workingAgeTypeSunburstChart = buildWorkingAgeTypeSunburstChart(this.workingAgeTypeSvgEle);

		const typeSunburstChart = buildTypeSunburstChart(this.typeSvgEle);

		const workingAgeApplicationSunburst = buildWorkingAgeApplicationSunburstChart(this.workingAgeApplicationSvgEle);

		const expenditureSunburst = buildExpenditureChart(this.expenditureSvgEle);

		return <>
			{/* <div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Eligibility</h2>
					{this.eligibilitySvgEle}
				</div>
				<div className="img-fluid col-xl">
					<h2 class="text-center">Application</h2>
					{this.applicationSvgEle}
				</div>
			</div>
			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">In Kind</h2>
					{this.inKindSvgEle}
				</div>
				<div className="img-fluid col-xl">
					<h2 class="text-center">Interactions</h2>
					{this.interactionLinkSvgEle}
				</div>
			</div> */}

<div>
	<h1> Income and Social Support Programs in B.C. </h1>
	</div>

			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Ministry Complexity</h2>
					{this.ministryComplexitySunburstSvgEle}
				</div>
			</div>

			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center"> By Expenditure </h2>
					{this.expenditureSvgEle}
				</div>
			</div>

			<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Cash Transfer vs. In-Kind</h2>
			<p>This sunburst arranges all 177 income and social support programs offered in B.C. into their method of receipt. The methods are:
		<ul>
			<li><b>Pure cash transfer:</b> these programs are paid out as cash with the benefit amounts set without regard to actual expenses incurred.</li>
			<li> <b>Refundable tax credit:</b> these programs are offered through the tax system and may result in an actual cash payment to an eligible recipient (if there is money left over after first being applied to taxes owing). </li>
			<li><b>Non-refundable tax credit:</b> these programs are offered through the tax system and are used to reduce taxes owing. Any remainder after paying off taxes owing is immediatly forfeited by the taxpayer.</li>
			<li><b>Cash geared to cost:</b> these programs are paid out as cash with the amount of benefit tied to an actual expense to be incurred by an eligible recipient. Although similiar to pure in-kind (and often included as in-kind programs), cash geared to cost programs can affect spending behavior differently than pure in-kind. Cash geared to cost programs gives cash to the recipient and does not follow-up on how the cash is actually spent. This may cause difficulty for some recipients in ensuring the intended expense is paid.</li>
			<li><b>Bill repayment:</b> these programs are paid out as cash with the amount of benefit tied to an expense already incurred. Although generally included as in-kind, bill repayments affect behavior differently than a pure in-kind program. Take-up may be lower if large expenses must be incurred first.</li>
		<li><b>Pure In-kind:</b> these programs directly cover the cost of a service used by an eligible recipient, such as health care or education. </li>
			<li><b>Services:</b> these are programs where the funding goes to an eligible third-party such as an employer or network.</li>
			</ul>
		</p>
					{this.cashInKindSunburstSvgEle}
				</div>
			</div>

				<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">B.C. General and Health Supplements</h2>
			<p>This sunburst contains only those programs provided by the Government of B.C. to recipients of Income Assistance, Disability, and Hardship Assistance as either a General Supplement or a Disability Supplement.</p>
					{this.cashSuppSunburstSvgEle}
				</div>
			</div>

				<div class="row">
				<div className="img-fluid col-xl">
					<h2 class="text-center">Programs for Working-Age Persons</h2>
					{this.typeSvgEle}

				</div>
					</div>

			<div class="row">
			<div className="img-fluid col-xl">
				<h2 class="text-center"> Application Method</h2>
				{this.workingAgeApplicationSvgEle}
			</div>
			</div>

		</>;
	}
}
