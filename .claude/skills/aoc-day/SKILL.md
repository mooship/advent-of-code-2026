---
name: aoc-day
description: Solve an Advent of Code 2026 day in this repo, then test, review and PR it. Use whenever the user gives a day number, pastes puzzle text, says solve, next day, part 2 or wrong answer, or asks for the tests, a review or the PR of a day. Answer first, polish after.
---

# AoC day

The order is the point: **first get the right answer in front of the user, and only then tests, review and PR.** An accepted answer earns the points; a merged PR earns none. Nothing in phase 3 may delay phases 1 and 2. `CLAUDE.md` holds the code standards, and they apply from the first line you write.

The day number is the skill argument, or ask once if it is missing.

## Phase 0: prep (before the puzzle unlocks if possible)

- `npm run start -- N` does it all: `main` up to date, the `day-NN` branch (switched to if it exists), the scaffold if missing, and the input fetched the moment the puzzle unlocks (it waits). Never touch `.env`. If it fails, report the message; if `input.txt` is still missing when you need it, say so and wait.

## Phase 1: part 1, race mode

1. Read the entire puzzle text the user pasted, including every example and the edge cases hidden in the prose. Check the input's size and shape (`wc`, `head`) and pick the algorithm from that before writing code.
2. Put the puzzle's example in `example.txt` exactly as given.
3. Implement in `solution.ts`: `parse`, the solving logic, `part1` composing them. Clean and simple, nothing speculative.
4. `npm run solve -- N --example` and compare with the answer stated in the puzzle. If it differs, fix it before touching the real input.
5. `npm run solve -- N --part 1`, tell the user `Part 1: <answer>` with a one-line method, and submit it with `npm run submit -- N 1 <answer>`. The user approves the submit at the permission prompt. Report the verdict, then wait for the user.

Do not write tests, run lint or `check`, commit, or open anything during this phase.

## Phase 2: part 2, race mode

Same loop when the user pastes part 2. Reuse part 1 and add a seam for the changed rule only now (see Design judgement in `CLAUDE.md`). Re-run the example for part 1 as a regression check, then give `Part 2: <answer>` and the one-line method, and submit it with `npm run submit -- N 2 <answer>`.

### If an answer is rejected

Stop and follow the `aoc-wrong-answer` skill. Do not submit variations.

## Phase 3: wrap-up, only after both answers are accepted (the submit reports correct, or the user says so or says to wrap up)

Do these in order. The accepted answers must stay unchanged throughout.

1. **Tests.** Turn the `it.todo` stubs in `solution.test.ts` into real tests using the example answers from the puzzle text, plus any edge case that caught you out. `npm run test -- dayNN` must pass.
2. **Wrap-up log.** If a helper was written inline that another day might need, append a line to `src/lib/CANDIDATES.md`. If one already listed is needed again, move it into `src/lib` with a test and delete its line.
3. `npm run fix`, then `npm run check`. It must be green.
4. **Commit** `feat: solve day N` with only `solution.ts` and `solution.test.ts` (plus `src/lib` or `CANDIDATES.md` if touched). Check `git status` first: no `input.txt`, `example.txt` or `.env` may be staged.
5. **PR and review in parallel.** Start the `aoc-reviewer` agent on `git diff main...HEAD` **in the background**, then without waiting `git push -u origin day-NN`, `gh pr create` titled `feat: solve day N` (a two-to-three line body on the approach, both timings and the usual Claude Code attribution line), and `gh pr merge --auto --squash`. It lands once the `Check` job passes.
6. Reply with the PR URL and move on to the next day from a fresh `main`; never block on CI or on the reviewer. When the reviewer reports, apply only the important findings (anything marked `CHANGES ANSWER?` needs particular care), re-run both real answers (`npm run solve -- N`) and confirm they are identical to the accepted ones, run `npm run fix` and `npm run check`, then push to the same branch. If CI goes red, fix it on the branch.

## Reviewing a day on request

When the user asks for a review of a day or PR, run the `aoc-reviewer` agent on `git diff main...day-NN` and relay its findings, most important first. Don't rewrite an accepted, working solution unless asked.

## Never

Read or print `.env`, submit answers by any route other than `npm run submit` (with the user's approval at the prompt), fetch inputs unless asked, commit puzzle inputs or text, push to `main`, or force-push.
