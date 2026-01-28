import { beforeAll, describe, expect, it, vi } from "vitest";
import { imageCommand } from "@/command/image";
import * as deepAiUtils from "@/util/deepAi";
import { createMessage, createMessageUtilsMock, createWhatsappWebUtilsMock } from "@/test/setup";

describe("imageCommand", () => {
	const generateDeepAiImage = vi
		.spyOn(deepAiUtils, "generateDeepAiImage")
		.mockImplementation(async () => "http://img");

	const getMessageMediaFromUrl = vi.fn(async () => ({ kind: "url" }));
	beforeAll(async () => {
		await createWhatsappWebUtilsMock({ getMessageMediaFromUrl });
	});

	const reactImage = vi.fn();
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	const replyWithMedia = vi.fn();

	createMessageUtilsMock({ reactImage, reactSuccess, reactError, reply, replyWithMedia });

	it("generates image and replies with media", async () => {
		const message = createMessage();
		await imageCommand({ message, text: "cat" });

		expect(reactImage).toHaveBeenCalledWith(message);
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(replyWithMedia).toHaveBeenCalledWith(
			message,
			expect.stringContaining("cat"),
			expect.objectContaining({
				media: expect.anything(),
			}),
		);
	});

	it("handles errors", async () => {
		generateDeepAiImage.mockRejectedValueOnce(new Error("bad"));

		const message = createMessage();
		await imageCommand({ message, text: "cat" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Something went wrong"),
		);
	});
});
