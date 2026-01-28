import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/util/error";

describe("getErrorMessage", () => {
	it("returns error message for Error instances", () => {
		expect(getErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("returns strings as-is", () => {
		expect(getErrorMessage("bad")).toBe("bad");
	});

	it("returns JSON for plain objects", () => {
		expect(getErrorMessage({ ok: true })).toBe('{"ok":true}');
	});

	it("falls back to String() for circular objects", () => {
		const value: Record<string, unknown> = {};
		value.self = value;
		expect(getErrorMessage(value)).toBe("[object Object]");
	});
});
