import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { hasAudioEnabled } from "@/data_handlers/enabled_audio/getAudioData";

describe("hasAudioEnabled", () => {
	it("returns entry when found", async () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "id", language: "en" }])),
		);
		const result = await hasAudioEnabled("id");
		expect(result).toEqual({ id: "id", language: "en" });
	});

	it("returns false when not found", async () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = await hasAudioEnabled("id");
		expect(result).toBe(false);
	});
});
