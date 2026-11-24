export class PriorityQueue<T> {
	private heap: T[] = [];
	private compare: (a: T, b: T) => number;

	// Lowest compare() result pops first.
	constructor(compare: (a: T, b: T) => number) {
		this.compare = compare;
	}

	get size(): number {
		return this.heap.length;
	}

	push(item: T): void {
		const heap = this.heap;
		heap.push(item);
		let i = heap.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (this.compare(heap[i] as T, heap[parent] as T) >= 0) break;
			[heap[i], heap[parent]] = [heap[parent] as T, heap[i] as T];
			i = parent;
		}
	}

	pop(): T | undefined {
		const heap = this.heap;
		const top = heap[0];
		const last = heap.pop();
		if (heap.length > 0 && last !== undefined) {
			heap[0] = last;
			let i = 0;
			for (;;) {
				const left = 2 * i + 1;
				const right = left + 1;
				let smallest = i;
				if (left < heap.length && this.compare(heap[left] as T, heap[smallest] as T) < 0) {
					smallest = left;
				}
				if (right < heap.length && this.compare(heap[right] as T, heap[smallest] as T) < 0) {
					smallest = right;
				}
				if (smallest === i) break;
				[heap[i], heap[smallest]] = [heap[smallest] as T, heap[i] as T];
				i = smallest;
			}
		}
		return top;
	}
}

/**
 * Disjoint groups of the items `0..size-1`. `find` compresses paths and `union` attaches the
 * smaller group to the larger, so both are near constant time.
 */
export class UnionFind {
	private readonly parent: number[];
	private readonly groupSize: number[];
	private groups: number;

	constructor(size: number) {
		this.parent = Array.from({ length: size }, (_, i) => i);
		this.groupSize = new Array<number>(size).fill(1);
		this.groups = size;
	}

	/** How many separate groups remain. */
	get count(): number {
		return this.groups;
	}

	/** The representative of the group holding `item`; equal for items in the same group. */
	find(item: number): number {
		let root = item;
		while (this.parent[root] !== root) root = this.parent[root] as number;
		let current = item;
		while (current !== root) {
			const next = this.parent[current] as number;
			this.parent[current] = root;
			current = next;
		}
		return root;
	}

	/** Joins the groups of `a` and `b`; false when they were already one group. */
	union(a: number, b: number): boolean {
		let rootA = this.find(a);
		let rootB = this.find(b);
		if (rootA === rootB) return false;
		if ((this.groupSize[rootA] as number) < (this.groupSize[rootB] as number)) {
			[rootA, rootB] = [rootB, rootA];
		}
		this.parent[rootB] = rootA;
		this.groupSize[rootA] = (this.groupSize[rootA] as number) + (this.groupSize[rootB] as number);
		this.groups--;
		return true;
	}

	/** How many items are in the group holding `item`. */
	sizeOf(item: number): number {
		return this.groupSize[this.find(item)] as number;
	}

	/** The size of every group, in no particular order. */
	sizes(): number[] {
		return this.parent.flatMap((parent, item) =>
			parent === item ? [this.groupSize[item] as number] : [],
		);
	}
}

export class DefaultMap<K, V> extends Map<K, V> {
	private make: (key: K) => V;

	constructor(make: (key: K) => V) {
		super();
		this.make = make;
	}

	override get(key: K): V {
		if (!this.has(key)) this.set(key, this.make(key));
		return super.get(key) as V;
	}
}

export const counter = <T>(items: Iterable<T>): Map<T, number> => {
	const counts = new Map<T, number>();
	for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
	return counts;
};

/** Caches results by `key`; pass your own when String(args) is not unique or is slow. */
export const memoize = <Args extends unknown[], Result>(
	compute: (...args: Args) => Result,
	key: (...args: Args) => unknown = (...args) => args.join(","),
): ((...args: Args) => Result) => {
	const cache = new Map<unknown, Result>();
	return (...args) => {
		const cacheKey = key(...args);
		if (cache.has(cacheKey)) return cache.get(cacheKey) as Result;
		const result = compute(...args);
		cache.set(cacheKey, result);
		return result;
	};
};
