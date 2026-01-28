import { afterEach, describe, it, expect, vi } from "vitest";
import qrcode from "qrcode-terminal";
import { qrHandler } from "@/event_handlers/qrHandler";

describe("qrHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("generates a QR code", () => {
		const generate = vi.spyOn(qrcode, "generate").mockImplementation(() => {});
		qrHandler("qr");
		expect(generate).toHaveBeenCalledWith("qr", { small: true });
	});
});
