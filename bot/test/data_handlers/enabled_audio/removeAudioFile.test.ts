import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const unlinkSync = vi.fn();
createFsMock({ unlinkSync });

import { removeAudioFile } from "@/data_handlers/enabled_audio/removeAudioFile";

describe("removeAudioFile", () => {
	it("removes file", async () => {
		await removeAudioFile("file.wav");
		expect(unlinkSync).toHaveBeenCalledWith("file.wav");
	});
});
