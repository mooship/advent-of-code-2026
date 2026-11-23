import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseAnswerResponse, type Verdict } from "./answer-response.ts";
import { loadEnv, parseDay, YEAR } from "./paths.ts";

type Attempt = {
	answer: string;
	kind: Verdict["kind"];
	at: string;
	lockedUntil?: string;
};

const LOG_FILE = join(import.meta.dirname, "..", ".submissions.json");

const readLog = (): Record<string, Attempt[]> =>
	existsSync(LOG_FILE) ? JSON.parse(readFileSync(LOG_FILE, "utf8")) : {};

function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

const formatWait = (seconds: number): string =>
	seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;

loadEnv();

const [dayArg, partArg, ...answerWords] = process.argv.slice(2);
const day = parseDay(dayArg);
const part = Number(partArg);
const answer = answerWords.join(" ").trim();

if (part !== 1 && part !== 2) fail("Usage: npm run submit -- <day> <1|2> <answer>");
if (!answer) fail("Usage: npm run submit -- <day> <1|2> <answer>");

const session = process.env.AOC_SESSION;
if (!session) fail("AOC_SESSION is not set. Copy .env.example to .env and fill it in.");

const log = readLog();
const key = `${day}-${part}`;
const attempts = log[key] ?? [];

if (attempts.some((attempt) => attempt.kind === "correct")) {
	fail(`Day ${day} part ${part} is already accepted.`);
}

const repeated = attempts.find((attempt) => attempt.kind === "wrong" && attempt.answer === answer);
if (repeated) fail(`${answer} was already rejected for day ${day} part ${part}. Not resubmitting.`);

const lockedUntil = attempts.at(-1)?.lockedUntil;
if (lockedUntil && Date.parse(lockedUntil) > Date.now()) {
	const remaining = Math.ceil((Date.parse(lockedUntil) - Date.now()) / 1000);
	fail(`Locked out for another ${formatWait(remaining)}.`);
}

const response = await fetch(`https://adventofcode.com/${YEAR}/day/${day}/answer`, {
	method: "POST",
	headers: {
		cookie: `session=${session}`,
		"user-agent": process.env.AOC_USER_AGENT || "aoc-input-fetcher",
		"content-type": "application/x-www-form-urlencoded",
	},
	body: new URLSearchParams({ level: String(part), answer }),
});

if (response.status === 400 || response.status === 500) {
	fail("AoC rejected the session cookie; it has probably expired. Refresh AOC_SESSION.");
}
if (!response.ok) fail(`Submit failed: HTTP ${response.status}`);

const verdict = parseAnswerResponse(await response.text());
const waitSeconds =
	verdict.kind === "wrong" || verdict.kind === "too-soon" ? verdict.waitSeconds : undefined;

if (verdict.kind !== "unknown" && verdict.kind !== "not-open") {
	attempts.push({
		answer,
		kind: verdict.kind,
		at: new Date().toISOString(),
		lockedUntil: waitSeconds ? new Date(Date.now() + waitSeconds * 1000).toISOString() : undefined,
	});
	log[key] = attempts;
	writeFileSync(LOG_FILE, `${JSON.stringify(log, null, "\t")}\n`);
}

switch (verdict.kind) {
	case "correct":
		console.log(`Correct. Day ${day} part ${part} accepted.`);
		break;
	case "wrong": {
		const hint = verdict.hint ? ` (${verdict.hint})` : "";
		const wait = verdict.waitSeconds ? ` Locked out for ${formatWait(verdict.waitSeconds)}.` : "";
		fail(`Wrong${hint}.${wait}`);
		break;
	}
	case "too-soon":
		fail(`Too soon. Wait ${formatWait(verdict.waitSeconds)}. Nothing was submitted.`);
		break;
	case "not-open":
		fail("AoC says this is not the open level. Already completed, or part 2 is not unlocked.");
		break;
	case "unknown":
		fail(`Unrecognised response, not logged: ${verdict.text}`);
}
