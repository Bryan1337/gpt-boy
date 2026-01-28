import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { clearAllConversationDetails } from "@/data_handlers/conversation/clearAllConversationDetails";
import { CONVERSATION_FILE_PATH } from "@/util/file";

const writeFileSync = vi.fn();
createFsMock({ writeFileSync });

describe("clearAllConversationDetails", () => {
	it("writes an empty array", () => {
		clearAllConversationDetails();
		expect(writeFileSync).toHaveBeenCalledWith(
			CONVERSATION_FILE_PATH,
			JSON.stringify([], null, 2),
		);
	});
});
