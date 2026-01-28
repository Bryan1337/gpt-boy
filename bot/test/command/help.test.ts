import { describe, it, expect, vi } from "vitest";
import { helpCommand } from "@/command/help";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

describe("helpCommand", () => {
	const reactSuccess = vi.fn();
	createMessageUtilsMock({ reactSuccess });

	it("replies with formatted commands", async () => {
		const message = createMessage();
		await helpCommand({ message, text: "" });
		expect(reactSuccess).toHaveBeenCalledWith(message);
	});
});
