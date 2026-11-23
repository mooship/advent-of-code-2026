# Advent of Code 2026

TypeScript on Node 26, Biome, Vitest. This is a race: the goal is the fastest correct answer for both parts of each day, written as clean code. Both matter. Clean code is not the slow option here, because a clear model of the problem is also the quickest way to a correct answer.

## Principles

1. **Right thing, right way, cleanly.** Solve the actual problem with the appropriate algorithm and write it properly the first time. No hacks, no "fix it later", no throwaway code that stays.
2. **Correct on the first submit.** A wrong answer locks submissions for a growing time penalty. Never guess: pass the example, re-read the statement, then run the real input.
3. **Speed comes from clarity.** Read the whole puzzle first, name the concepts in it, model them, then code. Don't gold-plate: build only what this puzzle needs, and use `src/lib` before writing a helper.
4. **Part 2 is usually a twist on part 1.** Keep the model general (parameters, not hardcoded values) so part 2 is a small change, not a rewrite.

## Clean code rules

- Names say what a thing is: `guardPosition`, not `gp`. No single letters outside tiny loops and `x`/`y`.
- Small functions that do one thing. Each puzzle has `parse` (text to a typed model), the solving logic, and `part1`/`part2` that only compose them. Parsing never mixes with solving.
- Pure functions: no module-level mutable state, no mutating the parsed input. Parse once per part, or copy before mutating.
- Model with types: a `type`/`interface` for a robot, a range, a hand, not parallel arrays or `[number, number, string]` tuples passed around.
- No magic numbers or strings. Named constants for puzzle rules (`const STEPS = 100`), parameters for things that change between parts.
- No duplicated logic between parts. Share the function, vary the argument.
- No dead code, commented-out code, or debug `console.log` left behind. Comments only for a non-obvious why (a puzzle rule, an invariant, an AoC quirk), never to narrate the code.
- No `any`, no non-null `!` to silence the compiler, no `@ts-ignore`. Fix the type.
- Prefer clear expressions (`map`/`filter`/`reduce`, `for...of`) over index juggling, unless a hot loop needs otherwise and you have measured it.

## Speed of the program

Choose the right algorithm from the input size before writing code. A clean brute force is right when the input is small; when the puzzle says a huge number of steps or a huge range, use the structural solution (cycle detection, memoization, interval merging, closed form) straight away rather than a naive version to be replaced later. Measure with `npm run solve`, which prints the time per part. Optimize only what the timing shows is slow, and keep it readable.

| Puzzle shape                                             | Reach for                                                |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Shortest path, unweighted                                | `bfs`                                                    |
| Cheapest path with weights                               | `dijkstra` (A* if a good heuristic exists)               |
| "Simulate N steps", N huge                               | Cycle detection on the state                             |
| Count ways / optimal choice with overlapping subproblems | Memoized recursion or DP                                 |
| Ranges and intervals                                     | Sort, then merge or sweep                                |
| Repeating cycles that must align                         | `lcm` / CRT                                              |
| Dependencies / ordering                                  | Topological sort                                         |
| Grids                                                    | `grid`, `neighbors`, `DIRS4`/`DIRS8` from `#lib/grid.ts` |
| Counting items                                           | `counter` / `DefaultMap`                                 |

## Workflow per day

1. `npm run new -- N` scaffolds `src/days/dayNN/` (`solution.ts`, `solution.test.ts`, `example.txt`). Input is fetched with `npm run fetch -- N` (the user usually does this themselves).
2. The user pastes the puzzle text. Read all of it, including the examples and the edge cases in the prose (inclusive vs exclusive ends, 0 vs 1 indexing, "exactly", duplicates, ties).
3. Put the example in `example.txt` and the expected answer in the test (remove `.todo`). Make it fail first.
4. Implement, run `npm run solve -- N --example`, then `npm run solve -- N` for the real answer.
5. Give the user the answer plus one line on the method, so they can submit. Part 2: reuse and generalize, don't copy.
6. After submitting (not before), run `npm run check` and commit.

Commands: `npm run solve -- N [--example] [--part 1|2]`, `npm run watch -- N`, `npm test`, `npm run test:watch`, `npm run check` (lint, build, lib tests, same as CI), `npm run fix` (Biome autofix).

## TypeScript and Node gotchas

- Node runs `.ts` directly (type stripping), so only erasable syntax: no `enum`, `namespace` or constructor parameter properties. Use `as const` objects and unions. Imports need the `.ts` extension; use `#lib/...` for the helpers.
- Numbers lose precision above 2^53. For big values use `bigint` (answers can be `bigint`) and don't mix it with `number`.
- `%` can be negative: use `mod`. `Array.prototype.sort()` is lexicographic by default: always pass a comparator.
- Objects and arrays as `Map`/`Set` keys compare by reference. Use a string or numeric key (`pointKey`, or `y * width + x`).
- Recursion is limited to roughly 10,000 frames. Use an explicit stack or queue for deep traversals.
- `ints()` reads `-` as a minus sign, so split ranges like `3-5` on the dash first. Input may end with a trailing newline; `lines` handles it and CRLF.

## Debugging a wrong answer

Don't resubmit variations. Re-read the statement for a missed rule, check the example passes for both parts, then compare against a slower obviously-correct version on a small input. Say what was wrong and fix the cause.

## Boundaries

- Never commit puzzle inputs or puzzle text (`input.txt` and `example*.txt` are git-ignored). Examples go in the git-ignored file, not inline in tests.
- Never read or print `.env` or the `AOC_SESSION` cookie, and never ask for it in chat.
- Never submit answers to adventofcode.com. Only the user submits.
- Only `npm run fetch` talks to adventofcode.com, once per day input. Keep it throttled and never loop requests.
- Personal repo: commit as the repo-local noreply identity, Conventional Commits (`feat: solve day 1`). Don't push unless asked.

## Style of replies during a race

Terse. Code first, then the answer and a one-line method. Ask a question only if the puzzle is genuinely ambiguous. No preamble.
