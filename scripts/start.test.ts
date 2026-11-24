import { describe, expect, it } from "vitest";
import type { FetchResult } from "./fetch.ts";
import { type StartDeps, startDay } from "./start.ts";

const saved: FetchResult = { outcome: "saved", message: "Saved input" };

/** Records every step in order; `existing` names the local branches. */
function fakeDeps(existing: string[] = [], fetched: FetchResult = saved) {
	const steps: string[] = [];
	const deps: StartDeps = {
		git: (args) => {
			steps.push(`git ${args.join(" ")}`);
		},
		branchExists: (name) => existing.includes(name),
		scaffold: (day) => {
			steps.push(`scaffold ${day}`);
			return true;
		},
		fetchInput: async (day) => {
			steps.push(`fetch ${day}`);
			return fetched;
		},
	};
	return { deps, steps };
}

describe("startDay", () => {
	it("updates main, branches, scaffolds, then fetches, in that order", async () => {
		const { deps, steps } = fakeDeps();
		await startDay(4, deps);
		expect(steps).toEqual([
			"git switch main",
			"git pull --ff-only",
			"git switch -c day-04",
			"scaffold 4",
			"fetch 4",
		]);
	});

	it("switches to a day branch that already exists", async () => {
		const { deps, steps } = fakeDeps(["day-12"]);
		await startDay(12, deps);
		expect(steps).toContain("git switch day-12");
		expect(steps).not.toContain("git switch -c day-12");
	});

	it("returns the fetch result", async () => {
		const failed: FetchResult = { outcome: "failed", message: "not yet" };
		const { deps } = fakeDeps([], failed);
		expect(await startDay(4, deps)).toBe(failed);
	});
});
