import { describe, expect, it, vi } from "vitest";
import { clearContextCommand } from "@/command/clearContext";
import * as contextDataHandlers from "@/data_handlers/context/clearContext";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("clearContextCommand", () => {
	const clearContext = vi
		.spyOn(contextDataHandlers, "clearContext")
		.mockImplementation(() => true);
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactSuccess, reactError, reply });

	it("clears context when present", async () => {
		clearContext.mockReturnValueOnce(true);
		const message = createMessage({ id: { remote: "id" } });
		await clearContextCommand({ message, text: "" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("Context cleared"));
	});

	it("handles missing context", async () => {
		clearContext.mockReturnValueOnce(false);
		const message = createMessage({ id: { remote: "id" } });
		await clearContextCommand({ message, text: "" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("Context cleared"));
	});
});
