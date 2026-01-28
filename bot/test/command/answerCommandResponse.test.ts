import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMessage } from "@/test/setup";

const hoisted = vi.hoisted(() => ({
	helpCommand: vi.fn(() => {
		throw new Error("boom");
	}),
	reply: vi.fn(),
	logError: vi.fn(),
}));

vi.mock("@/command/help", () => ({
	helpCommand: hoisted.helpCommand,
}));

vi.mock("@/util/message", async () => {
	const actual = await vi.importActual<typeof import("@/util/message")>("@/util/message");
	return {
		...actual,
		reply: hoisted.reply,
	};
});

vi.mock("@/util/log", async () => {
	const actual = await vi.importActual<typeof import("@/util/log")>("@/util/log");
	return {
		...actual,
		logError: hoisted.logError,
	};
});

import { answerCommandResponse } from "@/command";

describe("answerCommandResponse", () => {
	beforeEach(() => {
		hoisted.helpCommand.mockClear();
		hoisted.reply.mockClear();
		hoisted.logError.mockClear();
	});

	it("replies with error when command handler throws", async () => {
		const message = createMessage({ body: "!help" });
		await answerCommandResponse(message);

		expect(hoisted.helpCommand).toHaveBeenCalledWith(expect.objectContaining({ message }));
		expect(hoisted.logError).toHaveBeenCalledWith(expect.any(Error));
		expect(hoisted.reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Something went wrong"),
		);
	});

	it("returns when no command is matched", async () => {
		const message = createMessage({ body: "hello there" });
		await answerCommandResponse(message);

		expect(hoisted.helpCommand).not.toHaveBeenCalled();
		expect(hoisted.reply).not.toHaveBeenCalled();
	});
});
