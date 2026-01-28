import { describe, expect, it, vi } from "vitest";
import { getRandomInt, getRandomString } from "@/util/random";

describe("random utils", () => {
	vi.spyOn(Math, "random").mockImplementation(() => 0);

	it("generates a deterministic random string with mocked Math.random", () => {
		expect(getRandomString(4)).toBe("AAAA");
	});

	it("generates an int in range", () => {
		expect(getRandomInt(10, 20)).toBe(10);
	});

	it("uses default bounds when not provided", () => {
		expect(getRandomInt()).toBe(1000000);
	});
});
