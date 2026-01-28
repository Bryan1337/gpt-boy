import { describe, expect, it, vi } from "vitest";
import { createRequestResponseMocks } from "@/test/setup";
import * as logUtils from "@/util/log";
import * as errorUtils from "@/util/error";
import { videoRequest } from "@/request/post/video";
import { getVideoResponse } from "@/client/video";

describe("videoRequest", () => {
	it("returns video response data", async () => {
		const { request, response } = createRequestResponseMocks();
		request.body = { prompt: "hi" };
		request.pages.soraPage.evaluate = vi.fn().mockResolvedValueOnce({ taskId: "task" });
		vi.spyOn(logUtils, "logInfo").mockImplementation(() => {});

		await videoRequest(request, response);

		expect(request.pages.soraPage.evaluate).toHaveBeenCalledWith(getVideoResponse, {
			body: { prompt: "hi" },
		});
		expect(response.json).toHaveBeenCalledWith({ taskId: "task" });
	});

	it("handles errors", async () => {
		const { request, response } = createRequestResponseMocks();
		request.pages.soraPage.evaluate = vi.fn().mockRejectedValueOnce(new Error("boom"));
		vi.spyOn(logUtils, "logError").mockImplementation(() => {});
		vi.spyOn(errorUtils, "getErrorMessage").mockImplementation(() => "oops");

		await videoRequest(request, response);

		expect(response.json).toHaveBeenCalledWith({ error: "oops" });
	});
});
