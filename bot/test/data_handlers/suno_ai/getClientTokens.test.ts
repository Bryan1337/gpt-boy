import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getSessionTokens } from "@/data_handlers/suno_ai/getClientTokens";

describe("getSessionTokens", () => {
	it("returns parsed tokens", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify(["token"])));
		expect(getSessionTokens()).toEqual(["token"]);
	});
});
