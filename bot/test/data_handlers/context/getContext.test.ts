import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getContext } from "@/data_handlers/context/getContext";

describe("getContext", () => {
	it("returns context when found", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ id: "1", context: "ctx" }])),
		);
		expect(getContext("1")).toBe("ctx");
	});

	it("returns null when not found", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		expect(getContext("missing")).toBeNull();
	});
});
