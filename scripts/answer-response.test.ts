import { describe, expect, it } from "vitest";
import { parseAnswerResponse } from "./answer-response.ts";

const page = (body: string) => `<main><article><p>${body}</p></article></main>`;

describe("parseAnswerResponse", () => {
	it("recognises a correct answer", () => {
		const html = page(
			`That's the right answer!  You are <span class="day-success">one gold star</span> closer.`,
		);
		expect(parseAnswerResponse(html)).toEqual({ kind: "correct" });
	});

	it("recognises a wrong answer with a hint and a penalty", () => {
		const html = page(
			`That's not the right answer; your answer is too high.  Please wait 5 minutes before trying again.`,
		);
		expect(parseAnswerResponse(html)).toEqual({
			kind: "wrong",
			hint: "too high",
			waitSeconds: 300,
		});
	});

	it("reads a spelled-out one-minute penalty", () => {
		const html = page(
			`That's not the right answer; your answer is too low.  Because you have guessed incorrectly 1 time, please wait one minute before trying again.`,
		);
		expect(parseAnswerResponse(html)).toEqual({ kind: "wrong", hint: "too low", waitSeconds: 60 });
	});

	it("recognises a wrong answer with no hint or penalty", () => {
		const html = page(
			`That's not the right answer.  If you're stuck, read the <a href="/2026/about">about page</a>.`,
		);
		expect(parseAnswerResponse(html)).toEqual({
			kind: "wrong",
			hint: undefined,
			waitSeconds: undefined,
		});
	});

	it("reads the remaining lockout when answering too soon", () => {
		const html = page(
			`You gave an answer too recently; you have to wait after submitting an answer before trying again.  You have 1m 52s left to wait.`,
		);
		expect(parseAnswerResponse(html)).toEqual({ kind: "too-soon", waitSeconds: 112 });
	});

	it("recognises a puzzle that is already complete or on the wrong level", () => {
		const html = page(
			`You don't seem to be solving the right level.  Did you already complete it?`,
		);
		expect(parseAnswerResponse(html)).toEqual({ kind: "not-open" });
	});

	it("returns the text for anything it does not recognise", () => {
		expect(parseAnswerResponse(page("Something new"))).toEqual({
			kind: "unknown",
			text: "Something new",
		});
	});
});
