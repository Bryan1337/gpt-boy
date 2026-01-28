import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { CONTEXT_FILE_PATH } from "@/util/file";
import { clearContext } from "@/data_handlers/context/clearContext";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("clearContext", () => {
	it("removes existing context", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "1", context: "ctx" }])),
		);
		const result = clearContext("1");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(CONTEXT_FILE_PATH, "[]");
	});

	it("returns false when id not found", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = clearContext("missing");
		expect(result).toBe(false);
	});
});
