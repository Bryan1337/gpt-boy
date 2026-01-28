import { describe, expect, it, vi } from "vitest";

import {
	getClient,
	getClientSessionTouch,
	getClientTokens,
	getCredits,
	getFeedV2,
	getGenerateV2,
	initializeSession,
	pollClipIds,
} from "@/util/sunoAi";
import { createFetchMock } from "@/test/setup";

describe("sunoAi utils", () => {
	const fetch = createFetchMock();

	it("returns a completed clip", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({
				clips: [
					{
						id: "1",
						audio_url: "a",
						video_url: "v",
						title: "t",
						status: "complete",
						metadata: { error_message: "" },
					},
				],
			}),
		});

		const clip = await pollClipIds(["1"], "token");
		expect(clip?.id).toBe("1");
	});

	it("throws on error clip", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({
				clips: [
					{
						id: "1",
						audio_url: "",
						video_url: "",
						title: "t",
						status: "error",
						metadata: { error_message: "bad" },
					},
				],
			}),
		});

		await expect(pollClipIds(["1"], "token")).rejects.toThrow("bad");
	});

	it("initializes a session", async () => {
		const response = { ok: true };
		fetch.mockResolvedValueOnce(response);

		const result = await initializeSession("token");
		expect(result).toBe(response);
	});

	it("fetches client data", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ response: { sessions: [] } }),
		});

		const client = await getClient("session");
		expect(client.response.sessions).toEqual([]);
	});

	it("fetches client session touch data", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ response: { ok: true } }),
		});

		const result = await getClientSessionTouch("id", "token");
		expect(result.response.ok).toBe(true);
	});

	it("fetches client tokens", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ response: { token: "x" } }),
		});

		const result = await getClientTokens("id", "token");
		expect(result.response.token).toBe("x");
	});

	it("fetches feed data", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ clips: [] }),
		});

		const params = new URLSearchParams();
		const result = await getFeedV2(params, "token");
		expect(result.clips).toEqual([]);
	});

	it("throws when generateV2 returns 403", async () => {
		fetch.mockResolvedValueOnce({
			status: 403,
			statusText: "Forbidden",
		});

		await expect(getGenerateV2("prompt", "token")).rejects.toThrow("Forbidden");
	});

	it("returns generateV2 payload", async () => {
		fetch.mockResolvedValueOnce({
			status: 200,
			json: vi.fn().mockResolvedValueOnce({ clips: [{ id: "1" }] }),
		});

		const result = await getGenerateV2("prompt", "token");
		expect(result.clips[0].id).toBe("1");
	});

	it("returns credits from billing info", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ total_credits_left: 5 }),
		});

		const credits = await getCredits("token");
		expect(credits).toBe(5);
	});
});
