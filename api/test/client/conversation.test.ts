import { describe, expect, it, vi } from "vitest";
import { setGptBoyUtils } from "@/test/setup";
import { getConversationsResponse } from "@/client/conversation";

describe("getConversationsResponse", () => {
	it("returns parsed conversation data", async () => {
		const parseResponse = vi.fn().mockResolvedValueOnce({
			answer: "ok",
			modelSlug: "gpt-4",
			chatConversationId: "c2",
		});
		const chatRequirements = vi.fn().mockResolvedValueOnce({
			persona: "chatgpt-freeaccount",
			token: "req-token",
			expire_after: 0,
			expire_at: 0,
			turnstile: { required: false, dx: "" },
			proofofwork: { required: false, seed: "seed", difficulty: "0" },
		});
		const chatConversationId = vi.fn().mockResolvedValueOnce({
			current_node: "node-2",
		});
		const chatCompletion = vi.fn().mockResolvedValueOnce({ status: 200 });

		setGptBoyUtils({
			stream: { parseResponse },
			conversationRequest: { chatRequirements, chatConversationId, chatCompletion },
		});

		const response = await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(response.answer).toBe("ok");
		expect(response.modelSlug).toBe("gpt-4");
		expect(response.chatConversationId).toBe("c2");
		expect(chatCompletion).toHaveBeenCalledWith(
			expect.objectContaining({
				parentMessageId: "node-2",
			}),
		);
	});

	it("keeps parent message id when no current node exists", async () => {
		const parseResponse = vi.fn().mockResolvedValueOnce({
			answer: "ok",
			modelSlug: "gpt-4",
			chatConversationId: "c1",
		});
		const chatConversationId = vi.fn().mockResolvedValueOnce({});
		const chatCompletion = vi.fn().mockResolvedValueOnce({ status: 200 });

		setGptBoyUtils({
			stream: { parseResponse },
			conversationRequest: { chatConversationId, chatCompletion },
		});

		await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(chatConversationId).toHaveBeenCalledWith("c1");
		expect(chatCompletion).toHaveBeenCalledWith(
			expect.objectContaining({
				parentMessageId: "pid",
			}),
		);
	});

	it("skips conversation lookup when no id is provided", async () => {
		const parseResponse = vi.fn().mockResolvedValueOnce({
			answer: "ok",
			modelSlug: "gpt-4",
			chatConversationId: "c2",
		});
		const chatConversationId = vi.fn();
		const chatCompletion = vi.fn().mockResolvedValueOnce({ status: 200 });

		setGptBoyUtils({
			stream: { parseResponse },
			conversationRequest: { chatConversationId, chatCompletion },
		});

		await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(chatConversationId).not.toHaveBeenCalled();
	});

	it("falls back to the provided conversation id when response is missing it", async () => {
		const parseResponse = vi.fn().mockResolvedValueOnce({
			answer: "ok",
			modelSlug: "gpt-4",
			chatConversationId: null,
		});

		setGptBoyUtils({
			stream: { parseResponse },
		});

		const response = await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(response.chatConversationId).toBe("c1");
	});

	it("retries without conversation id when too long", async () => {
		const parseResponse = vi.fn().mockResolvedValueOnce({
			answer: "ok",
			modelSlug: "gpt-4",
			chatConversationId: "c1",
		});
		const chatCompletion = vi
			.fn()
			.mockResolvedValueOnce({ status: 413 })
			.mockResolvedValueOnce({ status: 200 });

		setGptBoyUtils({
			stream: { parseResponse },
			conversationRequest: { chatCompletion },
		});

		await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(chatCompletion).toHaveBeenCalledTimes(2);
		expect(chatCompletion).toHaveBeenLastCalledWith(
			expect.objectContaining({
				conversationId: undefined,
			}),
		);
	});

	it("returns errors when rate-limited", async () => {
		setGptBoyUtils({
			conversationRequest: { chatCompletion: vi.fn().mockResolvedValueOnce({ status: 429 }) },
		});

		const response = await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(response.error).toBe("Too many requests.");
	});

	it("returns stringified errors for non-Error throws", async () => {
		setGptBoyUtils({
			conversationRequest: async () => {
				throw "bad";
			},
		});

		const response = await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(response.error).toBe("bad");
	});
});
