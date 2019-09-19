import * as d3 from "d3";

// Wrap the words so that they fit inside the width provided.
// FIXME: This works for width but doesn't check height. Very primitive.
// FIXME: Doesn't work with shapes (i.e. varying widths depending on height).
// FIXME: Doesn't handle cases where can't wrap into bounding space with some kind of fallback.
// FIXME: Would be better to compute onto an existing canvas before creating all the elements.
// FIXME: May offset from center height.
export function wrapText(text, maxTextWidth) {
	text.each(function() {
		const textEle = d3.select(this);
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
