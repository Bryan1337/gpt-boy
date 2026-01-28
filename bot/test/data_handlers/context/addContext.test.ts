import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { CONTEXT_FILE_PATH } from "@/util/file";
import { addContext } from "@/data_handlers/context/addContext";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("addContext", () => {
	it("adds new context entry", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = addContext("id", "ctx");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(
			CONTEXT_FILE_PATH,
			expect.stringContaining('"context": "ctx"'),
		);
	});

	it("returns false when context missing", () => {
		const result = addContext("", "");
		expect(result).toBe(false);
	});

	it("updates existing context entry", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "id", context: "old" }])),
		);
		const result = addContext("id", "new");
		expect(result).toBe(true);
		expect(writeFileSync).toHaveBeenCalledWith(
			CONTEXT_FILE_PATH,
			expect.stringContaining('"context": "new"'),
		);
	});
});
