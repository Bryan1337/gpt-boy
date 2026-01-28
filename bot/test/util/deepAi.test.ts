import { describe, expect, it, vi } from "vitest";
import { createFetchMock } from "@/test/setup";
import { generateDeepAiImage, generateDeepAiVideo } from "@/util/deepAi";
import * as deepAiDataHandlers from "@/data_handlers/deep_ai/getAuthContext";
import * as deepAiKeyUtils from "@/util/deepAiKey";

describe("deepAi utils", () => {
	const fetch = createFetchMock();
	vi.spyOn(deepAiDataHandlers, "getAuth").mockImplementation(() => ({
		sessionId: "s",
		csrfToken: "c",
		messagesToken: "m",
	}));
	vi.spyOn(deepAiKeyUtils, "generateTryItApiKey").mockImplementation(() => "key");

	it("returns image url", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ output_url: "img" }),
		});

		const url = await generateDeepAiImage("cat");
		expect(url).toBe("img");
	});

	it("throws on image error", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ err: "bad" }),
		});

		await expect(generateDeepAiImage("cat")).rejects.toThrow("bad");
	});

	it("returns video url", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ videoUrl: "vid" }),
		});

		const url = await generateDeepAiVideo("cat");
		expect(url).toBe("vid");
	});

	it("throws on video error", async () => {
		fetch.mockResolvedValueOnce({
			json: vi.fn().mockResolvedValueOnce({ status: "bad" }),
		});

		await expect(generateDeepAiVideo("cat")).rejects.toThrow("bad");
	});
});
