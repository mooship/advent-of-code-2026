# Advent of Code 2026

TypeScript on Node 26, Biome, Vitest. This is a race: the goal is the fastest correct answer for both parts of each day, written as clean code. Both matter. Clean code is not the slow option here, because a clear model of the problem is also the quickest way to a correct answer.

## Principles

1. **Right thing, right way, cleanly.** Solve the actual problem with the appropriate algorithm and write it properly the first time. No hacks, no "fix it later", no throwaway code that stays.
2. **Correct on the first submit.** A wrong answer locks submissions for a growing time penalty. Never guess: pass the example, re-read the statement, then run the real input.
3. **Speed comes from clarity.** Read the whole puzzle first, name the concepts in it, model them, then code. Use `src/lib` before writing a helper; the exports are listed under Commands, so don't open the files to find them.
4. **Part 2 is usually a twist on part 1, but you haven't seen it yet.** Model the puzzle's real concepts and pass the obvious puzzle numbers (sizes, step counts) as arguments, so a twist is a small change. Do not guess at what part 2 will ask or build for it in advance.

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

## Design judgement

These ideas matter here, but each one is applied only when the puzzle gives a concrete reason. Never add structure to honour a principle.

**Build the simplest thing that solves the puzzle as stated.** The simplest correct solution is also the quickest to write and the easiest to trust. Cleverness is for when the input size forces it. If two designs both work, take the one a reader follows in a single pass.

**Nothing speculative, and this is the rule that matters most in a race.** No options nobody asked for, no generic frameworks, no interface with a single implementation, no helper "for later", no handling of inputs the puzzle says cannot occur. Part 2 is unlocked only after part 1 is solved, and small, well-shaped code is cheap to change then. The same goes for `src/lib`: it was seeded with helpers that come up nearly every year (the latest batch: `UnionFind`, `binarySearch`, `prefixSums`/`rectSum`, 3D points), and after that it only grows when a helper has been needed twice. Write it in the day's own file first and log it in `src/lib/CANDIDATES.md` at wrap-up, so the second day finds it.

**Give each function one reason to change.** Parsing changes when the input format does, the solving logic when the puzzle's rules do, and `part1`/`part2` when how the parts differ does. Keeping these apart is what lets part 2 be a small edit.

**Grow by adding, not by rewriting.** When part 2 changes a rule, the shape that survives is the old code left alone plus the changed rule passed in as a function or parameter, or one more variant of a small union type. Introduce that seam at the moment the second variant actually appears, not before. When variants share a type, every variant must honour the same contract, so callers never special-case one.

**Depend on the narrowest thing that works.** Functions take the smallest data they need (a `Point[]`, not the whole parsed state) and take behaviour as a function (as `bfs` takes `next`, not a `Grid` class). Prefer plain functions and plain types over classes and inheritance. Reach for a class only for a data structure with real internal invariants, like a priority queue.

**When these pull against each other:** correct first, then simple and nothing speculative, then flexible. Flexibility loses every tie.

## Speed of the program

Choose the right algorithm from the input size before writing code. A clean brute force is right when the input is small; when the puzzle says a huge number of steps or a huge range, use the structural solution (cycle detection, memoization, interval merging, closed form) straight away rather than a naive version to be replaced later. Measure with `npm run solve`, which prints the time per part. Optimize only what the timing shows is slow, and keep it readable.

| Puzzle shape                                             | Reach for                                                |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Shortest path, unweighted                                | `bfs`                                                    |
| Cheapest path with weights                               | `dijkstra` (pass `heuristic` for A*)                     |
| "Simulate N steps", N huge                               | `iterate` (cycle detection on the state)                 |
| Count ways / optimal choice with overlapping subproblems | `memoize` recursion or DP                                |
| Ranges and intervals                                     | `mergeRanges`, or sort and sweep                         |
| Repeating cycles that must align                         | `lcm` / `crt` (bigint)                                   |
| Dependencies / ordering                                  | `topologicalSort`                                        |
| Grids                                                    | `grid`, `neighbors`, `DIRS4`/`DIRS8` from `#lib/grid.ts` |
| Counting items                                           | `counter` / `DefaultMap`                                 |
| Groups that merge, connected components                  | `UnionFind`                                              |
| Smallest value where a monotone condition holds          | `binarySearch`                                           |
| Many rectangle sums over a grid                          | `prefixSums` + `rectSum`                                 |
| 3D points and steps                                      | `Point3`, `DIRS6`, `manhattan3`                          |

## Workflow per day

