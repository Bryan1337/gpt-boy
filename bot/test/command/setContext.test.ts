import { describe, expect, it, vi } from "vitest";
import { setContextCommand } from "@/command/setContext";
import * as contextDataHandlers from "@/data_handlers/context/addContext";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("setContextCommand", () => {
	const addContext = vi.spyOn(contextDataHandlers, "addContext").mockImplementation(() => true);
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactSuccess, reactError, reply });

	it("adds context when provided", async () => {
		addContext.mockReturnValueOnce(true);
		const message = createMessage({ id: { remote: "id" } });
		await setContextCommand({ message, text: "ctx" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Context added/updated"),
		);
	});

	it("handles empty context", async () => {
		addContext.mockReturnValueOnce(false);
		const message = createMessage({ id: { remote: "id" } });
		await setContextCommand({ message, text: "" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("No context to add"));
	});
});
