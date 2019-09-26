import { select } from "d3-selection";

import { LineToLineMappedSource } from "webpack-sources";
import "./text_wrap.scss";

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

	fontSize?: string; // fallback guess for calculations in case can't query actual element
	fontFace?: string; // fallback guess for calculations in case can't query actual element
}

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
function offscreenGetWidth(text, fontSize?, fontFace?) {
	if(fontSize && fontFace) context.font = fontSize + "px " + fontFace;
	return context.measureText(text).width;
}

// Wrap the words so that they fit inside the width provided.
// NOTE: This approach has difficulting when working with transitions and updating or exiting.
// NOTE: If you find problems with this not actually wrapping, it might be that the text element
//       hasn't been rendered yet. You can do some kludging with setting a large padding.
//
// FIXME: This works for width but doesn't check height. Very primitive.
// FIXME: Doesn't work with shapes (i.e. varying widths depending on height).
// FIXME: Doesn't handle cases where can't wrap into bounding space with some kind of fallback.
// FIXME: May offset from center height.
export function wrapTextTspan2(text: any, dimensions: IWrapTextDimenions): any {
	const padding = dimensions.padding || 0;
	const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
	const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
	const hJust = dimensions.hJust !== undefined ? dimensions.hJust : IWrapTextDimensionsJustification.LEFT;
	const vJust = dimensions.vJust !== undefined ? dimensions.vJust : false;
	const width = dimensions.width - 2 * padding;
	const height = dimensions.height - 2 * padding;

	text.each(function() {
		const textEle = select(this);
		const textStyle = window.getComputedStyle(textEle.node());
		const fontSize = textStyle.fontSize || dimensions.fontSize;
		const fontFace = textStyle.getPropertyValue("font-face") || dimensions.fontFace;
		const words = textEle.text().split(/\s+/).reverse();
		const lineHeight = 1.1; // ems
		const x = textEle.attr("x");
		const y = textEle.attr("y");
		const dy = 0;

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
			if (offscreenGetWidth(line.join(" "), fontSize, fontFace) > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				++lineNumber;
				tspan = textEle.append("tspan")
					.attr("x", x || 0) // If x is specified for the text element we need to set x to the absolute position
					.attr("y", y || 0) // If y is specified for the text element we need to set x to the absolute position
					.attr("dx", 0) // FIXME: justification
					.attr("dy", (lineNumber * lineHeight + dy) + "em")
					.text(word);
			}
		}
	});
}

export function wrapTextTspan(text: any, dimensions: IWrapTextDimenions): any {
	const padding = dimensions.padding || 0;
	const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
	const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
	const hJust = dimensions.hJust !== undefined ? dimensions.hJust : IWrapTextDimensionsJustification.LEFT;
	const vJust = dimensions.vJust !== undefined ? dimensions.vJust : false;
	const width = dimensions.width - 2 * padding;
	const height = dimensions.height - 2 * padding;

	text.each(function() {
		const textEle = select(this);
		const textStyle = window.getComputedStyle(textEle.node());
		const fontSize = textStyle.fontSize || dimensions.fontSize;
		const fontFace = textStyle.getPropertyValue("font-face") || dimensions.fontFace;
		const eleText = textEle.text();
		const words = eleText.split(/\s+/).reverse();
		const lineHeight = 1.1; // ems
		const x = textEle.attr("x");
		const y = textEle.attr("y");

		const lineNumber = 0;

		// Put all the words into lines. Simplistic approach to fit the most possible on each line.
		// FIXME: What to do if the words don't fit in the space (including the height?) Probably just want 1 line stretched.
		const lines = [];
		let line = [];
		while(words.length) {
			const word = words.pop();
			line.push(word);

			const calculatedWidth = offscreenGetWidth(line.join(" "), fontSize, fontFace);
			if(calculatedWidth > width) {
				if(line.length === 1) {
					// FIXME: This word doesn't fit on a line... what do we want to do? Just plow on for now.
					lines.push(line);
				} else {
					line.pop();
					lines.push(line);
					words.push(word);
				}
				line = [];
			}
		}

		// Catch the last line in case it fit.
		if(line.length) lines.push(line);

		// Calculate some dimensions
		let longestLine = 0;
		for(const thisLine of lines) {
			const lineText = thisLine.join(" ");
			const lineLength = offscreenGetWidth(lineText, fontSize, fontFace);
			if(longestLine <= lineLength) longestLine = lineLength;
		}

		const tspan = textEle.text(null);

		for(let i = 0; i < lines.length; ++i) {
			const lineText = lines[i].join(" ");
			const lineLength = offscreenGetWidth(lineText, fontSize, fontFace);

			let dx = 0;
			let dy = (i + 1) * lineHeight;

			// Alter dx as appropriate
			if(hCenter) {
				dx -= width / 2;
			}

			switch(hJust) {
				case IWrapTextDimensionsJustification.CENTER:
					dx -= lineLength / 2;
					break;

				case IWrapTextDimensionsJustification.LEFT:
					dx -= 0;
					break;

				case IWrapTextDimensionsJustification.RIGHT:
					dx += (longestLine / 2) - lineLength;
					break;

				default:
					console.error(`unknown horizontal justification ${hJust}`);
			}

			// Alter dy as appropriate
			if(vCenter) {
				dy -= height / 2;
			}

			if(vJust) {
				// Approximation for height
				dy -= (lines.length * lineHeight) / 2;
			}

			textEle
				.append("tspan")
					.attr("x", x || 0) // If x is specified for the text element we need to set x to the absolute position otherwise relative
					.attr("y", y || 0) // If y is specified for the text element we need to set y to the absolute position otherwise relative
					.attr("dx", dx)
					.attr("dy", dy + "em")
					.text(lines[i].join(" "));

		}

		// console.log(`text wrap "${textEle.text()}" => ${JSON.stringify(lines)}`);
	});
}

// See https://github.com/vijithassar/d3-textwrap/blob/master/src/textwrap.js for inspiration
// NOTE: This approach has difficulting when working with transitions and updating or exiting.
export function wrapTextForeignObject(texts: any, dimensions: IWrapTextDimenions): void {
	texts.each(function() {
		const text = select(this);
		const content = text.text(); // can be only 1 text element that we will replace
		const x = text.attr("x");
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

			.attr("x", (hCenter ? (-width / 2) : 0) + Number(x) )
			.attr("y", (vCenter ? (-height / 2) : 0) + Number(y));

		// insert an HTML div
		const div = foreignobject
			.append("xhtml:div");

		// set div to same dimensions as foreign object
		div
			// FIXME: need a generic solution to bring across style/attrs
			// FIXME: should be using window.getComputedStyle?
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

export const wrapTextWithTspan = typeof SVGForeignObjectElement === "undefined";