1. `npm run start -- N` does all of phase 0: fresh `main`, the `day-NN` branch, the scaffold in `src/days/dayNN/` (`solution.ts`, `solution.test.ts`, `example.txt`) and the input, waiting for the puzzle to unlock. `npm run new -- N` and `npm run fetch -- N` do their halves alone.
2. The user pastes the puzzle text. Read all of it, including the examples and the edge cases in the prose (inclusive vs exclusive ends, 0 vs 1 indexing, "exactly", duplicates, ties).
3. Put the puzzle's example in `example.txt`.
4. Implement, check it with `npm run solve -- N --example` against the answer in the puzzle text, then run `npm run solve -- N` for the real answer. Real tests, lint and the PR wait until the answers are accepted (see the `aoc-day` skill for the full order).
5. Give the user the answer plus one line on the method, then submit it with `npm run submit -- N <part> <answer>`. The permission prompt is the user's approval; never look for a way around it. Part 2: reuse and generalize, don't copy.
6. Each solution is its own PR. Work on a `day-NN` branch off `main`. After both answers are accepted (the submit reports correct, or the user says so; not before), write the tests, run `npm run check`, commit (`feat: solve day N`), push the branch and open a PR. Run the `aoc-reviewer` agent on the diff in the background while pushing; apply only its important findings and never wait on it before the next day. Log any helper written inline in `src/lib/CANDIDATES.md`. Enable auto-merge (squash) so it lands once the `Check` job passes. Don't push to `main` directly.

Commands: `npm run start -- N`, `npm run solve -- N [--example] [--part 1|2]`, `npm run watch -- N`, `npm run times` (per-part milliseconds for every day with an `input.txt`), `npm test`, `npm run test:watch`, `npm run check` (lint, build, library and script tests; CI's one `Check` job runs exactly this), `npm run fix` (Biome autofix).

`src/lib` exports: `input` (`lines`, `paragraphs`, `ints`, `grid`, `digitGrid`), `grid` (`Point`, `DIRS4`, `DIRS8`, `pointKey`, `inBounds`, `neighbors`, `manhattan`, `findAll`, `Point3`, `DIRS6`, `manhattan3`, `prefixSums`, `rectSum`), `arrays` (`chunk`, `windows`, `transpose`, `pairs`, `combinations`, `permutations`), `math` (`sum`, `product`, `gcd`, `lcm`, `mod`, `range`, `mergeRanges`, `crt`), `collections` (`PriorityQueue`, `UnionFind`, `DefaultMap`, `counter`, `memoize`), `search` (`bfs`, `binarySearch`, `dijkstra`, `iterate`, `topologicalSort`), `types` (`Answer`).

A pre-commit hook (lefthook) runs `biome check --write` on staged files and then `tsc --noEmit`, so formatting and safe lint fixes happen on commit; unfixable lint errors and type errors block it. Commits only happen after both answers are accepted, so the hook never slows solving.

## TypeScript and Node gotchas

- Node runs `.ts` directly (type stripping), so only erasable syntax: no `enum`, `namespace` or constructor parameter properties. Use `as const` objects and unions. Imports need the `.ts` extension; use `#lib/...` for the helpers.
- Numbers lose precision above 2^53. For big values use `bigint` (answers can be `bigint`) and don't mix it with `number`.
- `%` can be negative: use `mod`. `Array.prototype.sort()` is lexicographic by default: always pass a comparator.
- Objects and arrays as `Map`/`Set` keys compare by reference. Use a string or numeric key (`pointKey`, or `y * width + x`).
- Recursion is limited to roughly 10,000 frames. Use an explicit stack or queue for deep traversals.
- `ints()` reads `-` as a minus sign, so split ranges like `3-5` on the dash first. Input may end with a trailing newline; `lines` handles it and CRLF.

## Debugging a wrong answer

Follow the `aoc-wrong-answer` skill. Don't resubmit variations.

## Boundaries

- Never commit puzzle inputs or puzzle text (`input.txt` and `example*.txt` are git-ignored). Examples go in the git-ignored file, not inline in tests.
- Never read or print `.env` or the `AOC_SESSION` cookie, and never ask for it in chat.
- Submit only through `npm run submit`, only an answer that passed the example check, and only with the user's approval at the permission prompt. It logs attempts in the git-ignored `.submissions.json` and refuses repeats and lockouts. After a wrong answer, tell the user the cause before submitting anything else. Never call the AoC answer endpoint any other way.
- Only `npm run fetch` (once per day input, also run by `npm run start`) and `npm run submit` talk to adventofcode.com. Keep requests throttled and never loop them. A `PreToolUse` hook (`scripts/guard.ts`) and the deny list in `.claude/settings.json` block `.env`, `AOC_SESSION`, `adventofcode.com`, `curl` and `wget` everywhere else; do not work around them.
- Personal repo: commit as the repo-local noreply identity, Conventional Commits (`feat: solve day 1`). Pushing a `day-NN` branch and opening its PR is pre-approved; never force-push or rewrite history.

## Style of replies during a race

Terse. Code first, then the answer and a one-line method. Ask a question only if the puzzle is genuinely ambiguous. No preamble.
