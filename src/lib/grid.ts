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
