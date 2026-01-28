import { describe, expect, it, vi } from "vitest";
import { createRequestResponseMocks } from "@/test/setup";
import * as logUtils from "@/util/log";
import * as errorUtils from "@/util/error";
import { draftVideoRequest } from "@/request/get/draftVideo";
import { getVideoDraftResponse } from "@/client/video";

describe("draftVideoRequest", () => {
	it("returns draft responses", async () => {
		const { request, response } = createRequestResponseMocks();
		request.query = { taskId: "task-1" };
		request.pages.soraPage.evaluate = vi.fn().mockResolvedValueOnce({ ok: true });
		vi.spyOn(logUtils, "logInfo").mockImplementation(() => {});

		await draftVideoRequest(request, response);

		expect(request.pages.soraPage.evaluate).toHaveBeenCalledWith(getVideoDraftResponse, {
			body: { taskId: "task-1" },
		});
		expect(response.json).toHaveBeenCalledWith({ ok: true });
	});

	it("handles errors", async () => {
		const { request, response } = createRequestResponseMocks();
		const error = new Error("boom");
		request.pages.soraPage.evaluate = vi.fn().mockRejectedValueOnce(error);
		vi.spyOn(logUtils, "logError").mockImplementation(() => {});
		vi.spyOn(errorUtils, "getErrorMessage").mockImplementation(() => "oops");

		await draftVideoRequest(request, response);

		expect(response.json).toHaveBeenCalledWith({ error: "oops" });
	});
});
