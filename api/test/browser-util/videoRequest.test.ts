import { describe, expect, it, vi } from "vitest";
import { setGptBoyUtils } from "@/test/setup";
import videoRequestUtil from "@/browser-util/videoRequest";

describe("videoRequest util", () => {
	it("builds video usage and draft requests", async () => {
		const get = vi.fn().mockResolvedValueOnce({ ok: true });
		const post = vi.fn().mockResolvedValueOnce({ id: "task" });
		const getAccessToken = vi.fn().mockResolvedValueOnce("token");
		const retry = vi.fn(async (callback: () => Promise<string>) => await callback());

		setGptBoyUtils({
			request: vi.fn(async () => ({
				get,
				post,
				retry,
				getAccessToken,
			})),
		});

		(window as unknown as { SentinelSDK?: { token: () => Promise<string> } }).SentinelSDK = {
			token: vi.fn(async () => "sentinel"),
		};

		const util = await videoRequestUtil();
		await util.videoUsageRequest();
		await util.videoDraftRequest();
		await util.videoPendingRequest();

		expect(get).toHaveBeenCalledWith(
			expect.stringContaining("/backend/nf/check"),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer token",
				}),
			}),
		);

		expect(get).toHaveBeenCalledWith(
			expect.stringContaining("/backend/project_y/profile/drafts"),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer token",
				}),
			}),
		);

		await util.videoRequest("prompt");
		const [url, params] = post.mock.calls[0];
		expect(url).toContain("/backend/nf/create");
		expect(params.headers["Openai-Sentinel-Token"]).toBe("sentinel");
	});

	it("throws when Sentinel SDK is missing", async () => {
		setGptBoyUtils({
			request: vi.fn(async () => ({
				get: vi.fn(),
				post: vi.fn(),
				retry: vi.fn(async (callback: () => Promise<string>) => await callback()),
				getAccessToken: vi.fn().mockResolvedValueOnce("token"),
			})),
		});

		(window as unknown as { SentinelSDK?: unknown }).SentinelSDK = undefined;

		const util = await videoRequestUtil();
		await expect(util.videoRequest("prompt")).rejects.toThrow("Sentinel SDK not available");
	});
});
