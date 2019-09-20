import { buildLinkedForceChart, ILinkForceChart } from "~charts/d3/interactions";
import { data as programInteractions } from "~data/20190824_interactions";

const program = "Program";
const cannot1 = "Cannot be/cannot be receiving (program 1):";
const cannot2 = "Cannot be/cannot be receiving (program 2):";
const must1 = "Must also qualify for (program 1):";
const must2 = "Must also qualify for (program 2):";

interface IProgramInteraction {
	id?: number; // FIXME: different type
	[program]: string;
	[cannot1]: string;
	[cannot2]: string;
	[must1]: string;
	[must2]: string;
}

function interactionsToLinkForceData(data): ILinkForceChart {
	// First put everything into a dictionary based on program and
	// add an id.
	const programs = new Map<string, IProgramInteraction>();

	const duplicates = [];
	data.forEach((node, index) => {
		const before = programs.size;
		programs.set(node[program], node);
		// console.assert(programs.size !== before, `duplicate: ${node[program]}`);
		if(programs.size === before) duplicates.push(node[program]);
	});

	console.assert(programs.size === data.length, `Program map and original data doesn't jive - name collision. duplicates: ${JSON.stringify(duplicates)}`);

	// Add an id to each node. We cannot do this in the previous step unless
	// we know that all the data is valid and that there are no duplicates.
	let i = 0;
	programs.forEach((aProgram) => {
		aProgram.id = i++;
	});

	const nodes = [];
	programs.forEach((aProgram) => {
		const entry = {
			id: aProgram.id,
			name: aProgram[program],
			links: [],
		};

		[cannot1, cannot2, must1, must2].forEach((index) => {
			if(aProgram[index]) {
				const target = programs.get(aProgram[index]);

				if(target) {
					entry.links.push({
						source: aProgram.id,
						target: target.id,
					});
				} else {
					// FIXME: Data ought to be cleaned up. Just work around for time being.
					console.error(`data problem: target program ${aProgram[index]} not found`);
				}
			}
		});

		nodes.push(entry);
	});

	return { nodes: nodes };
}

export function buildProgramInteractionChart(svgEle?: SVGElement) {
	const programInteractionData = interactionsToLinkForceData(programInteractions);

	return buildLinkedForceChart(programInteractionData, svgEle);
}
