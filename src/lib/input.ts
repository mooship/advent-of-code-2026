/** Splits on LF or CRLF, ignoring trailing whitespace at the end of the input. */
export const lines = (input: string): string[] => input.trimEnd().split(/\r?\n/);

/** Splits on blank lines into blocks, each keeping its inner line breaks. */
export const paragraphs = (input: string): string[] => input.trim().split(/\r?\n\r?\n/);

/** Every integer in `text`. Treats "-" as a minus sign, so "3-5" gives [3, -5]; split ranges on "-" first. */
export const ints = (text: string): number[] => (text.match(/-?\d+/g) ?? []).map(Number);

/** A character grid indexed `[y][x]`. */
export const grid = (input: string): string[][] => lines(input).map((line) => [...line]);

/** A grid of single digits indexed `[y][x]`. */
export const digitGrid = (input: string): number[][] =>
	lines(input).map((line) => [...line].map(Number));
