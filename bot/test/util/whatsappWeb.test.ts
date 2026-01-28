import { describe, expect, it, vi } from "vitest";

const whatsappMocks = vi.hoisted(() => {
	const client = vi.fn();
	const LocalAuth = vi.fn();
	const fromFilePath = vi.fn(() => ({ kind: "file" }));
	const fromUrl = vi.fn(async () => ({ kind: "url" }));

	class MessageMedia {
		mimeType: string;
		data: string;
		constructor(mimeType: string, data: string) {
			this.mimeType = mimeType;
			this.data = data;
		}
		static fromFilePath = fromFilePath;
		static fromUrl = fromUrl;
	}

	return {
		client,
		LocalAuth,
		fromFilePath,
		fromUrl,
		MessageMedia,
	};
});

vi.mock("whatsapp-web.js", () => ({
	default: {
		Client: whatsappMocks.client,
		LocalAuth: whatsappMocks.LocalAuth,
		MessageMedia: whatsappMocks.MessageMedia,
	},
	Client: whatsappMocks.client,
	LocalAuth: whatsappMocks.LocalAuth,
	MessageMedia: whatsappMocks.MessageMedia,
}));

import {
	getMessageMediaFromBase64,
	getMessageMediaFromFilePath,
	getMessageMediaFromUrl,
	getWhatsappClient,
} from "@/util/whatsappWeb";

describe("whatsappWeb utils", () => {
	it("creates a client with local auth", () => {
		getWhatsappClient();
		expect(whatsappMocks.client).toHaveBeenCalledWith(
			expect.objectContaining({
				authStrategy: expect.anything(),
				puppeteer: expect.objectContaining({
					executablePath: expect.any(String),
				}),
			}),
		);
		expect(whatsappMocks.LocalAuth).toHaveBeenCalledWith();
	});

	it("loads message media from file path and url", async () => {
		const fileMedia = getMessageMediaFromFilePath("file");
		const urlMedia = await getMessageMediaFromUrl("url");
		const base64Media = getMessageMediaFromBase64("audio/wav", "data");

		expect(fileMedia).toEqual({ kind: "file" });
		expect(urlMedia).toEqual({ kind: "url" });
		expect(base64Media).toBeDefined();
	});
});
