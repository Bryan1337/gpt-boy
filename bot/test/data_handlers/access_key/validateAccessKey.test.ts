import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { ACCESS_KEYS_FILE_PATH } from "@/util/file";
import { validateAccessKey } from "@/data_handlers/access_key/validateAccessKey";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("validateAccessKey", () => {
	it("removes a valid key and returns true", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["abc"])));

		const result = validateAccessKey("abc");

		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(ACCESS_KEYS_FILE_PATH, "[]");
	});

	it("returns false for invalid key", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["abc"])));

		const result = validateAccessKey("nope");

		expect(result).toBe(false);
	});
});
