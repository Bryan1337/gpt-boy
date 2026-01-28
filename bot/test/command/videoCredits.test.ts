import { describe, expect, it, vi } from "vitest";
import { videoCreditsCommand } from "@/command/videoCredits";
import * as requestUtils from "@/util/request";
import * as timeUtils from "@/util/time";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("videoCreditsCommand", () => {
	const getLocalVideoCreditsResponse = vi
		.spyOn(requestUtils, "getLocalVideoCreditsResponse")
		.mockImplementation(async () => ({}));
	vi.spyOn(timeUtils, "formatSeconds").mockImplementation(() => "1 minute");
	const reactPending = vi.fn();
	const reactSuccess = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactPending, reactSuccess, reply });

	it("responds with reset time when rate limit reached", async () => {
		getLocalVideoCreditsResponse.mockResolvedValueOnce({
			rate_limit_and_credit_balance: {
				estimated_num_videos_remaining: 0,
				rate_limit_reached: true,
				access_resets_in_seconds: 60,
			},
		});

		const message = createMessage();
		await videoCreditsCommand({ message, text: "" });
		expect(reactPending).toHaveBeenCalledWith(message);
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("No video credits remaining"),
		);
	});

	it("responds with remaining credits", async () => {
		getLocalVideoCreditsResponse.mockResolvedValueOnce({
			rate_limit_and_credit_balance: {
				estimated_num_videos_remaining: 2,
				rate_limit_reached: false,
				access_resets_in_seconds: 0,
			},
		});

		const message = createMessage();
		await videoCreditsCommand({ message, text: "" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("2"));
	});
});
