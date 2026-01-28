import { describe, expect, it } from "vitest";
import { sanitize } from "@/util/string";

describe("sanitize", () => {
	it("trims and normalizes whitespace", () => {
		expect(sanitize("  hello   world  ")).toBe("hello   world");
	});

	it("removes excluded token from the prompt", () => {
		expect(sanitize("!help  me", "!help")).toBe("me");
	});

	it("handles empty input", () => {
		expect(sanitize()).toBe("");
	});
});
