import { describe, expect, it, vi } from "vitest";
import { handleChatQueueJob } from "@/queue/job/chat";
import * as contextDataHandlers from "@/data_handlers/context/getContext";
import * as conversationDataHandlers from "@/data_handlers/conversation/getConversationDetails";
import * as conversationSetDataHandlers from "@/data_handlers/conversation/setConversationDetails";
import * as enabledAudioDataHandlers from "@/data_handlers/enabled_audio/getAudioData";
import * as enabledAudioLanguageHandlers from "@/data_handlers/enabled_audio/getAudioLanguage";
import * as enabledAudioRemoveHandlers from "@/data_handlers/enabled_audio/removeAudioFile";
import * as promptDataHandlers from "@/data_handlers/prompt/storePrompt";
import * as requestUtils from "@/util/request";
import * as ttsUtils from "@/util/tts";
import * as whatsappWebUtils from "@/util/whatsappWeb";
import { createMessage, createMessageUtilsMock } from "@/test/setup";
import { Chat, Contact, MessageMedia } from "whatsapp-web.js";

describe("handleChatQueueJob", () => {
	vi.spyOn(contextDataHandlers, "getContext").mockImplementation(() => null);
	vi.spyOn(conversationDataHandlers, "getConversationDetails").mockImplementation(() => ({
		whatsappIdentifier: "id",
	}));
	const setConversationDetails = vi
		.spyOn(conversationSetDataHandlers, "setConversationDetails")
		.mockImplementation(() => {});
	const hasAudioEnabled = vi
		.spyOn(enabledAudioDataHandlers, "hasAudioEnabled")
		.mockImplementation(async () => false);
	vi.spyOn(enabledAudioLanguageHandlers, "getAudioLanguage").mockImplementation(() => "en");
	vi.spyOn(enabledAudioRemoveHandlers, "removeAudioFile").mockImplementation(async () => {});
	const getLocalChatResponse = vi
		.spyOn(requestUtils, "getLocalChatResponse")
		.mockImplementation(async () => ({}));
	vi.spyOn(ttsUtils, "getTTSAudioFilePath").mockImplementation(async () => "/tmp/audio.wav");
	vi.spyOn(whatsappWebUtils, "getMessageMediaFromFilePath").mockImplementation(
		() => ({ kind: "media" }) as unknown as MessageMedia,
	);
	const reactPending = vi.fn();
	const reactSuccess = vi.fn();
	const reactError = vi.fn();
	const reply = vi.fn();
	const replyWithMessageMedia = vi.fn();
	createMessageUtilsMock({
		reactPending,
		reactSuccess,
		reactError,
		reply,
		replyWithMessageMedia,
	});
	vi.spyOn(promptDataHandlers, "storePrompt").mockImplementation(() => {});

	it("replies with model response when audio is disabled", async () => {
		getLocalChatResponse.mockResolvedValueOnce({
			answer: "hello",
			modelSlug: "gpt",
			chatConversationId: "conv",
		});

		const message = createMessage({
			id: { remote: "id" },
			getChat: vi
				.fn(() => ({}))
				.mockResolvedValueOnce({ clearState: vi.fn() } as unknown as Chat),
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await handleChatQueueJob({ message, text: "hi" });
		expect(setConversationDetails).toHaveBeenCalledWith("id", "conv");
		expect(reply).toHaveBeenCalledWith(message, "(gpt)\n\nhello");
	});

	it("handles unusual activity errors", async () => {
		getLocalChatResponse.mockResolvedValueOnce({
			answer: "Our systems have detected unusual activity coming from your system. Please try again later.",
			modelSlug: "gpt",
			chatConversationId: "conv",
		});

		const message = createMessage({
			id: { remote: "id" },
			getChat: vi.fn().mockResolvedValueOnce({ clearState: vi.fn() } as unknown as Chat),
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await handleChatQueueJob({ message, text: "hi" });
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Something went wrong"),
		);
	});

	it("replies with audio when audio is enabled", async () => {
		hasAudioEnabled.mockResolvedValueOnce(true);
		getLocalChatResponse.mockResolvedValueOnce({
			answer: "hello",
			modelSlug: "gpt",
			chatConversationId: "conv",
		});

		const message = createMessage({
			id: { remote: "id" },
			getChat: vi.fn().mockResolvedValueOnce({ clearState: vi.fn() } as unknown as Chat),
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await handleChatQueueJob({ message, text: "hi" });
		expect(replyWithMessageMedia).toHaveBeenCalledWith(message, expect.objectContaining({}));
	});

	it("replies with error when max attempts reached", async () => {
		getLocalChatResponse.mockRejectedValueOnce(new Error("bad"));

		const message = createMessage({
			id: { remote: "id" },
			getChat: vi.fn().mockResolvedValueOnce({ clearState: vi.fn() } as unknown as Chat),
			getContact: vi.fn().mockResolvedValueOnce({ pushname: "Bob" } as unknown as Contact),
		});

		await handleChatQueueJob({ message, text: "hi" }, 10, 10, 1);
		expect(reactError).toHaveBeenCalledWith(message);
		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("Something went wrong"),
		);
	});
});
