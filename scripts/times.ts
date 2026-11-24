import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runParts } from "./day.ts";
import { dayDir } from "./paths.ts";

const LAST_DAY = 25;
const HEADERS = ["day", "part 1 ms", "part 2 ms", "total ms"] as const;

/** One day's milliseconds for part 1 and part 2. */
export interface DayTimes {
	day: number;
	parts: readonly [number, number];
}

/** A right-aligned table of milliseconds per part and per day, so slow days stand out. */
export function formatTimes(rows: readonly DayTimes[]): string {
	if (rows.length === 0) return "No day has an input.txt to time.";
	const cells = rows.map(({ day, parts: [first, second] }) => [
		String(day),
		first.toFixed(1),
		second.toFixed(1),
		(first + second).toFixed(1),
	]);
	const line = (row: readonly string[]) =>
		row.map((cell, i) => cell.padStart(HEADERS[i]?.length ?? 0)).join("  ");
	return [line(HEADERS), ...cells.map(line)].join("\n");
}

if (import.meta.main) {
	const rows: DayTimes[] = [];
	for (let day = 1; day <= LAST_DAY; day++) {
		const dir = dayDir(day);
		const inputFile = join(dir, "input.txt");
		if (!existsSync(inputFile)) continue;
		const results = await runParts(join(dir, "solution.ts"), readFileSync(inputFile, "utf8"));
		const [first, second] = results.map(({ ms }) => ms);
		rows.push({ day, parts: [first ?? 0, second ?? 0] });
	}
	console.log(formatTimes(rows));
}
