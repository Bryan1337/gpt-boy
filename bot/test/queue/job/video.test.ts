import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleVideoQueueJob } from "@/queue/job/video";
import * as fileUtils from "@/util/file";
import * as logUtils from "@/util/log";
import * as requestUtils from "@/util/request";
import * as timeUtils from "@/util/time";
import * as videoUtils from "@/util/video";
import * as whatsappWebUtils from "@/util/whatsappWeb";
import { createMessage, createMessageUtilsMock } from "@/test/setup";
import { Message } from "whatsapp-web.js";

describe("handleVideoQueueJob", () => {
	const getLocalVideoResponse = vi
		.spyOn(requestUtils, "getLocalVideoResponse")
		.mockImplementation(async () => ({}));
	const reactVideo = vi.fn();
	const reactError = vi.fn();
	const reactSuccess = vi.fn();
	const edit = vi.fn();
	const reply = vi.fn(async () => createMessage());
	const replyWithMedia = vi.fn();
	createMessageUtilsMock({ reactVideo, reactError, reactSuccess, edit, reply, replyWithMedia });
	vi.spyOn(timeUtils, "pause").mockImplementation(async () => {});
	const logError = vi.spyOn(logUtils, "logError").mockImplementation(() => {});
	const requestVideo = vi.spyOn(videoUtils, "requestVideo").mockImplementation(async () => null);
	vi.spyOn(fileUtils, "saveExternalFile").mockImplementation(async () => "/tmp/video.mp4");
	vi.spyOn(whatsappWebUtils, "getMessageMediaFromFilePath").mockImplementation(
		() => ({ kind: "media" }) as unknown as Message,
	);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns early when no prompt provided", async () => {
		const message = createMessage();
		await handleVideoQueueJob({ message, text: "  " }, 1000);
		expect(reactVideo).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("No video prompt given"),
		);
	});

	it("handles error response from local video endpoint", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ error: "bad" });
		const message = createMessage({ reply: vi.fn() });
		await handleVideoQueueJob({ message, text: "prompt" }, 1000);
		expect(reactError).toHaveBeenCalledWith(message);
		expect(edit).toHaveBeenCalledWith(expect.anything(), "bad");
	});

	it("handles content violation tasks", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ taskId: "task", numVideosRemaining: 1 });
		requestVideo.mockResolvedValueOnce({
			kind: "sora_content_violation",
			markdown_reason_str: "nope",
		});

		const message = createMessage({ reply: vi.fn(async () => createMessage()) });
		await handleVideoQueueJob({ message, text: "prompt" }, 1000);
		expect(edit).toHaveBeenCalledWith(expect.anything(), expect.stringContaining("nope"));
		expect(reactError).toHaveBeenCalledWith(message);
	});

	it("handles task errors", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ taskId: "task", numVideosRemaining: 1 });
		requestVideo.mockResolvedValueOnce({ error: "bad" });

		const message = createMessage({ reply: vi.fn(async () => createMessage()) });
		await handleVideoQueueJob({ message, text: "prompt" }, 1000);
		expect(reactError).toHaveBeenCalledWith(expect.anything());
		expect(reply).toHaveBeenCalledWith(expect.anything(), "bad");
	});

	it("retries when task is not ready", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ taskId: "task", numVideosRemaining: 1 });
		requestVideo.mockResolvedValueOnce(null).mockResolvedValueOnce({ error: "bad" });

		const message = createMessage({ reply: vi.fn(async () => createMessage()) });
		await handleVideoQueueJob({ message, text: "prompt" }, 1000);
		expect(timeUtils.pause).toHaveBeenCalledWith(1000);
	});

	it("sends media when video is generated", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ taskId: "task", numVideosRemaining: 2 });
		requestVideo.mockResolvedValueOnce({
			downloadable_url: "http://video",
		});

		const message = createMessage({ reply: vi.fn(async () => createMessage()) });
		await handleVideoQueueJob({ message, text: "  prompt  " }, 1000);
		expect(replyWithMedia).toHaveBeenCalledWith(
			message,
			expect.stringContaining("prompt"),
			expect.objectContaining({ media: expect.anything() }),
		);
		expect(reactSuccess).toHaveBeenCalledWith(message);
	});

	it("retries when requestVideo throws", async () => {
		getLocalVideoResponse.mockResolvedValueOnce({ taskId: "task", numVideosRemaining: 1 });
		requestVideo
			.mockRejectedValueOnce(new Error("boom"))
			.mockResolvedValueOnce({ error: "bad" });

		const message = createMessage({ reply: vi.fn(async () => createMessage()) });
		await handleVideoQueueJob({ message, text: "prompt" }, 1000);

		expect(logError).toHaveBeenCalledWith(expect.any(Error));
		expect(timeUtils.pause).toHaveBeenCalledWith(1000);
		expect(requestVideo).toHaveBeenCalledTimes(2);
	});
});
