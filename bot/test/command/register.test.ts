import { describe, expect, it, vi } from "vitest";
import { registerCommand } from "@/command/register";
import * as accessKeyDataHandlers from "@/data_handlers/access_key/validateAccessKey";
import * as whitelistDataHandlers from "@/data_handlers/whitelist/addToWhitelist";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("registerCommand", () => {
	const validateAccessKey = vi
		.spyOn(accessKeyDataHandlers, "validateAccessKey")
		.mockImplementation(() => true);
	const addToWhiteList = vi
		.spyOn(whitelistDataHandlers, "addToWhiteList")
		.mockImplementation(() => true);
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactSuccess, reactError, reply });

	it("registers with valid key", () => {
		validateAccessKey.mockReturnValueOnce(true);
		const message = createMessage({ from: "id" });
		registerCommand({ message, text: "key" });
		expect(addToWhiteList).toHaveBeenCalledWith("id");
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("Registered"));
	});

	it("rejects invalid key", () => {
		validateAccessKey.mockReturnValueOnce(false);
		const message = createMessage({ from: "id" });
		registerCommand({ message, text: "key" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Invalid registration key"),
		);
	});
});
