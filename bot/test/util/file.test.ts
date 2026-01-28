import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFsMock, createFetchMock } from "@/test/setup";

const writeFileSync = vi.fn();
const existsSync = vi.fn();
const mkdirSync = vi.fn();
createFsMock({ writeFileSync, existsSync, mkdirSync });

vi.mock("uuid", () => ({
	v4: vi.fn(() => "uuid"),
}));

import { createFileIfNotExists, createFolderIfNotExists, saveExternalFile } from "@/util/file";

describe("file utils", () => {
	const fetch = createFetchMock();

	beforeEach(() => {
		existsSync.mockReset();
		mkdirSync.mockReset();
		writeFileSync.mockReset();
	});

	it("creates folder when missing", () => {
		existsSync.mockReturnValueOnce(false);
		createFolderIfNotExists("output");
		expect(mkdirSync).toHaveBeenCalledWith("output", { recursive: true });
	});

	it("creates file when missing", () => {
		existsSync.mockReturnValueOnce(false);
		createFileIfNotExists("output/data.json", []);
		expect(writeFileSync).toHaveBeenCalledWith("output/data.json", "[]");
	});

	it("saves external file and returns local path", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			body: true,
			arrayBuffer: vi.fn().mockResolvedValueOnce(new ArrayBuffer(2)),
		});

		const path = await saveExternalFile("http://x", "png", "/tmp");
		expect(path).toBe("/tmp/uuid.png");
		expect(writeFileSync).toHaveBeenCalledWith("/tmp/uuid.png", expect.any(Buffer));
	});

	it("throws when response is not ok", async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
		});

		await expect(saveExternalFile("http://x", "png", "/tmp")).rejects.toThrow("HTTP error");
	});

	it("throws when response body is missing", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			body: null,
			arrayBuffer: vi.fn(),
		});

		await expect(saveExternalFile("http://x", "png", "/tmp")).rejects.toThrow("No body found");
	});
});
