import { describe, expect, it, vi } from "vitest";
import { messageHandler } from "@/event_handlers/messageHandler";
import * as whitelistDataHandlers from "@/data_handlers/whitelist/checkWhitelistStatus";
import * as commandUtils from "@/command";
import * as logUtils from "@/util/log";
import { createMessage, createMessageUtilsMock } from "@/test/setup";
import { Contact } from "whatsapp-web.js";

describe("messageHandler", () => {
	const getCommandData = vi.spyOn(commandUtils, "getCommandData").mockImplementation(() => null);
	const answerCommandResponse = vi
		.spyOn(commandUtils, "answerCommandResponse")
		.mockImplementation(async () => {});
	const checkWhitelistStatus = vi
		.spyOn(whitelistDataHandlers, "checkWhitelistStatus")
		.mockImplementation(() => true);
	const reactBlocked = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactBlocked, reply });

	it("returns when message is not a command", async () => {
		const message = createMessage({
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await messageHandler(message);
		expect(answerCommandResponse).not.toHaveBeenCalledWith(message);
	});

	it("answers when user is allowed", async () => {
		getCommandData.mockReturnValueOnce({
			command: {
				alwaysAllowed: false,
				handle: vi.fn(),
				description: "desc",
			},
			commandKey: "!help",
		});
		checkWhitelistStatus.mockReturnValueOnce(true);

		const message = createMessage({
			from: "id",
			body: "!help",
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await messageHandler(message);
		expect(answerCommandResponse).toHaveBeenCalledWith(message);
	});

	it("blocks when user is not allowed", async () => {
		getCommandData.mockReturnValueOnce({
			command: {
				alwaysAllowed: false,
				handle: vi.fn(),
				description: "desc",
			},
			commandKey: "!help",
		});
		checkWhitelistStatus.mockReturnValueOnce(false);

		const message = createMessage({
			from: "id",
			body: "!help",
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await messageHandler(message);
		expect(reactBlocked).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("not allowed"));
	});

	it("includes owner id when configured", async () => {
		process.env.OWNER_ID = "owner";
		getCommandData.mockReturnValueOnce({
			command: {
				alwaysAllowed: false,
				handle: vi.fn(),
				description: "desc",
			},
			commandKey: "!help",
		});
		checkWhitelistStatus.mockReturnValueOnce(false);

		const message = createMessage({
			from: "id",
			body: "!help",
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await messageHandler(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("owner"));
		delete process.env.OWNER_ID;
	});

	it("logs errors thrown by handler", async () => {
		const logError = vi.spyOn(logUtils, "logError").mockImplementation(() => {});
		const message = createMessage({
			getContact: vi.fn().mockRejectedValueOnce(new Error("bad")),
		});

		await messageHandler(message);
		expect(logError).toHaveBeenCalledWith(expect.any(Error));
	});
});
