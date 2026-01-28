import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { ENABLED_AUDIO_FILE_PATH } from "@/util/file";
import { disableAudioResponse } from "@/data_handlers/enabled_audio/disableAudioResponse";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("disableAudioResponse", () => {
	it("removes existing entry", async () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([{ id: "id" }])));
		const result = await disableAudioResponse("id");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(ENABLED_AUDIO_FILE_PATH, "[]");
	});

	it("returns false when not found", async () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = await disableAudioResponse("id");
		expect(result).toBe(false);
	});
});
