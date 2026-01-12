export type StreamUtil = typeof streamUtil;

const streamUtil = () => {
	enum Status {
		FINISHED = "finished_successfully",
	}

	async function parseResponse(response: Response) {
		const reader = response.body?.getReader();

		if (!reader) {
			throw new Error("No reader");
		}

		const decoder = new TextDecoder();

		let answer = "";
		let modelSlug = "";
		let conversationId = null;

		let done = false;
		while (!done) {
			const result = await reader.read();

			done = result.done;

			if (done) {
				break;
			}

			const value = result.value;

			const decoded = decoder.decode(value, { stream: true });

			const splitMessages = decoded.split("\n").filter(Boolean);

			const dataMessages = splitMessages
				.filter((message) => message.startsWith("data: "))
				.map((message) => {
					try {
						return JSON.parse(message.replace("data: ", ""));
					} catch (error) {
						return null;
					}
				})
				.filter(Boolean);

			for (const dataMessage of dataMessages) {
				if (typeof dataMessage === "string") {
					continue;
				}

				if (dataMessage && dataMessage.type === "server_ste_metadata") {
					modelSlug = dataMessage.metadata.model_slug;
				}

				if (dataMessage && dataMessage.type === "input_message") {
					conversationId = dataMessage.conversation_id;
				}

				if (!dataMessage.v) {
					continue;
				}

				if (typeof dataMessage.v === "string") {
					answer += dataMessage.v;
					continue;
				}

				if (!Array.isArray(dataMessage.v)) {
					continue;
				}

				const statusMessage = dataMessage.v.find(
					({ p }: { p: string }) => p === "/message/status",
				);
				const contentMessage = dataMessage.v.find(
					({ p, o }: { p: string; o: string }) =>
						p === "/message/content/parts/0" && (o === "append" || o === "patch"),
				);

				console.log({
					v: dataMessage.v,
					statusMessage,
					contentMessage,
				});

				if (contentMessage) {
					answer += contentMessage.v;
				}

				if (statusMessage?.v === Status.FINISHED) {
					break;
				}
			}
		}

		return {
			answer,
			modelSlug,
			chatConversationId: conversationId,
		};
	}

	return { parseResponse };
};

export default streamUtil;
