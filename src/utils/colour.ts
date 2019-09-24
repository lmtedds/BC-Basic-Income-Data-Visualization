import * as Colour from "color";

// Return either white or black to indicate which would provide the best contrast to the provided rgb colour.
// See https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color/3943023#3943023
export function chooseBestContrastColour(foreRgb: string, foreAlpha: number = 1.0, backRgb = "#fff"): string {
	const foreColour = Colour(foreRgb).alpha(foreAlpha);
	const backColour = Colour(backRgb);

	const blendColour = Colour({
		r: (foreColour.red() * foreAlpha) + (backColour.red() * (1.0 - foreAlpha)),
		g: (foreColour.green() * foreAlpha) + (backColour.green() * (1.0 - foreAlpha)),
		b: (foreColour.blue() * foreAlpha) + (backColour.blue() * (1.0 - foreAlpha)),
	});

	const luminosity = blendColour.luminosity();

	return luminosity > 0.179 ? "#000000" : "#ffffff";
}
