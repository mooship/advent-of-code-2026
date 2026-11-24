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

/**
 * Cheapest cost from start to a goal state, or -1 when unreachable. Costs must be non-negative.
 * Pass a `heuristic` (a consistent lower bound on the remaining cost) to run A*.
 */
export function dijkstra<T>(
	start: T,
	next: (state: T) => Iterable<readonly [state: T, cost: number]>,
	isGoal: (state: T) => boolean,
	key: (state: T) => unknown = defaultKey,
	heuristic: (state: T) => number = () => 0,
): number {
	const best = new Map<unknown, number>([[key(start), 0]]);
	const queue = new PriorityQueue<readonly [state: T, cost: number, priority: number]>(
		(a, b) => a[2] - b[2],
	);
	queue.push([start, 0, heuristic(start)]);
	for (let item = queue.pop(); item !== undefined; item = queue.pop()) {
		const [state, cost] = item;
		if (cost > (best.get(key(state)) ?? Infinity)) continue;
		if (isGoal(state)) return cost;
		for (const [n, step] of next(state)) {
			const total = cost + step;
			const k = key(n);
			if (total < (best.get(k) ?? Infinity)) {
				best.set(k, total);
				queue.push([n, total, total + heuristic(n)]);
			}
		}
	}
	return -1;
}

/**
 * The smallest integer in `low..high` (both included) for which `predicate` holds, assuming it is
 * false up to some point and true from there on; `undefined` when it never holds.
 */
export function binarySearch(
	low: number,
	high: number,
	predicate: (value: number) => boolean,
): number | undefined {
	let first = low;
	let last = high + 1;
	while (first < last) {
		const middle = first + Math.floor((last - first) / 2);
		if (predicate(middle)) last = middle;
		else first = middle + 1;
	}
	return first > high ? undefined : first;
}

/** The state after `steps` applications of `step`, jumping over any cycle so `steps` may be huge. */
export function iterate<T>(
	start: T,
	step: (state: T) => T,
	steps: number,
	key: (state: T) => unknown = defaultKey,
): T {
	const firstSeenAt = new Map<unknown, number>();
	const history: T[] = [];
	let state = start;
	for (let i = 0; i < steps; i++) {
		const seenAt = firstSeenAt.get(key(state));
		if (seenAt !== undefined) {
			const cycleLength = i - seenAt;
			return history[seenAt + ((steps - seenAt) % cycleLength)] as T;
		}
		firstSeenAt.set(key(state), i);
		history.push(state);
		state = step(state);
	}
	return state;
}

/** Order where every node comes after its dependencies. Throws when there is a cycle. */
export function topologicalSort<T>(dependencies: ReadonlyMap<T, readonly T[]>): T[] {
	const sorted: T[] = [];
	const state = new Map<T, "visiting" | "done">();
	const stack: [node: T, expanded: boolean][] = [...dependencies.keys()].map((n) => [n, false]);
	for (let item = stack.pop(); item !== undefined; item = stack.pop()) {
		const [node, expanded] = item;
		if (expanded) {
			state.set(node, "done");
			sorted.push(node);
		} else if (state.get(node) === "done") {
		} else if (state.get(node) === "visiting") {
			throw new Error("dependency cycle");
		} else {
			state.set(node, "visiting");
			stack.push([node, true]);
			for (const dependency of dependencies.get(node) ?? []) stack.push([dependency, false]);
		}
	}
	return sorted;
}
