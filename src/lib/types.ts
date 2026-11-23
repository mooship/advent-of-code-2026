export type Answer = number | string | bigint;

export type Solution = (input: string) => Answer | Promise<Answer>;
