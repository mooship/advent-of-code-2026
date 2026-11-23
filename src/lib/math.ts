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
