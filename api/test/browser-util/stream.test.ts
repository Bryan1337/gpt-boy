import { describe, expect, it } from "vitest";
import streamUtil from "@/browser-util/stream";

describe("stream util", () => {
	it("parses streamed responses", async () => {
		const encoder = new TextEncoder();
		const chunks = [
			'data: {"type":"server_ste_metadata","metadata":{"model_slug":"gpt-4"}}\n',
			'data: {"type":"input_message","conversation_id":"c1"}\n',
			'data: {"v":[{"p":"/message/content/parts/0","o":"append","v":"Hello "}]}\n',
			'data: {"v":[{"p":"/message/content/parts/0","o":"append","v":"World"},{"p":"/message/status","v":"finished_successfully"}]}\n',
		];

		const stream = new ReadableStream({
			start(controller) {
				for (const chunk of chunks) {
					controller.enqueue(encoder.encode(chunk));
				}
				controller.close();
			},
		});

		const response = new Response(stream);
		const { parseResponse } = streamUtil();
		const result = await parseResponse(response);

		expect(result.answer).toBe("Hello World");
		expect(result.modelSlug).toBe("gpt-4");
		expect(result.chatConversationId).toBe("c1");
	});

	it("throws when no reader exists", async () => {
		const { parseResponse } = streamUtil();
		const response = { body: null } as Response;
		await expect(parseResponse(response)).rejects.toThrow("No reader");
	});
});
