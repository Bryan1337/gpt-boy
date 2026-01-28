import { afterEach, describe, it, expect, vi } from "vitest";
import { readyHandler } from "@/event_handlers/readyHandler";
import * as logUtils from "@/util/log";

describe("readyHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs readiness", () => {
		const logInfo = vi.spyOn(logUtils, "logInfo");
		readyHandler();
		expect(logInfo).toHaveBeenCalledWith("Client is ready!");
	});
});
