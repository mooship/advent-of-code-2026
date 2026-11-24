/** A grid position; `x` grows rightwards and `y` grows downwards. */
export type Point = readonly [x: number, y: number];

/** Orthogonal steps as `[dx, dy]`: up, right, down, left. */
export const DIRS4: readonly Point[] = [
	[0, -1],
	[1, 0],
	[0, 1],
	[-1, 0],
];

/** All eight steps as `[dx, dy]`, clockwise from up. */
export const DIRS8: readonly Point[] = [
	[0, -1],
	[1, -1],
	[1, 0],
	[1, 1],
	[0, 1],
	[-1, 1],
	[-1, 0],
	[-1, -1],
];

/** A string key for using a position in a `Map` or `Set`. */
export const pointKey = (x: number, y: number): string => `${x},${y}`;

/** Whether `(x, y)` lies inside `g`; rows may differ in length. */
export const inBounds = (g: readonly (readonly unknown[])[], x: number, y: number): boolean =>
	y >= 0 && y < g.length && x >= 0 && x < (g[y]?.length ?? 0);

/** The in-bounds positions one step from `(x, y)` along `dirs` (orthogonal by default). */
export function* neighbors(
	g: readonly (readonly unknown[])[],
	x: number,
	y: number,
	dirs: readonly Point[] = DIRS4,
): Generator<Point> {
	for (const [dx, dy] of dirs) {
		if (inBounds(g, x + dx, y + dy)) yield [x + dx, y + dy];
	}
}

/** Taxicab distance: `|dx| + |dy|`. */
export const manhattan = (a: Point, b: Point): number =>
	Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

/** A position in 3D space as `[x, y, z]`. */
export type Point3 = readonly [x: number, y: number, z: number];

/** The six face-adjacent steps as `[dx, dy, dz]`. */
export const DIRS6: readonly Point3[] = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1],
];

/** Taxicab distance in 3D: `|dx| + |dy| + |dz|`. */
export const manhattan3 = (a: Point3, b: Point3): number =>
	Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

/**
 * Running totals of `values` indexed `[y][x]`, padded with a zero row and column so
 * `prefix[y][x]` is the sum of everything above and left of `(x, y)`. Feed it to `rectSum`.
 */
export const prefixSums = (values: readonly (readonly number[])[]): number[][] => {
	const width = values[0]?.length ?? 0;
	const prefix = [new Array<number>(width + 1).fill(0)];
	for (const [y, row] of values.entries()) {
		const above = prefix[y] as number[];
		let rowTotal = 0;
		prefix.push(
			[0, ...row].map((_, x) => {
				rowTotal += row[x - 1] ?? 0;
				return (above[x] as number) + rowTotal;
			}),
		);
	}
	return prefix;
};

/** The sum of the cells from `(x0, y0)` to `(x1, y1)`, both corners included, from `prefixSums`. */
export const rectSum = (
	prefix: readonly (readonly number[])[],
	x0: number,
	y0: number,
	x1: number,
	y1: number,
): number => {
	const at = (x: number, y: number) => prefix[y]?.[x] ?? 0;
	return at(x1 + 1, y1 + 1) - at(x0, y1 + 1) - at(x1 + 1, y0) + at(x0, y0);
};

/** Every position in `g` whose cell equals `char`, in row-major order. */
export const findAll = (g: readonly (readonly string[])[], char: string): Point[] => {
	const found: Point[] = [];
	for (const [y, row] of g.entries()) {
		for (const [x, cell] of row.entries()) {
			if (cell === char) found.push([x, y]);
		}
	}
	return found;
};
