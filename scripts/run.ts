import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runParts } from "./day.ts";
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
const part = onlyPart === 1 || onlyPart === 2 ? onlyPart : undefined;
for (const result of await runParts(join(dir, "solution.ts"), input, part)) {
	console.log(`part ${result.part}: ${result.answer}  (${result.ms.toFixed(1)} ms)`);
}
