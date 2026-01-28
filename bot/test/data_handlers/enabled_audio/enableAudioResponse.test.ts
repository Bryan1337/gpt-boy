import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { ENABLED_AUDIO_FILE_PATH } from "@/util/file";
import { enableAudioResponse } from "@/data_handlers/enabled_audio/enableAudioResponse";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("enableAudioResponse", () => {
	it("adds a new entry", async () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = await enableAudioResponse("id", "en");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(
			ENABLED_AUDIO_FILE_PATH,
			expect.stringContaining('"language": "en"'),
		);
	});

	it("updates an existing entry", async () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "id", language: "nl" }])),
		);
		const result = await enableAudioResponse("id", "en");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(
			ENABLED_AUDIO_FILE_PATH,
			expect.stringContaining('"language": "en"'),
		);
	});
});
