import { describe, expect, it, vi } from "vitest";
import { createFsMock } from "@/test/setup";

const readdirSync = vi.fn();
createFsMock({ readdirSync });

import { getLatestVPNVersionPath } from "@/util/vpn";

describe("getLatestVPNVersionPath", () => {
	it("returns the original path when no folder exists", () => {
		readdirSync.mockReturnValueOnce([]);
		expect(getLatestVPNVersionPath("/vpn")).toBe("/vpn");
	});

	it("returns the first directory path", () => {
		readdirSync.mockReturnValueOnce([
			{ isDirectory: () => false, name: "file.txt" },
			{ isDirectory: () => true, name: "1.0.0" },
		]);

		expect(getLatestVPNVersionPath("/vpn")).toBe("/vpn/1.0.0");
	});
});
