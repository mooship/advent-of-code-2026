# Advent of Code 2026

My [Advent of Code 2026](https://adventofcode.com/2026) solutions, in TypeScript on Node 26, linted with Biome and tested with Vitest.

**AI disclosure:** this repo is built with [Claude Code](https://claude.com/claude-code). Claude helps write and debug the solutions and the tooling, and commits it makes carry a `Co-Authored-By` trailer.

## Usage

Needs [fnm](https://github.com/Schniz/fnm) (or any Node 26). `.node-version` selects Node 26. On macOS: `brew install fnm`, then add this to `~/.zshrc` so the shell switches Node per repo:

```sh
eval "$(fnm env --use-on-cd --version-file-strategy recursive --shell zsh)"
```

```sh
npm install
npm run start -- 1         # fresh main, day-01 branch, scaffold, then fetch the input (waits for unlock)
npm run new -- 1           # scaffold src/days/day01 only
npm run fetch -- 1         # download input only (needs AOC_SESSION in .env, see .env.example)
npm run submit -- 1 1 42   # submit an answer for day 1 part 1 (asks for permission)
npm run solve -- 1         # run both parts on input.txt; add --example for example.txt
npm run watch -- 1         # same, re-running on save
npm run times              # time every day that has an input.txt, per part
npm run check              # lint, build (tsc) and library and script tests, the one CI job (Check)
```

Puzzle inputs and example text are git-ignored, as Advent of Code asks.

## License

[MIT](LICENSE)
