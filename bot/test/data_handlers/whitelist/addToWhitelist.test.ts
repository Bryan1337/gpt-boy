import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { WHITELIST_FILE_PATH } from "@/util/file";
import { addToWhiteList } from "@/data_handlers/whitelist/addToWhitelist";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("addToWhiteList", () => {
	it("adds missing id", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["a"])));
		const result = addToWhiteList("b");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(WHITELIST_FILE_PATH, '[\n  "a",\n  "b"\n]');
	});

	it("returns false when already whitelisted", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["a"])));
		const result = addToWhiteList("a");
		expect(result).toBe(false);
	});
});
