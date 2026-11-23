export const lines = (input: string): string[] => input.trimEnd().split(/\r?\n/);

export const paragraphs = (input: string): string[] => input.trim().split(/\r?\n\r?\n/);

// Treats "-" as a minus sign, so "3-5" gives [3, -5]. Split ranges on "-" first.
export const ints = (text: string): number[] => (text.match(/-?\d+/g) ?? []).map(Number);

export const grid = (input: string): string[][] => lines(input).map((line) => [...line]);

export const digitGrid = (input: string): number[][] =>
	lines(input).map((line) => [...line].map(Number));
