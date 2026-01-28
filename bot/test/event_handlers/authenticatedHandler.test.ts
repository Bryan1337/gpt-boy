import { afterEach, describe, it, expect, vi } from "vitest";
import { authenticatedHandler } from "@/event_handlers/authenticatedHandler";
import * as logUtils from "@/util/log";

describe("authenticatedHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs authentication", () => {
		const logInfo = vi.spyOn(logUtils, "logInfo");
		authenticatedHandler();
		expect(logInfo).toHaveBeenCalledWith("Authenticated!");
	});
});
