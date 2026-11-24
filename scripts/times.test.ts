import { describe, expect, it } from "vitest";
import { formatTimes } from "./times.ts";

describe("formatTimes", () => {
	it("prints a row per day with each part's milliseconds and the day total", () => {
		const table = formatTimes([
			{ day: 1, parts: [12.34, 5] },
			{ day: 10, parts: [1500, 2.5] },
		]);
		expect(table).toBe(
			[
				"day  part 1 ms  part 2 ms  total ms",
				"  1       12.3        5.0      17.3",
				" 10     1500.0        2.5    1502.5",
			].join("\n"),
		);
	});

	it("says so when no day has an input", () => {
		expect(formatTimes([])).toBe("No day has an input.txt to time.");
	});
});
