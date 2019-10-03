import { mouse } from "d3-selection";

// Expected to be used with d3.
// NOTE: It's strongly suggested that you wrap your html in a <div> so that margins, and other styling, can be applied via CSS.
// FIXME: proto/quick and dirty tooltip support
export class Tooltip {
	// Generate a tooltip bubble from a polygon. This generates the points required for the polygon
	// based on where the bubble should be (i.e. tip pointing up/down and tip on left or right side of the bubble.)
	private static genBubblePolyPoints(polyWidth, polyHeight, tipOffset, tipWidth, tipHeight, pointDown, tipOnRight): string {
		if(!pointDown && !tipOnRight) {
			return `0,0 0,${polyHeight} ${polyWidth},${polyHeight} ${polyWidth},0 ${tipOffset},0 ${tipWidth},${-tipHeight} ${tipOffset / 2},0`;
		} else if(pointDown && !tipOnRight) {
			return `0,0 0,${polyHeight} ${tipOffset / 2},${polyHeight} ${tipWidth},${tipHeight + polyHeight} ${tipOffset},${polyHeight} ${polyWidth},${polyHeight} ${polyWidth},0`;
		} else if(!pointDown && tipOnRight) {
			return `0,0 0,${polyHeight} ${polyWidth},${polyHeight} ${polyWidth},0 ${polyWidth - tipOffset / 2},0 ${polyWidth - tipWidth},${-tipHeight} ${polyWidth - tipOffset},0`;
		} else {
			return `0,0 0,${polyHeight} ${polyWidth - tipOffset},${polyHeight} ${polyWidth - tipWidth},${tipHeight + polyHeight} ${polyWidth - tipOffset / 2},${polyHeight} ${polyWidth},${polyHeight} ${polyWidth},0`;
		}
	}

	// FIXME: Should be configurable
	private tipOffset = 50;
	private tip = {w: (3 / 4 * 50), h: 15};

	private readonly tooltipArea;
	private readonly rootSelection;
	private readonly bubbleWidth;  // FIXME: dynamic / CSS based?
	private readonly bubbleHeight;
	private readonly chartWidth;
	private readonly chartHeight;
	private readonly bubbleOpacity;
	private readonly bubbleBackground;

	// If bubbleHeight < 0 then go with a dynamically calculated bubble height.
	constructor(rootSelection, bubbleWidth: number, bubbleHeight: number, chartWidth: number, chartHeight: number, backgroundColour, backgroundOpacity) {
		this.rootSelection = rootSelection;
		this.bubbleWidth = bubbleWidth;
		this.bubbleHeight = bubbleHeight;
		this.chartWidth = chartWidth;
		this.chartHeight = chartHeight;
		this.bubbleBackground = backgroundColour;
		this.bubbleOpacity = backgroundOpacity;

		this.tooltipArea = rootSelection
			.append("g")
				.attr("class", "tooltip-group");
	}

	public mouseoverHandler() {
		const rootSelection = this.rootSelection;
		const tooltipArea = this.tooltipArea;
		const width = this.bubbleWidth;
		const height = this.bubbleHeight;
		const chartWidth = this.chartWidth;
		const chartHeight = this.chartHeight;
		const tip = this.tip;
		const tipOffset = this.tipOffset;
		const bubbleBackground = this.bubbleBackground;
		const bubbleOpacity = this.bubbleOpacity;

		// NOTE: This function will be called with different "this" - it is not the object this
		return function(d) {
			let [x, y] = mouse(rootSelection.node() as any);
			console.log(`mouseover event at ${x}, ${y}`);

			if(d.data.tooltip) {
				const testContent = tooltipArea
					.append("foreignObject")
						.attr("class", "svg-tooltip-content")
						.attr("pointer-events", "none")
						.attr("width", width)
						.html(d.data.tooltip);

				const calculatedHeight = height >= 0 ? height : testContent.select("div").node().getBoundingClientRect().height;

				// Position the tooltip to keep inside the chart
				let invertVert = false;
				let invertHoriz = false;
				if(x + width > chartWidth) {
					x = x - width;
					invertHoriz = true;
				}

				if(y + height + tip.h > chartHeight) {
					y = y - height - tip.h;
					invertVert = true;
				}

				testContent
					.attr("x", x + (invertHoriz ? tip.w : -tip.w))
					.attr("y", y + (invertVert ? -tip.h : +tip.h))
					.attr("height", calculatedHeight);

				tooltipArea
					.insert("polygon", "foreignObject")
						.attr("class", "svg-tooltip-outline")
						.attr("pointer-events", "none")
						.attr("opacity", 1)
						.attr("transform", `translate(${(x + (invertHoriz ? tip.w : -tip.w))},${(y + (invertVert ? -tip.h : +tip.h))})`)
						.attr("width", width)
						.attr("height", calculatedHeight)
						.attr("points", Tooltip.genBubblePolyPoints(width, calculatedHeight, tipOffset, tip.w, tip.h, invertVert, invertHoriz))
						.attr("fill", bubbleBackground)
						.attr("opacity", bubbleOpacity);
			}
		};
	}

	public mousemoveHandler() {
		const rootSelection = this.rootSelection;
		const tooltipArea = this.tooltipArea;
		const width = this.bubbleWidth;
		const height = this.bubbleHeight;
		const chartWidth = this.chartWidth;
		const chartHeight = this.chartHeight;
		const tip = this.tip;
		const tipOffset = this.tipOffset;

		// NOTE: This function will be called with different "this" - it is not the object this
		return function(d) {
			let [x, y] = mouse(rootSelection.node() as any);
			console.log(`mousemove event at ${x}, ${y}`);

			if(d.data.tooltip) {
				const calculatedHeight = height >= 0 ? height : tooltipArea.select("foreignObject div").node().getBoundingClientRect().height;

				// Position the tooltip to keep inside the chart
				let invertVert = false;
				let invertHoriz = false;
				if(x + width > chartWidth) {
					x = x - width;
					invertHoriz = true;
				}

				if(y + calculatedHeight + tip.h > chartHeight) {
					y = y - calculatedHeight - tip.h;
					invertVert = true;
				}

				tooltipArea
					.select("polygon")
					.attr("points", Tooltip.genBubblePolyPoints(width, calculatedHeight, tipOffset, tip.w, tip.h, invertVert, invertHoriz))
					.attr("transform", `translate(${(x + (invertHoriz ? tip.w : -tip.w))},${(y + (invertVert ? -tip.h : tip.h))})`);

				tooltipArea
					.select("foreignObject")
					.attr("x", x + (invertHoriz ? tip.w : -tip.w))
					.attr("y", y + (invertVert ? -tip.h : tip.h));
			}
		};
	}

	public mouseoutHandler() {
		const rootSelection = this.rootSelection;
		const tooltipArea = this.tooltipArea;

		// NOTE: This function will be called with different "this" which is not the object this
		return function() {
			const [x, y] = mouse(rootSelection.node() as any);
			console.log(`mouseout event at ${x}, ${y}`);

			tooltipArea
				.select("foreignObject")
					.remove();

			tooltipArea
				.select("polygon")
					.remove();
		};
	}}
