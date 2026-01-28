import { describe, expect, it, vi } from "vitest";

const getSessionTokens = vi.fn(() => ["token"]);
const getClient = vi.fn(async () => ({
	response: { sessions: [{ id: "session" }] },
}));
const getClientTokens = vi.fn(async () => ({ response: { token: "x" } }));
const getClientSessionTouch = vi.fn(async () => ({
	response: { last_active_token: { jwt: "jwt" } },
}));
const getGenerateV2 = vi.fn(async () => ({ ok: true }));

vi.mock("@/data_handlers/suno_ai/getClientTokens", () => ({
	getSessionTokens,
}));

vi.mock("@/util/sunoAi", () => ({
	getClient,
	getClientSessionTouch,
	getClientTokens,
	getGenerateV2,
}));

describe("sunoApi script", () => {
	it("runs the script with mocked dependencies", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await import("@/util/sunoApi");

		expect(getSessionTokens).toHaveBeenCalled();
		expect(getClient).toHaveBeenCalledWith("token");
		expect(getClientTokens).toHaveBeenCalledWith("session", "token");
		expect(getClientSessionTouch).toHaveBeenCalledWith("session", "token");
		expect(getGenerateV2).toHaveBeenCalledWith("Song about a cat", "jwt");
		log.mockRestore();
	});
});
