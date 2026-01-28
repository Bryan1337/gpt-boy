import { describe, expect, it, vi } from "vitest";
import { requestVideo } from "@/util/video";
import * as requestUtils from "@/util/request";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("requestVideo", () => {
	const getLocalPendingVideoResponse = vi
		.spyOn(requestUtils, "getLocalPendingVideoResponse")
		.mockImplementation(async () => ({}));
	vi.spyOn(requestUtils, "getLocalDraftVideoResponse").mockImplementation(async () => ({
		task: { id: "draft" },
	}));
	const edit = vi.fn();
	createMessageUtilsMock({ edit });

	it("returns draft response when task is null", async () => {
		getLocalPendingVideoResponse.mockResolvedValueOnce({ task: null });

		const response = await requestVideo("task", createMessage());
		expect(response).toEqual({ task: { id: "draft" } });
	});

	it("edits message when progress response received", async () => {
		getLocalPendingVideoResponse.mockResolvedValueOnce({ progress: 0.5 });

		const message = createMessage();
		const response = await requestVideo("task", message);
		expect(response).toBeNull();
		expect(edit).toHaveBeenCalledWith(message, "Generating video... (50%)");
	});

	it("returns task response when available", async () => {
		getLocalPendingVideoResponse.mockResolvedValueOnce({ task: { id: "done" } });

		const response = await requestVideo("task", createMessage());
		expect(response).toEqual({ task: { id: "done" } });
	});
});
