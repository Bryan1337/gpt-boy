import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";
import { CONVERSATION_FILE_PATH } from "@/util/file";
import { setConversationDetails } from "@/data_handlers/conversation/setConversationDetails";

const readFileSync = vi.fn();
const writeFileSync = vi.fn();
createFsMock({ readFileSync, writeFileSync });

describe("setConversationDetails", () => {
	it("adds a new conversation entry", () => {
		readFileSync.mockReturnValueOnce(Buffer.from(JSON.stringify([])));
		setConversationDetails("id", "gpt");
		expect(writeFileSync).toHaveBeenCalledWith(
			CONVERSATION_FILE_PATH,
			expect.stringContaining('"gptConversationId": "gpt"'),
		);
	});

	it("updates existing conversation entry", () => {
		readFileSync.mockReturnValueOnce(
			Buffer.from(JSON.stringify([{ whatsappIdentifier: "id", gptConversationId: "old" }])),
		);
		setConversationDetails("id", "gpt");
		expect(writeFileSync).toHaveBeenCalledWith(
			CONVERSATION_FILE_PATH,
			expect.stringContaining('"gptConversationId": "gpt"'),
		);
	});

	it("returns early when chat id is missing", () => {
		setConversationDetails("", "gpt");
		expect(writeFileSync).not.toHaveBeenCalled();
	});
});
