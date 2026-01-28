import { describe, expect, it, vi } from "vitest";
import { disableAudioCommand } from "@/command/disableAudio";
import * as enabledAudioDataHandlers from "@/data_handlers/enabled_audio/disableAudioResponse";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("disableAudioCommand", () => {
	const disableAudioResponse = vi
		.spyOn(enabledAudioDataHandlers, "disableAudioResponse")
		.mockImplementation(async () => true);
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactSuccess, reactError, reply });

	it("disables audio when enabled", async () => {
		disableAudioResponse.mockResolvedValueOnce(true);
		const message = createMessage({ id: { remote: "id" } });
		await disableAudioCommand({ message, text: "" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Audio responses disabled"),
		);
	});

	it("handles already disabled", async () => {
		disableAudioResponse.mockResolvedValueOnce(false);
		const message = createMessage({ id: { remote: "id" } });
		await disableAudioCommand({ message, text: "" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Audio responses already disabled"),
		);
	});
});
