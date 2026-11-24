import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { dayDir, loadEnv, parseDay, YEAR } from "./paths.ts";

/** Puzzles unlock at 00:00 EST (05:00 UTC, 07:00 SAST). */
const UNLOCK_HOUR_UTC = 5;
const DECEMBER = 11;
const WAIT_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1000;
const MS_PER_SECOND = 1000;
const DEFAULT_USER_AGENT = "aoc-input-fetcher";

/** The network, clock and output that `fetchInput` uses, replaceable in tests. */
export interface FetchDeps {
	fetch: (url: string | URL, init?: RequestInit) => Promise<Response>;
	now: () => number;
	sleep: (ms: number) => Promise<void>;
	log: (message: string) => void;
}

const realDeps: FetchDeps = {
	fetch: (url, init) => fetch(url, init),
	now: Date.now,
	sleep: (ms) => sleep(ms),
	log: console.log,
};

/** What to fetch and where to put it. `wait` sleeps until unlock and retries a 404; `force` overwrites. */
export interface FetchOptions {
	day: number;
	dir: string;
	session: string;
	userAgent: string;
	wait: boolean;
	force: boolean;
}

/** How a fetch ended; the message never contains the session. */
export interface FetchResult {
	outcome: "saved" | "exists" | "failed";
	message: string;
}

/** Downloads a day's input to `input.txt` in `options.dir`, throttled as Advent of Code asks. */
export async function fetchInput(
	options: FetchOptions,
	deps: FetchDeps = realDeps,
): Promise<FetchResult> {
	const { day, dir, session, userAgent, wait, force } = options;
	const file = join(dir, "input.txt");
	if (existsSync(file) && !force) {
		return { outcome: "exists", message: `${file} already exists (use --force to overwrite)` };
	}

	const unlock = Date.UTC(YEAR, DECEMBER, day, UNLOCK_HOUR_UTC, 0, 0);
	const remaining = unlock - deps.now();
	if (remaining > 0) {
		if (!wait) {
			return {
				outcome: "failed",
				message: "This puzzle has not unlocked yet. Use --wait to fetch the moment it does.",
			};
		}
		deps.log(`Waiting ${Math.ceil(remaining / MS_PER_SECOND)}s for the puzzle to unlock...`);
		await deps.sleep(remaining);
	}

	const attempts = wait ? WAIT_ATTEMPTS : 1;
	let status = 0;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		const response = await deps.fetch(`https://adventofcode.com/${YEAR}/day/${day}/input`, {
			headers: { cookie: `session=${session}`, "user-agent": userAgent },
		});
		status = response.status;
		if (response.ok) {
			mkdirSync(dir, { recursive: true });
			writeFileSync(file, await response.text());
			return { outcome: "saved", message: `Saved ${file}` };
		}
		if (status === 400 || status === 500) {
			return {
				outcome: "failed",
				message: "AoC rejected the session cookie; it has probably expired. Refresh AOC_SESSION.",
			};
		}
		if (status !== 404) break;
		if (attempt < attempts) await deps.sleep(RETRY_DELAY_MS);
	}
	return { outcome: "failed", message: `Fetch failed: HTTP ${status}` };
}

/** Fetches a day's input using `AOC_SESSION` and `AOC_USER_AGENT` from `.env`. */
export async function fetchFromEnv(
	day: number,
	flags: { wait: boolean; force: boolean },
): Promise<FetchResult> {
	loadEnv();
	const session = process.env.AOC_SESSION;
	if (!session) {
		return {
			outcome: "failed",
			message: "AOC_SESSION is not set. Copy .env.example to .env and fill it in.",
		};
	}
	const userAgent = process.env.AOC_USER_AGENT || DEFAULT_USER_AGENT;
	return fetchInput({ day, dir: dayDir(day), session, userAgent, ...flags });
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const result = await fetchFromEnv(parseDay(args[0]), {
		wait: args.includes("--wait"),
		force: args.includes("--force"),
	});
	if (result.outcome === "failed") {
		console.error(result.message);
		process.exit(1);
	}
	console.log(result.message);
}
