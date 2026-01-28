import { describe, expect, it, vi } from "vitest";

vi.mock("chalk", () => ({
	default: {
		blue: (value: string) => value,
		yellow: (value: string) => value,
		red: (value: string) => value,
	},
}));

import { log, logError, logInfo, logWarning } from "@/util/log";

describe("log utils", () => {
	it("logs info, warning, error, and default info", () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const dateSpy = vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue("DATE");

		logInfo("info");
		logWarning("warn");
		logError("error");
		log("default");

		expect(logSpy).toHaveBeenCalledWith("[DATE]", "[INFO]", "info");
		expect(logSpy).toHaveBeenCalledWith("[DATE]", "[WARNING]", "warn");
		expect(logSpy).toHaveBeenCalledWith("[DATE]", "[ERROR]", "error");
		expect(logSpy).toHaveBeenCalledWith("[DATE]", "[INFO]", "default");

		dateSpy.mockRestore();
		logSpy.mockRestore();
	});
});
