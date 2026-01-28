import { describe, expect, it } from "vitest";
import { normalizeProgress } from "@/util/number";

describe("normalizeProgress", () => {
	it("returns 0 for null or NaN", () => {
		expect(normalizeProgress(null)).toBe(0);
		expect(normalizeProgress(Number.NaN)).toBe(0);
	});

	it("clamps values to 0-1 and rounds to 2 decimals", () => {
		expect(normalizeProgress(-1)).toBe(0);
		expect(normalizeProgress(0.1234)).toBe(12.34);
		expect(normalizeProgress(1)).toBe(100);
		expect(normalizeProgress(1.5)).toBe(100);
	});
});
