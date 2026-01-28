import { describe, expect, it, vi } from "vitest";
import {
	edit,
	reactBlocked,
	reactError,
	reactImage,
	reactPending,
	reactQueued,
	reactSuccess,
	reactTyping,
	reactVideo,
	reply,
	replyWithMedia,
	replyWithMessageMedia,
} from "@/util/message";
import { createMessage } from "@/test/setup";
import { Chat, MessageMedia } from "whatsapp-web.js";

const createMessageStub = () =>
	createMessage({
		reply: vi.fn(),
		edit: vi.fn(),
		react: vi.fn(),
		getChat: vi.fn().mockResolvedValueOnce({ sendStateTyping: vi.fn() } as unknown as Chat),
	});

describe("message utils", () => {
	it("prefixes replies and edits", () => {
		const message = createMessageStub();
		reply(message, "hello");
		edit(message, "update");

		expect(message.reply).toHaveBeenCalledWith("[BOT] hello");
		expect(message.edit).toHaveBeenCalledWith("[BOT] update");
	});

	it("replies with media and message media", () => {
		const message = createMessageStub();
		replyWithMedia(message, "hi", { mentions: [] });
		replyWithMessageMedia(message, { data: "x" } as MessageMedia);

		expect(message.reply).toHaveBeenCalledTimes(2);
	});

	it("react helpers call react", () => {
		const message = createMessageStub();
		reactSuccess(message);
		reactError(message);
		reactBlocked(message);
		reactQueued(message);
		reactPending(message);
		reactImage(message);
		reactVideo(message);

		expect(message.react).toHaveBeenCalledTimes(7);
	});

	it("sends typing state", async () => {
		const sendStateTyping = vi.fn();
		const message = createMessage({
			getChat: vi.fn().mockResolvedValueOnce({ sendStateTyping } as unknown as Chat),
		});

		await reactTyping(message);
		expect(sendStateTyping).toHaveBeenCalled();
	});
});
