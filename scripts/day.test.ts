import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runParts } from "./day.ts";

describe("runParts", () => {
	let dir: string;
	let solutionFile: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "aoc-day-"));
		solutionFile = join(dir, "solution.ts");
		writeFileSync(
			solutionFile,
			`export const part1 = (input: string) => input.length;
export const part2 = async (input: string) => BigInt(input.length) * 2n;
`,
		);
	});

	afterEach(() => {
		rmSync(dir, { recursive: true });
	});

	it("runs both parts, awaiting async ones, and times each", async () => {
		const results = await runParts(solutionFile, "abc");
		expect(results.map(({ part, answer }) => [part, answer])).toEqual([
			[1, 3],
			[2, 6n],
		]);
		for (const { ms } of results) expect(ms).toBeGreaterThanOrEqual(0);
	});

	it("runs only the requested part", async () => {
		const results = await runParts(solutionFile, "abc", 2);
		expect(results.map(({ part }) => part)).toEqual([2]);
	});
});
