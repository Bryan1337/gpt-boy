import { afterEach, describe, expect, it, vi } from "vitest";
import { logError, logInfo, logWarning } from "@/util/log";

describe("log utils", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs info, warning, and error", () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		logInfo("info");
		logWarning("warn");
		logError("err");

		expect(logSpy).toHaveBeenCalledTimes(3);
	});
});
