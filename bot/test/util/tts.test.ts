import { describe, expect, it, vi } from "vitest";

const save = vi.fn((_path: string, _text: string, cb: () => void) => cb());

vi.mock("node-gtts", () => ({
	default: vi.fn(() => ({
		save,
	})),
}));

vi.mock("uuid", () => ({
	v4: vi.fn(() => "uuid"),
}));

vi.mock("@/util/file", () => ({
	AUDIO_FILES_PATH: "/tmp/audio",
}));

import { getSupportedLanguagesString, getTTSAudioFilePath } from "@/util/tts";

describe("tts utils", () => {
	it("generates audio file path and calls gtts save", async () => {
		const path = await getTTSAudioFilePath("hello", "en");
		expect(path).toBe("/tmp/audio/uuid.wav");
		expect(save).toHaveBeenCalledWith("/tmp/audio/uuid.wav", "hello", expect.any(Function));
	});

	it("returns supported languages string", () => {
		const languages = getSupportedLanguagesString();
		expect(languages).toContain("en");
	});

	it("rejects when gtts throws", async () => {
		save.mockImplementationOnce(() => {
			throw new Error("bad");
		});

		await expect(getTTSAudioFilePath("hello", "en")).rejects.toThrow("bad");
	});
});
