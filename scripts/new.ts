import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dayDir, parseDay, YEAR } from "./paths.ts";

const SOLUTION = `import { lines } from "#lib/input.ts";
import type { Answer } from "#lib/types.ts";

function parse(input: string) {
	return lines(input);
}

export function part1(input: string): Answer {
	const data = parse(input);
	return data.length;
}

export function part2(input: string): Answer {
	const data = parse(input);
	return data.length;
}
`;

const testStub = (label: string) => `import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { part1, part2 } from "./solution.ts";

// example.txt is git-ignored; paste the puzzle example into it.
const example = readFileSync(new URL("./example.txt", import.meta.url), "utf8");

// Drop the .todo and fill in the expected answer from the puzzle text.
describe("day ${label}", () => {
	it.todo("part 1 example", () => {
		expect(part1(example)).toBe(0);
	});

	it.todo("part 2 example", () => {
		expect(part2(example)).toBe(0);
	});
});
`;

/** Creates a day's solution, test stub and empty example in `dir`; returns false when `dir` already exists. */
export function scaffoldDay(day: number, dir: string = dayDir(day)): boolean {
	if (existsSync(dir)) return false;
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "solution.ts"), SOLUTION);
	writeFileSync(join(dir, "solution.test.ts"), testStub(String(day).padStart(2, "0")));
	writeFileSync(join(dir, "example.txt"), "");
	return true;
}

if (import.meta.main) {
	const day = parseDay(process.argv[2]);
	const label = String(day).padStart(2, "0");
	if (!scaffoldDay(day)) {
		console.error(`day${label} already exists`);
		process.exit(1);
	}
	console.log(`Created src/days/day${label}`);
	console.log(`Puzzle: https://adventofcode.com/${YEAR}/day/${day}`);
}
