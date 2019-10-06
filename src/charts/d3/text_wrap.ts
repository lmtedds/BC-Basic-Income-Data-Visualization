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

function offscreenGetWidth(text): number {
	// FIXME: Should also consider SVG's kerning, letter-spacing, and word-spacing attributes. Not sure how these translate.
	return context.measureText(text).width;
}

function cacheOffscreenFont(fontSize: string, fontFamily: string): void {
	context.font = fontSize + " " + fontFamily;
}

interface ILine {
	text: string;
	len: number;
	max: number;
}

function buildLines(text: string, width: number): ILine[] {
	const newWords = text.split(/(\s+)/);
	const lines: ILine[] = [];
	let newLine = "";

	for(const word of newWords) {
		const oldLine = newLine;
		newLine += word;

		const calculatedWidth = offscreenGetWidth(newLine);
		if(calculatedWidth > width) {
			const trimmed = oldLine.trim();
			if(trimmed.length) {
				lines.push({
					text: trimmed,
					len: offscreenGetWidth(trimmed),
					max: calculatedWidth,
				});
			}

			newLine = word;
		}
	}

	if(newLine) {
		const trimmed = newLine.trim();
		if(trimmed.length) {
			lines.push({
				text: trimmed,
				len: offscreenGetWidth(trimmed),
				max: -1,
			});
		}
	}

	return lines;
}

// Wrap the words so that they fit inside the width provided.
// NOTE: This approach has difficulty when working with transitions - this function will need to be called again
//       with new width dimensions.
// FIXME: We could work with size function (i.e. variable width based on height)
export function wrapTextTspanEach(textEle: any, dimensions: IWrapTextDimenions): any {
	const padding = dimensions.padding || 0;
	const hCenter = dimensions.hCenter !== undefined ? dimensions.hCenter : false;
	const vCenter = dimensions.vCenter !== undefined ? dimensions.vCenter : false;
	const vJust = dimensions.vJust !== undefined ? dimensions.vJust : false;
	const width = dimensions.width - 2 * padding;
	const height = dimensions.height - 2 * padding;
	const x = textEle.attr("x");
	const y = textEle.attr("y");

	// Can dynamically get the element's style, but it's quite expensive. For the time being
	// remove it and require the caller to provide this information.
	// const textStyle = window.getComputedStyle(textEle.node());
	// const fontSize = textStyle.fontSize || dimensions.fontSize;
	// const fontFamily = textStyle.getPropertyValue("font-face") || dimensions.fontFamily;
	// console.assert(dimensions.fontSize && dimensions.fontFamily, "font not provided");
	const fontSize = dimensions.fontSize;
	const fontFamily = dimensions.fontFamily;
	cacheOffscreenFont(fontSize, fontFamily);

	// See https://practicaltypography.com/line-spacing.html for suggestion of 120% to 145% line height.
	const lineSpacing = 0.3; // 30% extra, so 130% line spacing.

	// FIXME: There's a requirement that fontSize is in pixels.
	let fontSizePx = 16; // try to work with a guess of 16px.
	const match = fontSize.match(/^([0-9.]+)px$/);
	if(match) {
		fontSizePx = Number(match[1]);
	} else {
		console.error(`unable to handle non pixel size: ${fontSize}`);
	}

	// Font height in px is font size in pt (which is 0.75 px) => https://www.html5canvastutorials.com/tutorials/html5-canvas-text-metrics/
	const lineHeight = fontSizePx * 0.75;

	// Stash the text in a <desc> block so that it can be used later as the definitive source.
	let desc = textEle.select("desc");
	const firstTextWrap = desc.empty();
	let text: string;
	let infoBlock: ILine;

	// Create a desc block and populate it with the cannonical text so that we can then retrieve it later
	// if the same text element is resized.
	if(firstTextWrap) {
		text = textEle.text();
		textEle.node().textContent = "";

		infoBlock = {text: text, len: -1, max: -1};
		desc = textEle.append("desc");
	} else {
		// FIXME: Need to see if we can shortcut recalc.
		infoBlock = JSON.parse(desc.text());

		// See if we have to rerun the text wrapping calculation. If we already fit
		// in the dimensions, then a recalculation wouldn't do anything so don't bother.
		if(width >= infoBlock.len && (infoBlock.max === -1 || width < infoBlock.max)) {
			// console.log(`shortcutting for ${desc.text()} => ${width}`);
			return;
		}

		text = infoBlock.text;

		// FIXME: We could reuse tspans if we were clever
		textEle.selectAll("tspan").remove();
	}

	const lines = buildLines(text, width);

	for(let i = 0; i < lines.length; ++i) {
		const lineText = lines[i].text;

		infoBlock.len = Math.max(infoBlock.len, lines[i].len);
		infoBlock.max = Math.max(infoBlock.max, lines[i].max);

		let dx = 0;
		let dy = (i + 1) * lineHeight + (i * lineHeight * lineSpacing); // line height + spacing between

		// Alter dx as appropriate
		if(hCenter) {
			dx -= width / 2; // Wrap the words so that they fit inside the width provided.
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
				.text(lineText);
	}

	// Write out the infoBlock.
	desc.text(JSON.stringify(infoBlock));
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
