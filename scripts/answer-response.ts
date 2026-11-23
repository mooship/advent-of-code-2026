export type Verdict =
	| { kind: "correct" }
	| { kind: "wrong"; hint?: "too high" | "too low"; waitSeconds?: number }
	| { kind: "too-soon"; waitSeconds: number }
	| { kind: "not-open" }
	| { kind: "unknown"; text: string };

const SECONDS_PER_UNIT = { second: 1, minute: 60, hour: 3600 } as const;

function articleText(html: string): string {
	const article = html.match(/<article>([\s\S]*?)<\/article>/)?.[1] ?? html;
	return article
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function parseWaitSeconds(text: string): number | undefined {
	const countdown = text.match(/(?:(\d+)m )?(\d+)s left to wait/);
	if (countdown) return Number(countdown[1] ?? 0) * 60 + Number(countdown[2]);

	const penalty = text.match(/please wait (\d+|one) (second|minute|hour)/i);
	if (penalty) {
		const count = penalty[1]?.toLowerCase() === "one" ? 1 : Number(penalty[1]);
		const unit = penalty[2]?.toLowerCase() as keyof typeof SECONDS_PER_UNIT;
		return count * SECONDS_PER_UNIT[unit];
	}

	return undefined;
}

export function parseAnswerResponse(html: string): Verdict {
	const text = articleText(html);

	if (text.includes("That's the right answer")) return { kind: "correct" };

	if (text.includes("You gave an answer too recently")) {
		return { kind: "too-soon", waitSeconds: parseWaitSeconds(text) ?? 60 };
	}

	if (text.includes("That's not the right answer")) {
		const hint = text.includes("too high")
			? "too high"
			: text.includes("too low")
				? "too low"
				: undefined;
		return { kind: "wrong", hint, waitSeconds: parseWaitSeconds(text) };
	}

	if (text.includes("You don't seem to be solving the right level")) return { kind: "not-open" };

	return { kind: "unknown", text };
}
