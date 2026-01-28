import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMessage, createMessageUtilsMock } from "@/test/setup";

const queueState = vi.hoisted(() => ({
	lastChatJob: null as null | ((cb?: () => void) => Promise<void>),
	lastVideoJob: null as null | ((cb?: () => void) => Promise<void>),
	instanceCounter: 0,
	chatTimeoutHandler: null as
		| null
		| ((event: { detail: { job: unknown; next: () => void } }) => void),
	videoTimeoutHandler: null as
		| null
		| ((event: { detail: { job: unknown; next: () => void } }) => void),
}));

vi.mock("queue", () => {
	class Queue {
		private instanceId = queueState.instanceCounter++;
		addEventListener = vi.fn((event: string, handler: (event: unknown) => void) => {
			if (event !== "timeout") {
				return;
			}
			if (this.instanceId === 0) {
				queueState.chatTimeoutHandler = handler as typeof queueState.chatTimeoutHandler;
				return;
			}
			if (this.instanceId === 1) {
				queueState.videoTimeoutHandler = handler as typeof queueState.videoTimeoutHandler;
			}
		});
		push = vi.fn((job) => {
			if (this.instanceId === 0) {
				queueState.lastChatJob = job;
				return;
			}
			if (this.instanceId === 1) {
				queueState.lastVideoJob = job;
			}
		});
		start = vi.fn();
	}

	return {
		default: Queue,
	};
});

import { addMessageToChatQueue, addMessageToVideoQueue } from "@/queue";
import * as chatQueueJob from "@/queue/job/chat";
import * as videoQueueJob from "@/queue/job/video";

describe("queue index", () => {
	const handleChatQueueJob = vi
		.spyOn(chatQueueJob, "handleChatQueueJob")
		.mockImplementation(async () => {});
	const handleVideoQueueJob = vi
		.spyOn(videoQueueJob, "handleVideoQueueJob")
		.mockImplementation(async () => {});
	const reply = vi.fn();
	const reactError = vi.fn();
	createMessageUtilsMock({ reply, reactError });

	beforeEach(() => {
		queueState.lastChatJob = null;
		queueState.lastVideoJob = null;
		reply.mockClear();
		reactError.mockClear();
	});

	it("adds chat job and invokes handler", async () => {
		const data = { message: createMessage(), text: "" };
		await addMessageToChatQueue(data);
		expect(queueState.lastChatJob).not.toBeNull();
		await queueState.lastChatJob?.();
		expect(handleChatQueueJob).toHaveBeenCalledWith(expect.objectContaining(data), 1, 10, 5000);
	});

	it("adds video job and invokes handler", async () => {
		const data = { message: createMessage(), text: "" };
		await addMessageToVideoQueue(data);
		expect(queueState.lastVideoJob).not.toBeNull();
		await queueState.lastVideoJob?.();
		expect(handleVideoQueueJob).toHaveBeenCalledWith(expect.objectContaining(data), 5000);
	});

	it("handles chat queue timeouts", async () => {
		const message = createMessage();
		const data = { message, text: "" };
		await addMessageToChatQueue(data);

		const next = vi.fn();
		queueState.chatTimeoutHandler?.({ detail: { job: queueState.lastChatJob, next } });

		expect(reply).toHaveBeenCalledWith(message, expect.stringContaining("request timed out"));
		expect(reactError).toHaveBeenCalledWith(message);
		expect(next).toHaveBeenCalled();
	});

	it("handles video queue timeouts", async () => {
		const message = createMessage();
		const data = { message, text: "" };
		await addMessageToVideoQueue(data);

		const next = vi.fn();
		queueState.videoTimeoutHandler?.({ detail: { job: queueState.lastVideoJob, next } });

		expect(reply).toHaveBeenCalledWith(
			message,
			expect.stringContaining("video request timed out"),
		);
		expect(reactError).toHaveBeenCalledWith(message);
		expect(next).toHaveBeenCalled();
	});

	it("ignores chat timeouts without a mapped message", async () => {
		const next = vi.fn();
		queueState.chatTimeoutHandler?.({ detail: { job: () => {}, next } });

		expect(reply).not.toHaveBeenCalled();
		expect(reactError).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});

	it("ignores video timeouts without a mapped message", async () => {
		const next = vi.fn();
		queueState.videoTimeoutHandler?.({ detail: { job: () => {}, next } });

		expect(reply).not.toHaveBeenCalled();
		expect(reactError).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
