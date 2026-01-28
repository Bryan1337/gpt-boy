import { describe, expect, it, vi } from "vitest";
import { createRequestResponseMocks } from "@/test/setup";
import * as logUtils from "@/util/log";
import * as errorUtils from "@/util/error";
import { videoCreditsRequest } from "@/request/get/videoCredits";
import { getVideoCreditsResponse } from "@/client/video";

describe("videoCreditsRequest", () => {
	it("returns video credits", async () => {
		const { request, response } = createRequestResponseMocks();
		request.pages.soraPage.evaluate = vi.fn().mockResolvedValueOnce({ credits: 1 });
		vi.spyOn(logUtils, "logInfo").mockImplementation(() => {});

		await videoCreditsRequest(request, response);

		expect(request.pages.soraPage.evaluate).toHaveBeenCalledWith(getVideoCreditsResponse);
		expect(response.json).toHaveBeenCalledWith({ credits: 1 });
	});

	it("handles errors", async () => {
		const { request, response } = createRequestResponseMocks();
		request.pages.soraPage.evaluate = vi.fn().mockRejectedValueOnce(new Error("boom"));
		vi.spyOn(logUtils, "logError").mockImplementation(() => {});
		vi.spyOn(errorUtils, "getErrorMessage").mockImplementation(() => "oops");

		await videoCreditsRequest(request, response);

		expect(response.json).toHaveBeenCalledWith({ error: "oops" });
	});
});
