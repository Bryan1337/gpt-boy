import { describe, expect, it, vi } from "vitest";
import { setGptBoyUtils } from "@/test/setup";
import conversationRequestUtil from "@/browser-util/conversationRequest";

describe("conversationRequest util", () => {
	it("builds chat requirements and conversation requests", async () => {
		const get = vi.fn();
		const post = vi.fn().mockResolvedValueOnce({ ok: true });
		const request = vi.fn().mockResolvedValueOnce({ ok: true });
		const getAccessToken = vi.fn().mockResolvedValueOnce("token");
		const retry = vi.fn(async (callback: () => Promise<string>) => await callback());

		setGptBoyUtils({
			request: vi.fn(async () => ({
				get,
				post,
				request,
				retry,
				getAccessToken,
			})),
		});

		const util = await conversationRequestUtil();

		await util.chatRequirements("req-token");
		expect(post).toHaveBeenCalledWith(
			expect.stringContaining("/backend-api/sentinel/chat-requirements"),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer token",
				}),
				body: { p: "req-token" },
			}),
		);

		await util.chatConversationId("conv");
		expect(get).toHaveBeenCalledWith(
			expect.stringContaining("/backend-api/conversation/conv"),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer token",
				}),
			}),
		);

		await util.chatCompletion({
			requirementsResponseToken: "req",
			turnstileToken: "turn",
			enforcementToken: "enf",
			conversationId: "cid",
			newMessageId: "mid",
			prompt: "hello",
			parentMessageId: "pid",
		});

		const [url, params] = request.mock.calls[0];
		expect(url).toContain("/backend-api/f/conversation");
		expect(params.headers.Authorization).toBe("Bearer token");
		expect(params.headers["openai-sentinel-chat-requirements-token"]).toBe("req");
		const body = JSON.parse(params.body);
		expect(body.conversation_id).toBe("cid");
		expect(body.parent_message_id).toBe("pid");
		expect(body.messages[0].content.parts[0]).toBe("hello");
	});
});
