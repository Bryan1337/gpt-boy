import { vi } from "vitest";
import type { Message } from "whatsapp-web.js";
import type { Mock } from "vitest";
import fs from "fs";

process.env.COMMAND_PREFIX = "!";
process.env.BOT_PREFIX = "[BOT]";
process.env.USER_WHATSAPP_ID = "12345";
process.env.API_URL = "http://localhost:3000";
process.env.CHROME_DIR = "C:\\chrome.exe";

export const createFsMock = async (mocks?: Partial<Record<keyof typeof fs, Mock>>) => {
	const fsMock = Object.assign(fs, mocks);
	return fsMock;
};

export function createFetchMock() {
	const fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

export const createMessage = (overrides?: Record<string, unknown>): Message =>
	({
		id: { remote: "id" },
		from: "id",
		body: "",
		reply: vi.fn(async () => createMessage()),
		edit: vi.fn(async () => createMessage()),
		react: vi.fn(async () => {}),
		getChat: vi.fn(async () => ({
			clearState: vi.fn(),
			sendStateTyping: vi.fn(),
		})),
		getContact: vi.fn(async () => ({ pushname: "User" })),
		...overrides,
	}) as unknown as Message;

type MessageUtils = typeof import("@/util/message");

export async function createMessageUtilsMock(mocks?: Partial<Record<keyof MessageUtils, Mock>>) {
	const messageUtils = await import("@/util/message");

	for (const [key, value] of Object.entries(mocks ?? {})) {
		vi.spyOn(messageUtils, key as keyof typeof messageUtils).mockImplementation(value);
	}

	return messageUtils;
}

type WhatsappWebUtil = typeof import("@/util/whatsappWeb");

export async function createWhatsappWebUtilsMock(
	mocks?: Partial<Record<keyof WhatsappWebUtil, Mock>>,
) {
	const whatsappWebUtils = await import("@/util/whatsappWeb");

	for (const [key, value] of Object.entries(mocks ?? {})) {
		vi.spyOn(whatsappWebUtils, key as keyof WhatsappWebUtil).mockImplementation(value);
	}

	return whatsappWebUtils;
}
