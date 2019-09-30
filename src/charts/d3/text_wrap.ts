import { select } from "d3-selection";

import { LineToLineMappedSource } from "webpack-sources";
import "./text_wrap.scss";

export interface IWrapTextDimenions {
	width: number;
	height: number;
	padding?: number;
	hCenter?: boolean; // rect positioning
	vCenter?: boolean; // rect positioning
	vJust?: boolean;

	fontSize?: string; // fallback guess for calculations in case can't query actual element
	fontFace?: string; // fallback guess for calculations in case can't query actual element
}

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
function offscreenGetWidth(text, fontSize?, fontFace?) {
	if(fontSize && fontFace) context.font = fontSize + " " + fontFace;
	return context.measureText(text).width;
}

// Wrap the words so that they fit inside the width provided.
// NOTE: This approach has difficulty when working with transitions and updating or exiting.
export function wrapTextTspan(text: any, dimensions: IWrapTextDimenions): any {
	const lineSpacing = 0.3; // 30% extra, so 130% line spacing.
	const padding = dimensions.padding || 0;
	const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
	const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
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
		const x = textEle.attr("x");
		const y = textEle.attr("y");

		// Font height in px is font size in pt (which is 0.75 px) => https://www.html5canvastutorials.com/tutorials/html5-canvas-text-metrics/
		// See https://practicaltypography.com/line-spacing.html for suggestion of 120% to 145% line height

		let fontSizePx = 16; // try to work with a guess of 16px.
		if(typeof fontSize === "string") {
			const match = fontSize.match(/^([0-9.]+)px$/);
			if(match) {
				fontSizePx = Number(match[1]);
			} else {
				console.error(`unable to handle non pixel size: ${fontSize}`);
			}
		}

		// const lineHeight = 1.1; // ems
		// FIXME: There's an assumption that fontSize is in pixels.
		const lineHeight = fontSizePx * 0.75;

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

		// const tspan = textEle.text(null);
		const tspan = textEle.text(null);

		for(let i = 0; i < lines.length; ++i) {
			const lineText = lines[i].join(" ");
			const lineLength = offscreenGetWidth(lineText, fontSize, fontFace);

			let dx = 0;
			let dy = (i + 1) * lineHeight + (i * lineHeight * lineSpacing); // line height + spacing between

			// Alter dx as appropriate
			if(hCenter) {
				dx -= width / 2;
			}

			// Alter dy as appropriate
			if(vCenter) {
				dy -= height / 2;
			}

			if(vJust) {
				// Approximation for height
				dy -= (lines.length * lineHeight + (lines.length - 1) * lineHeight * lineSpacing) / 2;
			}

			textEle
				.append("tspan")
					.attr("x", x || 0) // If x is specified for the text element we need to set x to the absolute position otherwise relative
					.attr("y", y || 0) // If y is specified for the text element we need to set y to the absolute position otherwise relative
					.attr("dx", dx)
					.attr("dy", dy)
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
				.html(content);

		// Remove the text element
		text.remove();
	});
}

export const wrapTextWithTspan = typeof SVGForeignObjectElement === "undefined";
