import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { dayDir, loadEnv, parseDay, YEAR } from "./paths.ts";

loadEnv();

const args = process.argv.slice(2);
const day = parseDay(args[0]);
const force = args.includes("--force");
const wait = args.includes("--wait");

const session = process.env.AOC_SESSION;
if (!session) {
	console.error("AOC_SESSION is not set. Copy .env.example to .env and fill it in.");
	process.exit(1);
}

const dir = dayDir(day);
const file = join(dir, "input.txt");
if (existsSync(file) && !force) {
	console.log(`${file} already exists (use --force to overwrite)`);
	process.exit(0);
}

// Puzzles unlock at 00:00 EST (05:00 UTC, 07:00 SAST).
const unlock = Date.UTC(YEAR, 11, day, 5, 0, 0);
if (wait) {
	const remaining = unlock - Date.now();
	if (remaining > 0) {
		console.log(`Waiting ${Math.ceil(remaining / 1000)}s for the puzzle to unlock...`);
		await sleep(remaining);
	}
} else if (Date.now() < unlock) {
	console.error("This puzzle has not unlocked yet. Use --wait to fetch the moment it does.");
	process.exit(1);
}

// AoC asks automated clients to throttle, so retries are few and one second apart.
const attempts = wait ? 5 : 1;
for (let attempt = 1; attempt <= attempts; attempt++) {
	const response = await fetch(`https://adventofcode.com/${YEAR}/day/${day}/input`, {
		headers: {
			cookie: `session=${session}`,
			"user-agent": process.env.AOC_USER_AGENT || "aoc-input-fetcher",
		},
	});

	if (response.ok) {
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, await response.text());
		console.log(`Saved ${file}`);
		process.exit(0);
	}

	if (response.status === 400 || response.status === 500) {
		console.error("AoC rejected the session cookie; it has probably expired. Refresh AOC_SESSION.");
		process.exit(1);
	}

	if (response.status === 404 && attempt < attempts) {
		await sleep(1000);
		continue;
	}

	console.error(`Fetch failed: HTTP ${response.status}`);
	process.exit(1);
}
