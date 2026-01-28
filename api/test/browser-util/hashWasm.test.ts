import { describe, expect, it } from "vitest";
import hashWasmUtilWrapped from "@/browser-util/hashWasm";

describe("hashWasm util wrapper", () => {
	it("wraps the hash-wasm bundle as a string", () => {
		expect(hashWasmUtilWrapped).toContain("module.exports");
	});
});
