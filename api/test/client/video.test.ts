import { describe, expect, it, vi } from "vitest";
import { setGptBoyUtils } from "@/test/setup";
import {
	getPendingVideoResponse,
	getVideoCreditsResponse,
	getVideoDraftResponse,
	getVideoResponse,
} from "@/client/video";

describe("video client", () => {
	it("returns rate limit errors with time remaining", async () => {
		setGptBoyUtils({
			request: async () => ({
				retry: vi.fn(async (callback: () => Promise<unknown>) => await callback()),
			}),
			videoRequest: async () => ({
				videoUsageRequest: vi.fn().mockResolvedValueOnce({
					rate_limit_and_credit_balance: {
						rate_limit_reached: true,
						access_resets_in_seconds: 61,
						estimated_num_videos_remaining: 0,
					},
				}),
			}),
			time: () => ({
				formatSeconds: vi.fn(() => "1 minute, 1 second"),
			}),
		});

		const response = await getVideoResponse({ body: { prompt: "x" } });
		expect(response.error).toContain("Reset occurs in 1 minute, 1 second.");
	});

	it("returns video task details when successful", async () => {
		setGptBoyUtils({
			request: async () => ({
				retry: vi.fn(async (callback: () => Promise<unknown>) => await callback()),
			}),
			videoRequest: async () => ({
				videoUsageRequest: vi.fn().mockResolvedValueOnce({
					rate_limit_and_credit_balance: {
						rate_limit_reached: false,
						estimated_num_videos_remaining: 2,
					},
				}),
				videoRequest: vi.fn().mockResolvedValueOnce({ id: "task-1" }),
			}),
			time: () => ({
				formatSeconds: vi.fn(),
			}),
		});

		const response = await getVideoResponse({ body: { prompt: "x" } });
		expect(response.taskId).toBe("task-1");
		expect(response.numVideosRemaining).toBe(1);
	});

	it("returns errors from video requests", async () => {
		setGptBoyUtils({
			request: async () => ({
				retry: vi.fn(async (callback: () => Promise<unknown>) => await callback()),
			}),
			videoRequest: async () => ({
				videoUsageRequest: vi.fn().mockResolvedValueOnce({
					rate_limit_and_credit_balance: {
						rate_limit_reached: false,
						estimated_num_videos_remaining: 1,
					},
				}),
				videoRequest: vi.fn().mockRejectedValueOnce(new Error("boom")),
			}),
			time: () => ({
				formatSeconds: vi.fn(),
			}),
		});

		const response = await getVideoResponse({ body: { prompt: "x" } });
		expect(response.error).toBe("boom");
	});

	it("returns pending progress when present", async () => {
		setGptBoyUtils({
			videoRequest: async () => ({
				videoPendingRequest: vi
					.fn()
					.mockResolvedValueOnce([{ id: "task", progress_pct: 42 }]),
			}),
		});

		const response = await getPendingVideoResponse({ body: { taskId: "task" } });
		expect(response.progress).toBe(42);
	});

	it("returns null when pending task not found", async () => {
		setGptBoyUtils({
			videoRequest: async () => ({
				videoPendingRequest: vi.fn().mockResolvedValueOnce([{ id: "other" }]),
			}),
		});

		const response = await getPendingVideoResponse({ body: { taskId: "task" } });
		expect(response.task).toBeNull();
	});

	it("returns errors when pending response is not an array", async () => {
		setGptBoyUtils({
			videoRequest: async () => ({
				videoPendingRequest: vi.fn().mockResolvedValueOnce({ error: "bad" }),
			}),
		});

		const response = await getPendingVideoResponse({ body: { taskId: "task" } });
		expect(response.error).toEqual({ error: "bad" });
	});

	it("returns usage details", async () => {
		setGptBoyUtils({
			videoRequest: async () => ({
				videoUsageRequest: vi.fn().mockResolvedValueOnce({ credits: 3 }),
			}),
		});

		const response = await getVideoCreditsResponse();
		expect(response.credits).toBe(3);
	});

	it("returns usage errors", async () => {
		setGptBoyUtils({
			videoRequest: async () => ({
				videoUsageRequest: vi.fn().mockRejectedValueOnce(new Error("boom")),
			}),
		});

		const response = await getVideoCreditsResponse();
		expect(response.error).toBe("boom");
	});

	it("returns draft data when found", async () => {
		const videoDraftRequest = vi
			.fn()
			.mockResolvedValueOnce({ items: [] })
			.mockResolvedValueOnce({ items: [{ task_id: "task", id: "draft-1" }] });

		const pause = vi.fn();

		setGptBoyUtils({
			videoRequest: async () => ({
				videoDraftRequest,
			}),
			time: () => ({
				pause,
			}),
		});

		const response = await getVideoDraftResponse({ body: { taskId: "task" } });
		expect(response.id).toBe("draft-1");
		expect(videoDraftRequest).toHaveBeenCalledTimes(2);
		expect(pause).toHaveBeenCalled();
	});

	it("returns errors when draft is not found", async () => {
		const videoDraftRequest = vi.fn().mockResolvedValue({ items: [] });
		setGptBoyUtils({
			videoRequest: async () => ({
				videoDraftRequest,
			}),
			time: () => ({
				pause: vi.fn(),
			}),
		});

		const response = await getVideoDraftResponse({ body: { taskId: "task" } });
		expect(response.error).toContain("Unable to find draft");
	});
});
