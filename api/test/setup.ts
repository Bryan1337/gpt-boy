import { vi } from "vitest";
import type { Mock } from "vitest";
import fs from "fs";

const defaultChatRequirements = {
	persona: "chatgpt-freeaccount",
	token: "req-token",
	expire_after: 0,
	expire_at: 0,
	turnstile: { required: false, dx: "" },
	proofofwork: { required: false, seed: "seed", difficulty: "0" },
};

const defaultFactories = {
	stream: () => ({
		parseResponse: vi.fn().mockResolvedValue({
			answer: "",
			modelSlug: "",
			chatConversationId: null,
		}),
	}),
	sentinel: () => ({
		getRequirementsToken: vi.fn().mockResolvedValue("req"),
		getEnforcementToken: vi.fn().mockResolvedValue("enf"),
	}),
	turnstile: () => ({
		getEnforcementToken: vi.fn().mockResolvedValue("turn"),
	}),
	conversationRequest: async () => ({
		chatRequirements: vi.fn().mockResolvedValue(defaultChatRequirements),
		chatConversationId: vi.fn().mockResolvedValue({}),
		chatCompletion: vi.fn().mockResolvedValue({ status: 200 }),
	}),
	request: async () => ({
		retry: vi.fn(async (callback: () => Promise<unknown>) => await callback()),
	}),
	videoRequest: async () => ({
		videoUsageRequest: vi.fn().mockResolvedValue({
			rate_limit_and_credit_balance: {
				rate_limit_reached: false,
				estimated_num_videos_remaining: 1,
			},
		}),
		videoRequest: vi.fn().mockResolvedValue({ id: "task" }),
		videoPendingRequest: vi.fn().mockResolvedValue([]),
		videoDraftRequest: vi.fn().mockResolvedValue({ items: [] }),
	}),
	time: () => ({
		formatSeconds: vi.fn((seconds: number) => `${seconds} seconds`),
		pause: vi.fn(async () => {}),
	}),
};

const asyncFactoryKeys = new Set(["conversationRequest", "request", "videoRequest"]);

type GptBoyUtilsOverrides = Partial<Record<keyof typeof defaultFactories, unknown>>;

const buildFactory = (key: keyof typeof defaultFactories, override?: unknown) => {
	const factory = defaultFactories[key];

	if (typeof override === "function") {
		return override;
	}

	if (override && typeof override === "object") {
		if (asyncFactoryKeys.has(key)) {
			return async () => ({
				...(await factory()),
				...(override as Record<string, unknown>),
			});
		}

		return () => ({
			...(factory() as Record<string, unknown>),
			...(override as Record<string, unknown>),
		});
	}

	return factory;
};

export const createFsMock = async (mocks?: Partial<Record<keyof typeof fs, Mock>>) => {
	const fsMock = Object.assign(fs, mocks);
	return fsMock;
};

export function createFetchMock() {
	const fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

export function setGptBoyUtils(overrides: GptBoyUtilsOverrides = {}): Record<string, unknown> {
	const windowObj = globalThis.window as unknown as Record<string, unknown>;

	const utils = Object.keys(defaultFactories).reduce(
		(acc, key) => {
			const typedKey = key as keyof typeof defaultFactories;
			acc[typedKey] = buildFactory(typedKey, overrides[typedKey]);
			return acc;
		},
		{} as Record<keyof typeof defaultFactories, unknown>,
	);

	windowObj.gptBoyUtils = utils;
	return utils;
}

export function createRequestResponseMocks() {
	const response = { json: vi.fn() };

	const request = {
		body: {},
		query: {},
		pages: {
			chatGptPage: {
				evaluate: vi.fn(),
			},
			soraPage: {
				evaluate: vi.fn(),
			},
		},
	};

	return { request, response };
}

if (!globalThis.window) {
	globalThis.window = { gptBoyUtils: {} } as unknown as Window & typeof globalThis;
}
