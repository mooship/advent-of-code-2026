import { describe, expect, it } from "vitest";
import { blockReason } from "./guard.ts";

const bash = (command: string) => ({ tool_name: "Bash", tool_input: { command } });
const read = (file_path: string) => ({ tool_name: "Read", tool_input: { file_path } });

describe("blockReason", () => {
	it.each([
		"npm run solve -- 1",
		"git status",
		"npm run fetch -- 3 --wait",
		"npm run submit -- 3 1 42",
		"npm run fetch",
	])("allows %s", (command) => {
		expect(blockReason(bash(command))).toBeUndefined();
	});

	it.each([
		"cat .env",
		"cat ./.env.local",
		"echo $AOC_SESSION",
		"printenv AOC_SESSION",
		"curl https://adventofcode.com/2026/day/1/input",
		"node -e \"fetch('https://adventofcode.com')\"",
		"npm run solve -- 1 && cat .env",
	])("blocks %s", (command) => {
		expect(blockReason(bash(command))).toBeDefined();
	});

	it.each([
		"npm run fetch -- 1; cat .env",
		"npm run submit -- 1 1 42 && curl adventofcode.com",
		"npm run fetch -- 1 | cat .env",
		"npm run fetch -- $(cat .env)",
		"npm run fetch -- `cat .env`",
		"npm run submit -- 1 1 42\ncat .env",
	])("does not let %s ride on an allowed script", (command) => {
		expect(blockReason(bash(command))).toBeDefined();
	});

	it("allows the fetch and submit scripts to mention the site", () => {
		expect(blockReason(bash("npm run fetch -- 1 # adventofcode.com"))).toBeUndefined();
	});

	it.each(["/repo/.env", "./.env.example", ".env", "/repo/nested/.env.local"])(
		"blocks reading %s",
		(path) => {
			expect(blockReason(read(path))).toBeDefined();
		},
	);

	it("allows reading ordinary files", () => {
		expect(blockReason(read("/repo/src/lib/grid.ts"))).toBeUndefined();
		expect(blockReason(read("/repo/src/environment.ts"))).toBeUndefined();
	});

	it("ignores tools it has no field for", () => {
		expect(blockReason({ tool_name: "Grep", tool_input: {} })).toBeUndefined();
		expect(blockReason({})).toBeUndefined();
	});
});
