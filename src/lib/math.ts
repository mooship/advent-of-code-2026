export const sum = (values: Iterable<number>): number => {
	let total = 0;
	for (const value of values) total += value;
	return total;
};

export const product = (values: Iterable<number>): number => {
	let total = 1;
	for (const value of values) total *= value;
	return total;
};

export const gcd = (a: number, b: number): number => {
	while (b !== 0) [a, b] = [b, a % b];
	return Math.abs(a);
};

export const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);

// JS `%` keeps the sign of the dividend; this always returns 0 <= result < m.
export const mod = (n: number, m: number): number => ((n % m) + m) % m;

// End-exclusive, like Python's range.
export const range = (start: number, end: number, step = 1): number[] => {
	const out: number[] = [];
	for (let i = start; step > 0 ? i < end : i > end; i += step) out.push(i);
	return out;
};

/** Inclusive on both ends. */
export type Range = readonly [start: number, end: number];

/** Sorted, non-overlapping ranges; ranges that touch (end + 1 === next start) are joined. */
export const mergeRanges = (ranges: readonly Range[]): Range[] => {
	const merged: [number, number][] = [];
	for (const [start, end] of [...ranges].sort((a, b) => a[0] - b[0])) {
		const last = merged.at(-1);
		if (last && start <= last[1] + 1) last[1] = Math.max(last[1], end);
		else merged.push([start, end]);
	}
	return merged;
};

export type Congruence = { remainder: bigint; modulus: bigint };

const modBig = (n: bigint, m: bigint): bigint => ((n % m) + m) % m;

const extendedGcd = (a: bigint, b: bigint): { gcd: bigint; x: bigint } => {
	let [oldR, r] = [a, b];
	let [oldX, x] = [1n, 0n];
	while (r !== 0n) {
		const quotient = oldR / r;
		[oldR, r] = [r, oldR - quotient * r];
		[oldX, x] = [x, oldX - quotient * x];
	}
	return { gcd: oldR, x: oldX };
};

/** Smallest non-negative n with n % modulus === remainder for every congruence. Throws if none exists. */
export const crt = (congruences: readonly Congruence[]): bigint => {
	let [remainder, modulus] = [0n, 1n];
	for (const next of congruences) {
		const { gcd, x } = extendedGcd(modulus, next.modulus);
		const difference = next.remainder - remainder;
		if (difference % gcd !== 0n) throw new Error("congruences have no common solution");
		const nextModulus = next.modulus / gcd;
		remainder += modulus * modBig((difference / gcd) * x, nextModulus);
		modulus *= nextModulus;
		remainder = modBig(remainder, modulus);
	}
	return remainder;
};
