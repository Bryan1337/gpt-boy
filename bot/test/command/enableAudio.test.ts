import { describe, expect, it, vi } from "vitest";
import { enableAudioCommand } from "@/command/enableAudio";
import * as enabledAudioDataHandlers from "@/data_handlers/enabled_audio/enableAudioResponse";
import * as ttsUtils from "@/util/tts";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("enableAudioCommand", () => {
	vi.spyOn(ttsUtils, "getSupportedLanguagesString").mockImplementation(() => "en, nl");
	const enableAudioResponse = vi
		.spyOn(enabledAudioDataHandlers, "enableAudioResponse")
		.mockImplementation(async () => true);
	const reactError = vi.fn();
	const reactSuccess = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactError, reactSuccess, reply });

	it("rejects when no language provided", async () => {
		const message = createMessage({ id: { remote: "id" } });
		await enableAudioCommand({ message, text: "" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("No language given"));
	});

	it("enables when language is supported", async () => {
		const message = createMessage({ id: { remote: "id" } });
		await enableAudioCommand({ message, text: "en" });
		expect(enableAudioResponse).toHaveBeenCalledWith("id", "en");
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Audio responses enabled"),
		);
	});

	it("rejects when language is unsupported", async () => {
		const message = createMessage({ id: { remote: "id" } });
		await enableAudioCommand({ message, text: "xx" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("not supported"));
	});
});
