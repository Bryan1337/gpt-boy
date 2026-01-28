import { describe, expect, it, vi } from "vitest";
import { getContextCommand } from "@/command/getContext";
import * as contextDataHandlers from "@/data_handlers/context/getContext";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("getContextCommand", () => {
	const getContext = vi.spyOn(contextDataHandlers, "getContext").mockImplementation(() => "ctx");
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	createMessageUtilsMock({ reactSuccess, reactError, reply });

	it("replies with context when found", async () => {
		getContext.mockReturnValueOnce("ctx");
		const message = createMessage({ id: { remote: "id" } });
		await getContextCommand({ message, text: "" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("Current context is"));
	});

	it("replies with error when missing", async () => {
		getContext.mockReturnValueOnce(null);
		const message = createMessage({ id: { remote: "id" } });
		await getContextCommand({ message, text: "" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("No context was found"),
		);
	});
});
