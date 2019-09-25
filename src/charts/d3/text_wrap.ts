import { select } from "d3-selection";

import "./text_wrap.scss";

// Wrap the words so that they fit inside the width provided.
// FIXME: This works for width but doesn't check height. Very primitive.
// FIXME: Doesn't work with shapes (i.e. varying widths depending on height).
// FIXME: Doesn't handle cases where can't wrap into bounding space with some kind of fallback.
// FIXME: Would be better to compute onto an existing canvas before creating all the elements.
// FIXME: May offset from center height.
function wrapTextTspan(text, maxTextWidth) {
	text.each(function() {
		const textEle = select(this);
		const words = textEle.text().split(/\s+/).reverse();
		const lineHeight = 1.1; // ems
		const y = textEle.attr("y");
		const dy = 0;
		const leftRightMargin = 2 * 10;

		let word;
		let line = [];
		let lineNumber = 0;
		let tspan = textEle.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

		// FIXME: This isn't a good way to do things. Need to compute first then once everything is computed
		//        output the elements so that dy is correct. Basically we're not vertically centered.
		// FIXME: What to do if the words don't fit in the space (including the height?) Probably just want 1 line stretched.
		// FIXME: Probably also want each line to have some kind of specified justification.
		while (words.length) {
			word = words.pop();
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > (maxTextWidth - leftRightMargin)) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				++lineNumber;
				tspan = textEle.append("tspan")
					.attr("x", 0)
					.attr("y", y)
					.attr("dy", (y ? (lineNumber * lineHeight + dy) : lineHeight + dy) + "em")
					.text(word);
			}
		}
	});
}

// See https://github.com/vijithassar/d3-textwrap/blob/master/src/textwrap.js for inspiration
export const enum IWrapTextDimensionsJustification {
	LEFT = 0,
	CENTER = 1,
	RIGHT = 2,
}

const JustEnumToCss = {
	[IWrapTextDimensionsJustification.LEFT]: "text-wrap-jleft",
	[IWrapTextDimensionsJustification.CENTER]: "text-wrap-jcenter",
	[IWrapTextDimensionsJustification.RIGHT]: "text-wrap-jright",
};

export interface IWrapTextDimenions {
	width: number;
	height: number;
	padding?: number;
	hCenter?: boolean; // rect positioning
	vCenter?: boolean; // rect positioning
	hJust?: IWrapTextDimensionsJustification;
	vJust?: boolean;
}

function wrapTextForeignObject(texts: any, dimensions: IWrapTextDimenions): void {
	texts.each(function() {
		const text = select(this);
		const content = text.text(); // can be only 1 text element that we will replace
		const y = text.attr("y");
		const padding = dimensions.padding || 0;
		const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
		const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
		const hJust = dimensions.hJust !== undefined ? dimensions.hJust : IWrapTextDimensionsJustification.LEFT;
		const vJust = dimensions.vJust !== undefined ? dimensions.vJust : false;
		const width = dimensions.width - 2 * padding;
		const height = dimensions.height - 2 * padding;

		// Create a foreign object
		const parent = select(text.node().parentNode);
		const foreignobject = parent.append("foreignObject");
		foreignobject
			.attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
			.attr("width", width)
			.attr("height", height)

			.attr("transform", text.attr("transform")) // FIXME: need a generic solution to bring across attrs

			.attr("x", hCenter ? (-width / 2) : 0)
			.attr("y", vCenter ? (-height / 2) : 0);

		// insert an HTML div
		const div = foreignobject
			.append("xhtml:div");

		// set div to same dimensions as foreign object
		div
			// FIXME: need a generic solution to bring across style/attrs
			.attr("style", `height: ${height}px; width: ${width}px; ${text.node().style.cssText}`)
			.attr("class", "text-wrap-outer");

		const p = div
			.append("xhtml:p")
				.attr("class", `text-wrap-inner ${JustEnumToCss[hJust]}${vJust ? " text-wrap-jvert" : ""}`)
				.html(content);

		// Remove the text element
		text.remove();
	});
}

// export const wrapText = typeof SVGForeignObjectElement === 'undefined' ? wrapTextTspan : wrapTextForeignObject;
// export const wrapText = wrapTextTspan;
export const wrapText = wrapTextForeignObject;
