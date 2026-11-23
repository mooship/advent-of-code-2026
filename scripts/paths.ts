import { join } from "node:path";

export const YEAR = 2026;

export function parseDay(arg: string | undefined): number {
	const day = Number(arg);
	if (!Number.isInteger(day) || day < 1 || day > 25) {
		console.error("Usage: pass a day number from 1 to 25");
		process.exit(1);
	}
	return day;
}

export const dayDir = (day: number): string =>
	join(import.meta.dirname, "..", "src", "days", `day${String(day).padStart(2, "0")}`);

export function loadEnv(): void {
	try {
		process.loadEnvFile(join(import.meta.dirname, "..", ".env"));
	} catch {
		// .env is optional; only fetch needs it
	}
}
