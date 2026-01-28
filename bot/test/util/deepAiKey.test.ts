import { afterEach, describe, expect, it, vi } from "vitest";
import { generateTryItApiKey } from "@/util/deepAiKey";

describe("generateTryItApiKey", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("generates a key with the expected prefix and random suffix", () => {
		vi.spyOn(Math, "random").mockReturnValueOnce(0.123);
		const key = generateTryItApiKey("agent");
		expect(key.startsWith("tryit-")).toBe(true);
		expect(key.includes("tryit-")).toBe(true);
	});
});
