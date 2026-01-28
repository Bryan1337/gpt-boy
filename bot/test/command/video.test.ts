import { describe, expect, it, vi } from "vitest";
import { videoCommand } from "@/command/video";
import * as queueUtils from "@/queue";
import * as soraAiDataHandlers from "@/data_handlers/sora_ai/getBlocklist";
import { createMessage, createMessageUtilsMock } from "@/test/setup";
import { Contact } from "whatsapp-web.js";

describe("videoCommand", () => {
	const getBlocklist = vi.spyOn(soraAiDataHandlers, "getBlocklist").mockImplementation(() => []);
	const react = vi.fn();
	const reactQueued = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ react, reactQueued, reply });
	const addMessageToVideoQueue = vi
		.spyOn(queueUtils, "addMessageToVideoQueue")
		.mockImplementation(async () => {});

	it("blocks when user is in blocklist", async () => {
		getBlocklist.mockReturnValueOnce([{ id: "user", reason: "bad", reactEmoji: "x" }]);
		const message = createMessage({
			getContact: vi
				.fn()
				.mockResolvedValueOnce({ id: { user: "user" } } as unknown as Contact),
		});

		await videoCommand({ message, text: "" });
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining('Reason: "bad"'));
		expect(react).toHaveBeenCalledWith(message, "x");
		expect(addMessageToVideoQueue).not.toHaveBeenCalledWith(
			expect.objectContaining({ message }),
		);
	});

	it("blocks with default emoji when no emoji is provided", async () => {
		getBlocklist.mockReturnValueOnce([{ id: "user", reason: "bad" }]);
		const message = createMessage({
			getContact: vi
				.fn()
				.mockResolvedValueOnce({ id: { user: "user" } } as unknown as Contact),
		});

		await videoCommand({ message, text: "" });
		expect(react).toHaveBeenCalledWith(message, "❌");
	});

	it("queues video when user is not blocked", async () => {
		getBlocklist.mockReturnValueOnce([]);
		const message = createMessage({
			getContact: vi
				.fn()
				.mockResolvedValueOnce({ id: { user: "user" } } as unknown as Contact),
		});

		await videoCommand({ message, text: "" });
		expect(reactQueued).toHaveBeenCalledWith(message);
		expect(addMessageToVideoQueue).toHaveBeenCalledWith(
			expect.objectContaining({ message, text: "" }),
		);
	});
});
