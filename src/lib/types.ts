/** What a puzzle part returns; use `bigint` once values pass 2^53. */
export type Answer = number | string | bigint;

/** A day's `part1`/`part2`: takes the raw input text and returns the answer. */
export type Solution = (input: string) => Answer | Promise<Answer>;
