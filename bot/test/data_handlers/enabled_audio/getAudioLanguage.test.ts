import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getAudioLanguage } from "@/data_handlers/enabled_audio/getAudioLanguage";

describe("getAudioLanguage", () => {
	it("returns entry when found", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "id", language: "en" }])),
		);
		const result = getAudioLanguage("id");
		expect(result).toEqual({ id: "id", language: "en" });
	});

	it("returns null when not found", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = getAudioLanguage("id");
		expect(result).toBeNull();
	});
});
