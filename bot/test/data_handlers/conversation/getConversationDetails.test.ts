import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readFileSync = vi.fn();
createFsMock({ readFileSync });

import { getConversationDetails } from "@/data_handlers/conversation/getConversationDetails";

describe("getConversationDetails", () => {
	it("returns existing conversation", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ whatsappIdentifier: "id", gptConversationId: "gpt" }])),
		);
		const result = getConversationDetails("id");
		expect(result.gptConversationId).toBe("gpt");
	});

	it("returns fallback when not found", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		const result = getConversationDetails("id");
		expect(result.whatsappIdentifier).toBe("id");
	});
});
