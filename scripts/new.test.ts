import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scaffoldDay } from "./new.ts";

describe("scaffoldDay", () => {
	let root: string;
	let dir: string;

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "aoc-new-"));
		dir = join(root, "day07");
	});

	afterEach(() => {
		rmSync(root, { recursive: true });
	});

	it("creates the solution, its test and an empty example", () => {
		expect(scaffoldDay(7, dir)).toBe(true);
		expect(readFileSync(join(dir, "solution.ts"), "utf8")).toContain("export function part1");
		expect(readFileSync(join(dir, "solution.test.ts"), "utf8")).toContain('describe("day 07"');
		expect(readFileSync(join(dir, "example.txt"), "utf8")).toBe("");
	});

	it("leaves an existing day untouched", () => {
		scaffoldDay(7, dir);
		expect(scaffoldDay(7, dir)).toBe(false);
		expect(existsSync(join(dir, "solution.ts"))).toBe(true);
	});
});
