import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { PROMPTS_FILE_PATH } from "@/util/file";
import { storePrompt } from "@/data_handlers/prompt/storePrompt";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("storePrompt", () => {
	it("appends prompt entry", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		storePrompt("name", "id", "prompt", "response", 123);
		expect(writeFileSync).toHaveBeenCalledWith(
			PROMPTS_FILE_PATH,
			expect.stringContaining('"requestDuration": 123'),
		);
	});
});
