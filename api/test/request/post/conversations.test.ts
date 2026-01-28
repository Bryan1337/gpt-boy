import { describe, expect, it, vi } from "vitest";

vi.mock("uuid", () => ({
	v4: vi.fn(() => "parent-id"),
}));

import { createRequestResponseMocks } from "@/test/setup";
import * as logUtils from "@/util/log";
import * as errorUtils from "@/util/error";
import * as messageUtils from "@/util/message";
import { conversationsRequest } from "@/request/post/conversations";
import { getConversationsResponse } from "@/client/conversation";

describe("conversationsRequest", () => {
	it("evaluates conversation response", async () => {
		const { request, response } = createRequestResponseMocks();
		request.body = { prompt: "hi", gptConversationId: "c1" };
		request.pages.chatGptPage.evaluate = vi.fn().mockResolvedValueOnce({ answer: "ok" });
		vi.spyOn(logUtils, "logInfo").mockImplementation(() => {});
		vi.spyOn(messageUtils, "getMessageId").mockImplementation(() => "message-id");

		await conversationsRequest(request, response);

		expect(request.pages.chatGptPage.evaluate).toHaveBeenCalledWith(getConversationsResponse, {
			body: request.body,
			newMessageId: "message-id",
			parentMessageId: "parent-id",
		});
		expect(response.json).toHaveBeenCalledWith({ answer: "ok" });
	});

	it("handles errors", async () => {
		const { request, response } = createRequestResponseMocks();
		request.pages.chatGptPage.evaluate = vi.fn().mockRejectedValueOnce(new Error("boom"));
		vi.spyOn(logUtils, "logError").mockImplementation(() => {});
		vi.spyOn(errorUtils, "getErrorMessage").mockImplementation(() => "oops");

		await conversationsRequest(request, response);

		expect(response.json).toHaveBeenCalledWith({ error: "oops" });
	});
});
