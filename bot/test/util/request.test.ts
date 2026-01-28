import { describe, expect, it, vi } from "vitest";
import { createFetchMock } from "@/test/setup";
import {
	getLocalChatResponse,
	getLocalDraftVideoResponse,
	getLocalPendingVideoResponse,
	getLocalVideoCreditsResponse,
	getLocalVideoResponse,
} from "@/util/request";

describe("request utils", () => {
	const fetch = createFetchMock();

	it("returns chat response JSON", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ answer: "ok" }),
		});

		const response = await getLocalChatResponse("hi", { whatsappIdentifier: "id" });
		expect(response.answer).toBe("ok");
	});

	it("throws on chat response error", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ error: "bad" }),
		});

		await expect(getLocalChatResponse("hi", { whatsappIdentifier: "id" })).rejects.toThrow(
			"bad",
		);
	});

	it("returns pending response", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ progress: 10 }),
		});

		const response = await getLocalPendingVideoResponse("task");
		expect(response.progress).toBe(10);
	});

	it("returns draft response", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ task: { id: "x" } }),
		});

		const response = await getLocalDraftVideoResponse("task");
		expect(response.task).toBeTruthy();
	});

	it("throws on pending response error", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ error: "bad" }),
		});

		await expect(getLocalPendingVideoResponse("task")).rejects.toThrow("bad");
	});

	it("throws on draft response error", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ error: "bad" }),
		});

		await expect(getLocalDraftVideoResponse("task")).rejects.toThrow("bad");
	});

	it("returns video response", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ taskId: "x" }),
		});

		const response = await getLocalVideoResponse("prompt");
		expect(response.taskId).toBe("x");
	});

	it("returns video credits response", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ credits: 1 }),
		});

		const response = await getLocalVideoCreditsResponse();
		expect(response.credits).toBe(1);
	});
});
