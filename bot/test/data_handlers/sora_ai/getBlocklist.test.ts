import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getBlocklist } from "@/data_handlers/sora_ai/getBlocklist";

describe("getBlocklist", () => {
	it("returns parsed blocklist", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([{ id: "u", reason: "r" }])));
		expect(getBlocklist()).toEqual([{ id: "u", reason: "r" }]);
	});
});
