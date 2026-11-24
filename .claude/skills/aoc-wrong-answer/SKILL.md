---
name: aoc-wrong-answer
description: Procedure for a rejected Advent of Code answer in this repo. Use whenever `npm run submit` reports Wrong, Too soon or a lockout, or the user says the answer was wrong. Never resubmit a variation.
---

# Wrong answer

A rejected answer locks submissions for a growing time. Find the cause before any further submit; do not try variations.

1. **Read the verdict.** The submit script printed it (wrong, the hint such as too high or too low, the lockout length). It also logs attempts in the git-ignored `.submissions.json`, and refuses repeats and lockouts itself. Do not read `.env`, and never call the answer endpoint any other way.
2. **Re-read the statement** for a missed rule: inclusive versus exclusive ends, 0 versus 1 indexing, "exactly", duplicates, ties, units, what part 2 changed about part 1.
3. **Check both examples** pass for both parts: `npm run solve -- N --example`.
4. **Write a slow, obviously correct brute force** (the oracle) in the day's folder as `oracle.ts`. It must not share logic with the solution. Do not commit it (`git status` before any commit; delete it when done).
5. **Differential-test** the solution against the oracle on many small generated inputs in the puzzle's input format. Fix the first mismatch's cause, not its symptom. Also check the gotchas in `CLAUDE.md` (negative `%`, default `sort`, reference-keyed `Map`/`Set`, `bigint` mixing, recursion depth, precision above 2^53, `ints()` and `-`).
6. **Say what was wrong** in one or two lines.
7. **Ask the user for approval** before the next `npm run submit`, and wait for the lockout to end.
