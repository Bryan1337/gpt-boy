import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getAuth, getAuths } from "@/data_handlers/deep_ai/getAuthContext";

describe("deep ai auth", () => {
	it("returns all auths", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ sessionId: "s", csrfToken: "c", messagesToken: "m" }])),
		);
		const auths = getAuths();
		expect(auths.length).toBe(1);
	});

	it("returns the first auth", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ sessionId: "s", csrfToken: "c", messagesToken: "m" }])),
		);
		const auth = getAuth();
		expect(auth.sessionId).toBe("s");
	});
});
