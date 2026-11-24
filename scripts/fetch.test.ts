import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type FetchDeps, fetchInput } from "./fetch.ts";

const DAY = 3;
const UNLOCK = Date.UTC(2026, 11, DAY, 5, 0, 0);

/** Fake network and clock: answers come from `statuses` in order, and `sleep` only records. */
function fakeDeps(statuses: number[], now = UNLOCK) {
	const sleeps: number[] = [];
	const requests: { url: string; cookie: string | undefined }[] = [];
	const deps: FetchDeps = {
		fetch: async (url, init) => {
			requests.push({
				url: String(url),
				cookie: (init?.headers as Record<string, string> | undefined)?.cookie,
			});
			const status = statuses.shift() ?? 500;
			return new Response(status === 200 ? "puzzle input" : "", { status });
		},
		now: () => now,
		sleep: async (ms) => {
			sleeps.push(ms);
		},
		log: () => {},
	};
	return { deps, sleeps, requests };
}

describe("fetchInput", () => {
	let dir: string;
	const options = (overrides: object = {}) => ({
		day: DAY,
		dir,
		session: "secret",
		userAgent: "test-agent",
		wait: false,
		force: false,
		...overrides,
	});

	beforeEach(() => {
		dir = join(mkdtempSync(join(tmpdir(), "aoc-fetch-")), "day03");
	});

	afterEach(() => {
		rmSync(join(dir, ".."), { recursive: true });
	});

	it("saves the input, sending the session cookie to the day's input URL", async () => {
		const { deps, requests } = fakeDeps([200]);
		const result = await fetchInput(options(), deps);
		expect(result.outcome).toBe("saved");
		expect(readFileSync(join(dir, "input.txt"), "utf8")).toBe("puzzle input");
		expect(requests).toEqual([
			{ url: "https://adventofcode.com/2026/day/3/input", cookie: "session=secret" },
		]);
	});

	it("leaves an existing input alone without making a request", async () => {
		const { deps, requests } = fakeDeps([200]);
		await fetchInput(options(), deps);
		const again = await fetchInput(options(), deps);
		expect(again.outcome).toBe("exists");
		expect(requests).toHaveLength(1);
	});

	it("overwrites an existing input when forced", async () => {
		const { deps } = fakeDeps([200, 200]);
		await fetchInput(options(), deps);
		writeFileSync(join(dir, "input.txt"), "old");
		await fetchInput(options({ force: true }), deps);
		expect(readFileSync(join(dir, "input.txt"), "utf8")).toBe("puzzle input");
	});

	it("refuses before unlock unless asked to wait", async () => {
		const { deps, requests } = fakeDeps([200], UNLOCK - 1000);
		const result = await fetchInput(options(), deps);
		expect(result.outcome).toBe("failed");
		expect(requests).toHaveLength(0);
		expect(existsSync(join(dir, "input.txt"))).toBe(false);
	});

	it("sleeps until unlock when waiting, then retries a 404 one second apart", async () => {
		const { deps, sleeps } = fakeDeps([404, 404, 200], UNLOCK - 5000);
		const result = await fetchInput(options({ wait: true }), deps);
		expect(result.outcome).toBe("saved");
		expect(sleeps).toEqual([5000, 1000, 1000]);
	});

	it("gives up after five attempts when waiting", async () => {
		const { deps, requests } = fakeDeps([404, 404, 404, 404, 404, 200]);
		const result = await fetchInput(options({ wait: true }), deps);
		expect(result.outcome).toBe("failed");
		expect(requests).toHaveLength(5);
	});

	it("does not retry a 404 when not waiting", async () => {
		const { deps, requests } = fakeDeps([404, 200]);
		const result = await fetchInput(options(), deps);
		expect(result.outcome).toBe("failed");
		expect(requests).toHaveLength(1);
	});

	it("reports an expired session and stops", async () => {
		const { deps, requests } = fakeDeps([400, 200]);
		const result = await fetchInput(options({ wait: true }), deps);
		expect(result.outcome).toBe("failed");
		expect(result.message).toContain("session");
		expect(requests).toHaveLength(1);
	});

	it("never puts the session in a message", async () => {
		const { deps } = fakeDeps([500]);
		const result = await fetchInput(options(), deps);
		expect(result.message).not.toContain("secret");
	});
});
