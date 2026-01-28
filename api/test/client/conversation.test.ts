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
			stream: () => ({ parseResponse }),
			sentinel: () => ({
				getRequirementsToken: vi.fn().mockResolvedValueOnce("req"),
				getEnforcementToken: vi.fn().mockResolvedValueOnce("enf"),
			}),
			turnstile: () => ({
				getEnforcementToken: vi.fn().mockResolvedValueOnce("turn"),
			}),
			conversationRequest: async () => ({
				chatRequirements,
				chatConversationId,
				chatCompletion,
			}),
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
			stream: () => ({ parseResponse }),
			sentinel: () => ({
				getRequirementsToken: vi.fn().mockResolvedValueOnce("req"),
				getEnforcementToken: vi.fn().mockResolvedValueOnce("enf"),
			}),
			turnstile: () => ({
				getEnforcementToken: vi.fn().mockResolvedValueOnce("turn"),
			}),
			conversationRequest: async () => ({
				chatRequirements: vi.fn().mockResolvedValueOnce({
					persona: "chatgpt-freeaccount",
					token: "req-token",
					expire_after: 0,
					expire_at: 0,
					turnstile: { required: false, dx: "" },
					proofofwork: { required: false, seed: "seed", difficulty: "0" },
				}),
				chatConversationId: vi.fn().mockResolvedValueOnce({}),
				chatCompletion,
			}),
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
			stream: () => ({ parseResponse: vi.fn() }),
			sentinel: () => ({
				getRequirementsToken: vi.fn().mockResolvedValueOnce("req"),
				getEnforcementToken: vi.fn().mockResolvedValueOnce("enf"),
			}),
			turnstile: () => ({
				getEnforcementToken: vi.fn().mockResolvedValueOnce("turn"),
			}),
			conversationRequest: async () => ({
				chatRequirements: vi.fn().mockResolvedValueOnce({
					persona: "chatgpt-freeaccount",
					token: "req-token",
					expire_after: 0,
					expire_at: 0,
					turnstile: { required: false, dx: "" },
					proofofwork: { required: false, seed: "seed", difficulty: "0" },
				}),
				chatConversationId: vi.fn().mockResolvedValueOnce({}),
				chatCompletion: vi.fn().mockResolvedValueOnce({ status: 429 }),
			}),
		});

		const response = await getConversationsResponse({
			body: { prompt: "hi", gptConversationId: "c1" },
			newMessageId: "mid",
			parentMessageId: "pid",
		});

		expect(response.error).toBe("Too many requests.");
	});
});
