import { PriorityQueue } from "./collections.ts";

// Both searches dedupe states with `key`; pass your own when String(state) is not unique or is slow.
const defaultKey = <T>(state: T): string => String(state);

/** Fewest steps from start to a goal state, or -1 when unreachable. */
export function bfs<T>(
	start: T,
	next: (state: T) => Iterable<T>,
	isGoal: (state: T) => boolean,
	key: (state: T) => unknown = defaultKey,
): number {
	const seen = new Set<unknown>([key(start)]);
	let frontier = [start];
	for (let steps = 0; frontier.length > 0; steps++) {
		const following: T[] = [];
		for (const state of frontier) {
			if (isGoal(state)) return steps;
			for (const n of next(state)) {
				const k = key(n);
				if (!seen.has(k)) {
					seen.add(k);
					following.push(n);
				}
			}
		}
		frontier = following;
	}
	return -1;
}

/** Cheapest cost from start to a goal state, or -1 when unreachable. Costs must be non-negative. */
export function dijkstra<T>(
	start: T,
	next: (state: T) => Iterable<readonly [state: T, cost: number]>,
	isGoal: (state: T) => boolean,
	key: (state: T) => unknown = defaultKey,
): number {
	const best = new Map<unknown, number>([[key(start), 0]]);
	const queue = new PriorityQueue<readonly [T, number]>((a, b) => a[1] - b[1]);
	queue.push([start, 0]);
	for (let item = queue.pop(); item !== undefined; item = queue.pop()) {
		const [state, cost] = item;
		if (cost > (best.get(key(state)) ?? Infinity)) continue;
		if (isGoal(state)) return cost;
		for (const [n, step] of next(state)) {
			const total = cost + step;
			const k = key(n);
			if (total < (best.get(k) ?? Infinity)) {
				best.set(k, total);
				queue.push([n, total]);
			}
		}
	}
	return -1;
}
