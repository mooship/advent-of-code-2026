import { execFileSync, spawnSync } from "node:child_process";
import { type FetchResult, fetchFromEnv } from "./fetch.ts";
import { scaffoldDay } from "./new.ts";
import { parseDay } from "./paths.ts";

/** The git, scaffolding and fetching that `startDay` drives, replaceable in tests. */
export interface StartDeps {
	git: (args: readonly string[]) => void;
	branchExists: (name: string) => boolean;
	scaffold: (day: number) => boolean;
	fetchInput: (day: number) => Promise<FetchResult>;
}

const realDeps: StartDeps = {
	git: (args) => {
		execFileSync("git", args, { stdio: "inherit" });
	},
	branchExists: (name) =>
		spawnSync("git", ["rev-parse", "--verify", "--quiet", `refs/heads/${name}`]).status === 0,
	scaffold: (day) => scaffoldDay(day),
	fetchInput: (day) => fetchFromEnv(day, { wait: true, force: false }),
};

/** Prepares a day: fresh `main`, the `day-NN` branch, the scaffold, then the input (waiting for unlock). */
export async function startDay(day: number, deps: StartDeps = realDeps): Promise<FetchResult> {
	const branch = `day-${String(day).padStart(2, "0")}`;
	deps.git(["switch", "main"]);
	deps.git(["pull", "--ff-only"]);
	deps.git(deps.branchExists(branch) ? ["switch", branch] : ["switch", "-c", branch]);
	deps.scaffold(day);
	return deps.fetchInput(day);
}

if (import.meta.main) {
	const result = await startDay(parseDay(process.argv[2]));
	if (result.outcome === "failed") {
		console.error(result.message);
		process.exit(1);
	}
	console.log(result.message);
}
