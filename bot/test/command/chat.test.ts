import { describe, expect, it, vi } from "vitest";
import { chatCommand } from "@/command/chat";
import * as queueUtils from "@/queue";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("chatCommand", () => {
	const reactQueued = vi.fn();
	const reactTyping = vi.fn();
	createMessageUtilsMock({ reactQueued, reactTyping });
	const addMessageToChatQueue = vi
		.spyOn(queueUtils, "addMessageToChatQueue")
		.mockImplementation(async () => {});

	it("reacts and queues message", async () => {
		const message = createMessage();
		await chatCommand({ message, text: "" });
		expect(reactQueued).toHaveBeenCalledWith(message);
		expect(reactTyping).toHaveBeenCalledWith(message);
		expect(addMessageToChatQueue).toHaveBeenCalledWith(
			expect.objectContaining({ message, text: "" }),
		);
	});
});
