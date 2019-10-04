import { select } from "d3-selection";

import "./text_wrap.scss";

export interface IWrapTextDimenions {
	width: number;
	height: number;
	padding?: number;
	hCenter?: boolean; // rect positioning
	vCenter?: boolean; // rect positioning
	vJust?: boolean;

	fontSize: string;
	fontFamily: string;
}

const canvas: HTMLCanvasElement = document.createElement("canvas");
const context = canvas.getContext("2d");
function offscreenGetWidth(text, fontSize?, fontFamily?) {
	// FIXME: Should also consider SVG's kerning, letter-spacing, and word-spacing attributes. Not sure how these translate.
	if(fontSize && fontFamily) context.font = fontSize + " " + fontFamily;
	return context.measureText(text).width;
}

// Wrap the words so that they fit inside the width provided.
// NOTE: This approach has difficulty when working with transitions and updating or exiting.
export function wrapTextTspanEach(textEle: any, dimensions: IWrapTextDimenions): any {
	const padding = dimensions.padding || 0;
	const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
	const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
	const vJust = dimensions.vJust !== undefined ? dimensions.vJust : false;
	const width = dimensions.width - 2 * padding;
	const height = dimensions.height - 2 * padding;
	const x = textEle.attr("x");
	const y = textEle.attr("y");

	// Can dynamically get the element's style, but it's quite expensive when running
	// this function as part of a d3 transition. For the time being remove it and
	// require the caller to provide this information.
	// const textStyle = window.getComputedStyle(textEle.node());
	// const fontSize = textStyle.fontSize || dimensions.fontSize;
	// const fontFamily = textStyle.getPropertyValue("font-face") || dimensions.fontFamily;
	// console.assert(dimensions.fontSize && dimensions.fontFamily, "font not provided");
	const fontSize = dimensions.fontSize;
	const fontFamily = dimensions.fontFamily;

	// See https://practicaltypography.com/line-spacing.html for suggestion of 120% to 145% line height.
	const lineSpacing = 0.3; // 30% extra, so 130% line spacing.

	// Stash the text in a <desc> block so that it can be used later as the definitive source.
	const desc = textEle.select("desc");
	const text = desc.empty() ? textEle.text() : desc.text();
	const words = text.split(/\s+/).reverse();

	// Create a desc block and populate it with the cannonical text. We can then retrieve it later
	// if needed. Setting the text element's text to null will delete all the children (not sure why
	// but it does on chrome for sure) so use it to get rid of either the text or the tspans that are
	// there so we can start with a clean slate.
	textEle.text(null);
	textEle.append("desc").text(text);

	// FIXME: There's a requirement that fontSize is in pixels.
	let fontSizePx = 16; // try to work with a guess of 16px.
	if(typeof fontSize === "string") {
		const match = fontSize.match(/^([0-9.]+)px$/);
		if(match) {
			fontSizePx = Number(match[1]);
		} else {
			console.error(`unable to handle non pixel size: ${fontSize}`);
		}
	}

	// Font height in px is font size in pt (which is 0.75 px) => https://www.html5canvastutorials.com/tutorials/html5-canvas-text-metrics/
	const lineHeight = fontSizePx * 0.75;

	// Put all the words into lines. Simplistic approach to fit the most possible on each line.
	// FIXME: What to do if the words don't fit in the space (including the height?) Probably just want 1 line stretched.
	const lines = [];
	let line = [];
	while(words.length) {
		const word = words.pop();
		line.push(word);

		const calculatedWidth = offscreenGetWidth(line.join(" "), fontSize, fontFamily);
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
		const lineLength = offscreenGetWidth(lineText, fontSize, fontFamily);
		if(longestLine <= lineLength) longestLine = lineLength;
	}

	for(let i = 0; i < lines.length; ++i) {
		const lineText = lines[i].join(" ");
		const lineLength = offscreenGetWidth(lineText, fontSize, fontFamily);

		let dx = 0;
		let dy = (i + 1) * lineHeight + (i * lineHeight * lineSpacing); // line height + spacing between

		// Alter dx as appropriate
		if(hCenter) {
			dx -= width / 2; // Wrap the words so that they fit inside the width provided.
			// NOTE: This approach has difficulty when working with transitions and updating or exiting.

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
}

// Wrap the words so that they fit inside the width provided.
// NOTE: This approach has difficulty when working with transitions and updating or exiting.
export function wrapTextTspan(text: any, dimensions: IWrapTextDimenions): any {
	text.each(function() {
		const textEle = select(this);
		return wrapTextTspanEach(textEle, dimensions);
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
				.attr("class", `text-wrap-inner ${vJust ? " text-wrap-jvert" : ""}`)
				.html(content);

		// Remove the text element
		text.remove();
	});
}

export const wrapTextWithTspan = typeof SVGForeignObjectElement === "undefined";
