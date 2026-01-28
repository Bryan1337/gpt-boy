import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { checkWhitelistStatus } from "@/data_handlers/whitelist/checkWhitelistStatus";

describe("checkWhitelistStatus", () => {
	it("returns true for whitelisted id", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["a"])));
		expect(checkWhitelistStatus("a")).toBe(true);
	});

	it("returns false when not present", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		expect(checkWhitelistStatus("a")).toBe(false);
	});
});
