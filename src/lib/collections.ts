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
