/** Splits `items` into consecutive slices of `size`; the last slice may be shorter. */
export const chunk = <T>(items: readonly T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
	return out;
};

/** Every run of `size` adjacent items, sliding one at a time. Empty when `size` exceeds the length. */
export const windows = <T>(items: readonly T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i + size <= items.length; i++) out.push(items.slice(i, i + size));
	return out;
};

/** Swaps rows and columns: `result[x][y] === rows[y][x]`. Assumes rectangular input. */
export const transpose = <T>(rows: readonly (readonly T[])[]): T[][] =>
	(rows[0] ?? []).map((_, x) => rows.map((row) => row[x] as T));

/** Every unordered pair of distinct positions, in index order. */
export function* pairs<T>(items: readonly T[]): Generator<[T, T]> {
	for (let i = 0; i < items.length; i++) {
		for (let j = i + 1; j < items.length; j++) yield [items[i] as T, items[j] as T];
	}
}

/** Every `size`-item selection from `items` (order ignored), in index order. `start` is internal recursion state. */
export function* combinations<T>(items: readonly T[], size: number, start = 0): Generator<T[]> {
	if (size === 0) {
		yield [];
		return;
	}
	for (let i = start; i <= items.length - size; i++) {
		for (const rest of combinations(items, size - 1, i + 1)) yield [items[i] as T, ...rest];
	}
}

/** Every ordering of `items`. Grows factorially, so keep inputs small. */
export function* permutations<T>(items: readonly T[]): Generator<T[]> {
	if (items.length <= 1) {
		yield [...items];
		return;
	}
	for (const [i, item] of items.entries()) {
		const rest = [...items.slice(0, i), ...items.slice(i + 1)];
		for (const perm of permutations(rest)) yield [item, ...perm];
	}
}
