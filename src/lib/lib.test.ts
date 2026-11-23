import { describe, expect, it } from "vitest";
import { chunk, combinations, pairs, permutations, transpose, windows } from "./arrays.ts";
import { counter, DefaultMap, PriorityQueue } from "./collections.ts";
import { DIRS8, findAll, inBounds, manhattan, neighbors } from "./grid.ts";
import { digitGrid, grid, ints, lines, paragraphs } from "./input.ts";
import { gcd, lcm, mod, product, range, sum } from "./math.ts";
import { bfs, dijkstra } from "./search.ts";

describe("input", () => {
	it("splits lines and ignores CRLF and the trailing newline", () => {
		expect(lines("a\r\nb\n")).toEqual(["a", "b"]);
	});

	it("splits paragraphs", () => {
		expect(paragraphs("a\nb\n\nc\n")).toEqual(["a\nb", "c"]);
	});

	it("extracts signed integers", () => {
		expect(ints("x=12, y=-3 and 4")).toEqual([12, -3, 4]);
		expect(ints("none")).toEqual([]);
	});

	it("builds grids", () => {
		expect(grid("ab\ncd")).toEqual([
			["a", "b"],
			["c", "d"],
		]);
		expect(digitGrid("12\n34")).toEqual([
			[1, 2],
			[3, 4],
		]);
	});
});

describe("math", () => {
	it("sums and multiplies", () => {
		expect(sum([1, 2, 3])).toBe(6);
		expect(product([2, 3, 4])).toBe(24);
	});

	it("gcd and lcm", () => {
		expect(gcd(12, 18)).toBe(6);
		expect(lcm(4, 6)).toBe(12);
	});

	it("mod is never negative", () => {
		expect(mod(-1, 5)).toBe(4);
		expect(mod(7, 5)).toBe(2);
	});

	it("range is end-exclusive and supports negative steps", () => {
		expect(range(0, 3)).toEqual([0, 1, 2]);
		expect(range(3, 0, -1)).toEqual([3, 2, 1]);
	});
});

describe("grid", () => {
	const g = [
		["a", "b", "c"],
		["d", "e", "f"],
	];

	it("checks bounds", () => {
		expect(inBounds(g, 2, 1)).toBe(true);
		expect(inBounds(g, 3, 1)).toBe(false);
		expect(inBounds(g, 0, -1)).toBe(false);
	});

	it("yields only in-bounds neighbors", () => {
		expect([...neighbors(g, 0, 0)]).toEqual([
			[1, 0],
			[0, 1],
		]);
		expect([...neighbors(g, 1, 0, DIRS8)]).toHaveLength(5);
	});

	it("manhattan distance and findAll", () => {
		expect(manhattan([0, 0], [3, -4])).toBe(7);
		expect(findAll(g, "f")).toEqual([[2, 1]]);
	});
});

describe("collections", () => {
	it("priority queue pops in order", () => {
		const queue = new PriorityQueue<number>((a, b) => a - b);
		for (const n of [5, 1, 4, 2, 3, 0]) queue.push(n);
		const out: number[] = [];
		for (let n = queue.pop(); n !== undefined; n = queue.pop()) out.push(n);
		expect(out).toEqual([0, 1, 2, 3, 4, 5]);
		expect(queue.size).toBe(0);
	});

	it("default map creates missing values", () => {
		const map = new DefaultMap<string, number[]>(() => []);
		map.get("a").push(1);
		map.get("a").push(2);
		expect(map.get("a")).toEqual([1, 2]);
	});

	it("counts items", () => {
		expect(counter("aab")).toEqual(
			new Map([
				["a", 2],
				["b", 1],
			]),
		);
	});
});

describe("search", () => {
	it("bfs finds the shortest step count", () => {
		const next = (n: number) => [n + 1, n * 2];
		expect(
			bfs(
				1,
				next,
				(n) => n === 10,
				(n) => n,
			),
		).toBe(4);
		expect(
			bfs(
				1,
				(n) => (n < 3 ? [n + 1] : []),
				(n) => n === 99,
				(n) => n,
			),
		).toBe(-1);
	});

	it("dijkstra finds the cheapest cost", () => {
		const edges: Record<string, [string, number][]> = {
			a: [
				["b", 1],
				["c", 5],
			],
			b: [["c", 1]],
			c: [],
		};
		expect(
			dijkstra(
				"a",
				(n) => edges[n] ?? [],
				(n) => n === "c",
			),
		).toBe(2);
	});
});

describe("arrays", () => {
	it("chunks and windows", () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
		expect(windows([1, 2, 3, 4], 3)).toEqual([
			[1, 2, 3],
			[2, 3, 4],
		]);
	});

	it("transposes", () => {
		expect(
			transpose([
				[1, 2, 3],
				[4, 5, 6],
			]),
		).toEqual([
			[1, 4],
			[2, 5],
			[3, 6],
		]);
	});

	it("generates pairs, combinations and permutations", () => {
		expect([...pairs([1, 2, 3])]).toEqual([
			[1, 2],
			[1, 3],
			[2, 3],
		]);
		expect([...combinations([1, 2, 3, 4], 2)]).toHaveLength(6);
		expect([...permutations([1, 2, 3])]).toHaveLength(6);
	});
});
