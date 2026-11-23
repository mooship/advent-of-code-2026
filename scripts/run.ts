import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Solution } from "#lib/types.ts";
import { dayDir, parseDay } from "./paths.ts";

const args = process.argv.slice(2);
const day = parseDay(args[0]);
const useExample = args.includes("--example");
const partFlag = args.indexOf("--part");
const onlyPart = partFlag === -1 ? undefined : Number(args[partFlag + 1]);

const dir = dayDir(day);
const inputFile = join(dir, useExample ? "example.txt" : "input.txt");

if (!existsSync(inputFile)) {
	const hint = useExample ? "" : ` (run: npm run fetch -- ${day})`;
	console.error(`Missing ${inputFile}${hint}`);
	process.exit(1);
}

const input = readFileSync(inputFile, "utf8");
const solution: { part1: Solution; part2: Solution } = await import(
	pathToFileURL(join(dir, "solution.ts")).href
);

for (const part of [1, 2] as const) {
	if (onlyPart !== undefined && onlyPart !== part) continue;
	const start = performance.now();
	const answer = await solution[part === 1 ? "part1" : "part2"](input);
	const ms = (performance.now() - start).toFixed(1);
	console.log(`part ${part}: ${answer}  (${ms} ms)`);
}
