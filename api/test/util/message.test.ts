import { describe, expect, it, vi } from "vitest";

vi.mock("uuid", () => ({
	v4: vi.fn(() => "abcdef"),
}));

import { getMessageId } from "@/util/message";

describe("getMessageId", () => {
	it("replaces the first 3 characters", () => {
		expect(getMessageId()).toBe("aaadef");
	});
});
