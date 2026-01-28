import { vi } from "vitest";
import type { Mock } from "vitest";
import fs from "fs";

export const createFsMock = async (mocks?: Partial<Record<keyof typeof fs, Mock>>) => {
	const fsMock = Object.assign(fs, mocks);
	return fsMock;
};

export function createFetchMock() {
	const fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

export function setGptBoyUtils(utils: Record<string, unknown>): Record<string, unknown> {
	const windowObj = globalThis.window as unknown as Record<string, unknown>;
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
