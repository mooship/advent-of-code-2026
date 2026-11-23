# Advent of Code 2026

My [Advent of Code 2026](https://adventofcode.com/2026) solutions, in TypeScript on Node 26, linted with Biome and tested with Vitest.

**AI disclosure:** this repo is built with [Claude Code](https://claude.com/claude-code). Claude helps write and debug the solutions and the tooling, and commits it makes carry a `Co-Authored-By` trailer.

## Usage

Needs [fnm](https://github.com/Schniz/fnm) (or any Node 26). `.node-version` selects Node 26.

```sh
npm install
npm run new -- 1           # scaffold src/days/day01
npm run fetch -- 1         # download input (needs AOC_SESSION in .env, see .env.example)
npm run solve -- 1         # run both parts on input.txt; add --example for example.txt
npm run watch -- 1         # same, re-running on save
npm run check              # lint, build (tsc) and lib tests, same as CI
```

Puzzle inputs and example text are git-ignored, as Advent of Code asks.

## License

[MIT](LICENSE)
