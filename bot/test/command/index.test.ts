import { describe, expect, it } from "vitest";
import { getCommandData, getFormattedCommands } from "@/command";
import { createMessage } from "@/test/setup";

describe("command index", () => {
	it("matches command alias and ignores prefixed name when commandAlias exists", () => {
		const messageAlias = createMessage({ body: "@me hello" });
		const messagePrefixed = createMessage({ body: "!chat hello" });

		expect(getCommandData(messageAlias)?.commandKey).toBe("@me");
		expect(getCommandData(messagePrefixed)).toBeNull();
	});

	it("matches prefixed command for normal commands", () => {
		const message = createMessage({ body: "!help" });
		expect(getCommandData(message)?.commandKey).toBe("!help");
	});

	it("formats commands with alias", () => {
		const commands = getFormattedCommands();
		expect(commands).toContain("@me");
	});
});
