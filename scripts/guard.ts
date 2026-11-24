import { readFileSync } from "node:fs";

/** The fields of a Claude Code `PreToolUse` hook payload that the guard reads. */
export interface HookInput {
	tool_name?: string;
	tool_input?: { command?: string; file_path?: string };
}

/** The secret file, the session variable and the site that only the fetch and submit scripts may touch. */
const SENSITIVE = /\.env(?![A-Za-z])|AOC_SESSION|adventofcode\.com/i;

/** `npm run fetch|submit -- ...` with no shell syntax that could chain another command. */
const OWNING_SCRIPT = /^npm run (?:fetch|submit)(?: -- [^;&|`$()<>\\\n]*)?$/;

/** Why the call must be blocked, or `undefined` when it may go to the normal permission flow. */
export const blockReason = (input: HookInput): string | undefined => {
	const target = input.tool_input?.command ?? input.tool_input?.file_path;
	if (target === undefined || !SENSITIVE.test(target)) return undefined;
	if (OWNING_SCRIPT.test(target)) return undefined;
	return "Blocked: .env, AOC_SESSION and adventofcode.com are reachable only through `npm run fetch` and `npm run submit`.";
};

if (import.meta.main) {
	let input: HookInput;
	try {
		input = JSON.parse(readFileSync(0, "utf8")) as HookInput;
	} catch {
		console.error("Blocked: the guard could not read its hook input.");
		process.exit(2);
	}
	const reason = blockReason(input);
	if (reason !== undefined) {
		console.error(reason);
		process.exit(2);
	}
}
