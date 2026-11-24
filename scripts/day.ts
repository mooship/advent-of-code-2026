import { pathToFileURL } from "node:url";
import type { Answer, Solution } from "#lib/types.ts";

/** The answer and running time of one part. */
export interface PartResult {
	part: 1 | 2;
	answer: Answer;
	ms: number;
}

/** Runs the parts of the solution module at `solutionFile` on `input`, timing each; `onlyPart` limits it to one. */
export async function runParts(
	solutionFile: string,
	input: string,
	onlyPart?: 1 | 2,
): Promise<PartResult[]> {
	const solution: { part1: Solution; part2: Solution } = await import(
		pathToFileURL(solutionFile).href
	);
	const results: PartResult[] = [];
	for (const part of [1, 2] as const) {
		if (onlyPart !== undefined && onlyPart !== part) continue;
		const start = performance.now();
		const answer = await solution[part === 1 ? "part1" : "part2"](input);
		results.push({ part, answer, ms: performance.now() - start });
	}
	return results;
}
