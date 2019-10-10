import { oneLine } from "common-tags";
import { mouse } from "d3-selection";

import { chooseBestContrastColour } from "~utils/colour";

// Expected to be used with d3.
// NOTE: You must wrap your html in a <div>, since it's assumed there is one, so that calculations of size can be done. Also, it gives a good anchor for applying
//       padding, and other styling, can be applied via CSS.
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

	private static genBubblePath(polyWidth, polyHeight, tipOffset, tipWidth, tipHeight, pointDown, tipOnRight): string {
		const radius = 10; // FIXME: modify on polyWidth and polyHeight

		if(!pointDown && !tipOnRight) {
			return oneLine`
				M 0 ${radius}
				L 0 ${polyHeight - radius}
				Q 0 ${polyHeight}, ${radius} ${polyHeight}
				L ${polyWidth - radius} ${polyHeight}
				Q ${polyWidth} ${polyHeight}, ${polyWidth} ${polyHeight - radius}
				L ${polyWidth} ${radius}
				Q ${polyWidth} 0, ${polyWidth - radius} 0
				L ${tipOffset} 0
				L ${tipWidth} ${-tipHeight}
				L ${tipOffset / 2} 0
				L ${radius} 0
				Q 0 0, 0 ${radius}`;
		} else if(pointDown && !tipOnRight) {
			return oneLine`
				M 0 ${radius}
				L 0 ${polyHeight - radius}
				Q 0 ${polyHeight}, ${radius} ${polyHeight}
				L ${tipOffset / 2} ${polyHeight}
				L ${tipWidth} ${tipHeight + polyHeight}
				L ${tipOffset} ${polyHeight}
				L ${polyWidth - radius} ${polyHeight}
				Q ${polyWidth} ${polyHeight}, ${polyWidth} ${polyHeight - radius}
				L ${polyWidth} ${radius}
				Q ${polyWidth} 0, ${polyWidth - radius} 0
				L ${radius} 0
				Q 0 0, 0 ${radius}`;
		} else if(!pointDown && tipOnRight) {
			return oneLine`
				M 0 ${radius}
				L 0 ${polyHeight - radius}
				Q 0 ${polyHeight}, ${radius} ${polyHeight}
				L ${polyWidth - radius} ${polyHeight}
				Q ${polyWidth} ${polyHeight}, ${polyWidth} ${polyHeight - radius}
				L ${polyWidth} ${radius}
				Q ${polyWidth} 0, ${polyWidth - radius} 0
				L ${polyWidth - tipOffset / 2} 0
				L ${polyWidth - tipWidth} ${-tipHeight}
				L ${polyWidth - tipOffset} 0
				L ${radius} 0
				Q 0 0, 0 ${radius}`;
		} else { // pointDown && tipOnRight
			return oneLine`
				M 0 ${radius}
				L 0 ${polyHeight - radius}
				Q 0 ${polyHeight}, ${radius} ${polyHeight}
				L ${polyWidth - tipOffset} ${polyHeight}
				L ${polyWidth - tipWidth} ${tipHeight + polyHeight}
				L ${polyWidth - tipOffset / 2} ${polyHeight}
				L ${polyWidth - radius} ${polyHeight}
				Q ${polyWidth} ${polyHeight}, ${polyWidth} ${polyHeight - radius}
				L ${polyWidth} ${radius}
				Q ${polyWidth} 0, ${polyWidth - radius} 0
				L ${radius} 0
				Q 0 0, 0 ${radius}`;
		}
	}

	private static getBoundingHeight(content, rootSelection): number {
		// Get size in element based coords
		const boundingRect = content.select("div").node().getBoundingClientRect();

		// Ratio of CSS pixels to screen pixels.
		const pixelRatio = window.devicePixelRatio;

		// Transform to SVG coords
		const rootNode = rootSelection.node();
		const pt1 = rootNode.createSVGPoint();
		const pt2 = rootNode.createSVGPoint();

		pt1.x = boundingRect.left;
		pt1.y = boundingRect.top;
		pt2.x = boundingRect.right;
		pt2.y = boundingRect.bottom;

		const ctmInverse = rootNode.getScreenCTM().inverse();

		const svgPt1 = pt1.matrixTransform(ctmInverse);
		const svgPt2 = pt2.matrixTransform(ctmInverse);

		// Height is difference between the 2 transformed y values modified by
		// any multiplication in the CSS pixel size to screen pixels from zooming.
		return (svgPt2.y - svgPt1.y) / pixelRatio;
	}

	// FIXME: Should be configurable
	private tipOffset = 50;
	private tip = {w: (3 / 4 * 50), h: 10};

	private readonly tooltipArea;
	private readonly rootSelection;
	private readonly bubbleWidth;  // FIXME: dynamic / CSS based?
	private readonly bubbleHeight;
	private readonly chartWidth;
	private readonly chartHeight;
	private readonly bubbleOpacity;
	private readonly bubbleBackground;
	private readonly bubbleStroke;
	private readonly roundedBubble;
	private calculatedHeight: number;

	// If bubbleHeight < 0 then go with a dynamically calculated bubble height.
	constructor(rootSelection, bubbleWidth: number, bubbleHeight: number, chartWidth: number, chartHeight: number, backgroundColour, backgroundOpacity) {
		this.rootSelection = rootSelection;
		this.bubbleWidth = bubbleWidth;
		this.bubbleHeight = bubbleHeight;
		this.chartWidth = chartWidth;
		this.chartHeight = chartHeight;
		this.bubbleBackground = backgroundColour;
		this.bubbleOpacity = backgroundOpacity;
		this.bubbleStroke = chooseBestContrastColour(backgroundColour, backgroundOpacity);
		this.roundedBubble = true;
		this.calculatedHeight = 0;

		this.tooltipArea = rootSelection
			.append("g")
				.attr("class", "tooltip-group");
	}

	public mouseoverHandler() {
		const This = this;

		// NOTE: This function will be called with different "this" - it is not the object this
		return function(d) {
			if(d.data.tooltip) {
				let [x, y] = mouse(This.rootSelection.node() as any);
				// console.log(`mouseover event at ${x}, ${y}`);

				const testContent = This.tooltipArea
					.append("foreignObject")
						.attr("class", "svg-tooltip-content")
						.attr("pointer-events", "none")
						.attr("width", This.bubbleWidth)
						.attr("height", 1) // Firefox, at this point, requires height >= 1 to calculate children correctly.
						.html(d.data.tooltip);

				const calculatedHeight = This.bubbleHeight >= 0 ? This.bubbleHeight : Tooltip.getBoundingHeight(testContent, This.rootSelection);
				This.calculatedHeight = calculatedHeight;

				// Position the tooltip to keep inside the chart
				let invertVert = false;
				let invertHoriz = false;
				if(x + This.bubbleWidth > This.chartWidth) {
					x = x - This.bubbleWidth;
					invertHoriz = true;
				}

				if(y + calculatedHeight + This.tip.h > This.chartHeight) {
					y = y - calculatedHeight;
					invertVert = true;
				}

				testContent
					.attr("x", x + (invertHoriz ? This.tip.w : -This.tip.w))
					.attr("y", y + (invertVert ? -This.tip.h : +This.tip.h))
					.attr("height", calculatedHeight);

				if(This.roundedBubble) {
					This.tooltipArea
						.insert("path", "foreignObject")
							.attr("class", "svg-tooltip-outline")
							.attr("pointer-events", "none")
							.attr("transform", `translate(${(x + (invertHoriz ? This.tip.w : -This.tip.w))},${(y + (invertVert ? -This.tip.h : +This.tip.h))})`)
							.attr("d", Tooltip.genBubblePath(This.bubbleWidth, calculatedHeight, This.tipOffset, This.tip.w, This.tip.h, invertVert, invertHoriz))
							.attr("fill", This.bubbleBackground)
							.attr("opacity", This.bubbleOpacity)
							.attr("stroke", This.bubbleStroke)
							.attr("stroke-width", This.bubbleWidth / 100);
				} else {
					This.tooltipArea
						.insert("polygon", "foreignObject")
							.attr("class", "svg-tooltip-outline")
							.attr("pointer-events", "none")
							.attr("transform", `translate(${(x + (invertHoriz ? This.tip.w : -This.tip.w))},${(y + (invertVert ? -This.tip.h : +This.tip.h))})`)
							.attr("width", This.bubbleWidth)
							.attr("height", calculatedHeight)
							.attr("points", Tooltip.genBubblePolyPoints(This.bubbleWidth, calculatedHeight, This.tipOffset, This.tip.w, This.tip.h, invertVert, invertHoriz))
							.attr("fill", This.bubbleBackground)
							.attr("opacity", This.bubbleOpacity);
				}
			}
		};
	}

	public mousemoveHandler() {
		const This = this;

		// NOTE: This function will be called with different "this" - it is not the object this
		return function(d) {
			if(d.data.tooltip) {
				let [x, y] = mouse(This.rootSelection.node() as any);
				// console.log(`mousemove event at ${x}, ${y}`);

				const calculatedHeight = This.calculatedHeight;

				// Position the tooltip to keep inside the chart
				let invertVert = false;
				let invertHoriz = false;
				if(x + This.bubbleWidth > This.chartWidth) {
					x = x - This.bubbleWidth;
					invertHoriz = true;
				}

				if(y + calculatedHeight + This.tip.h > This.chartHeight) {
					y = y - calculatedHeight;
					invertVert = true;
				}

				if(This.roundedBubble) {
					This.tooltipArea
						.select("path")
						.attr("d", Tooltip.genBubblePath(This.bubbleWidth, calculatedHeight, This.tipOffset, This.tip.w, This.tip.h, invertVert, invertHoriz))
						.attr("transform", `translate(${(x + (invertHoriz ? This.tip.w : -This.tip.w))},${(y + (invertVert ? -This.tip.h : This.tip.h))})`);
				} else {
					This.tooltipArea
						.select("polygon")
						.attr("points", Tooltip.genBubblePolyPoints(This.bubbleWidth, calculatedHeight, This.tipOffset, This.tip.w, This.tip.h, invertVert, invertHoriz))
						.attr("transform", `translate(${(x + (invertHoriz ? This.tip.w : -This.tip.w))},${(y + (invertVert ? -This.tip.h : This.tip.h))})`);
				}

				This.tooltipArea
					.select("foreignObject")
					.attr("x", x + (invertHoriz ? This.tip.w : -This.tip.w))
					.attr("y", y + (invertVert ? -This.tip.h : This.tip.h));
			}
		};
	}

	public mouseoutHandler() {
		const This = this;

		// NOTE: This function will be called with different "this" which is not the object this
		return function(d) {
			if(d.data.tooltip) {
				const [x, y] = mouse(This.rootSelection.node() as any);
				// console.log(`mouseout event at ${x}, ${y}`);

				This.calculatedHeight = 0;

				This.tooltipArea
					.select("foreignObject")
						.remove();

				if(This.roundedBubble) {
					This.tooltipArea
					.select("path")
						.remove();
				} else {
					This.tooltipArea
					.select("polygon")
						.remove();
				}
			}
		};
	}
}
