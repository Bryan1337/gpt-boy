import { describe, expect, it, vi } from "vitest";
import { createFetchMock } from "@/test/setup";
import requestUtil from "@/browser-util/request";

describe("request util", () => {
	const fetch = createFetchMock();

	it("throws when response is not ok", async () => {
		fetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Server Error",
		});

		const { request } = await requestUtil();
		await expect(request("http://x", {} as RequestInit)).rejects.toThrow(
			"Request failed with 500: Server Error.",
		);
	});

	it("handles get and post JSON requests", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce({ ok: true }),
		});
		fetch.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce({ ok: "post" }),
		});

		const { get, post } = await requestUtil();
		await expect(get("http://x")).resolves.toEqual({ ok: true });
		await expect(post("http://x")).resolves.toEqual({ ok: "post" });

		expect(fetch).toHaveBeenNthCalledWith(1, "http://x", { method: "GET" });
		expect(fetch).toHaveBeenNthCalledWith(2, "http://x", { method: "POST" });
	});

	it("retries until success", async () => {
		const { retry } = await requestUtil();
		const task = vi.fn().mockRejectedValueOnce(new Error("no")).mockResolvedValueOnce("ok");

		await expect(retry(task, 2)).resolves.toBe("ok");
		expect(task).toHaveBeenCalledTimes(2);
	});

	it("throws when max attempts are reached", async () => {
		const { retry } = await requestUtil();
		const task = vi.fn().mockRejectedValue(new Error("nope"));

		await expect(retry(task, 1)).rejects.toThrow("nope");
		expect(task).toHaveBeenCalledTimes(1);
	});

	it("uses default max attempts when not provided", async () => {
		const { retry } = await requestUtil();
		const task = vi.fn().mockResolvedValueOnce("ok");

		await expect(retry(task)).resolves.toBe("ok");
		expect(task).toHaveBeenCalledTimes(1);
	});

	it("returns access tokens from session calls", async () => {
		fetch.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValueOnce({ accessToken: "token" }),
		});

		const { getAccessToken } = await requestUtil();
		await expect(getAccessToken("http://session")).resolves.toBe("token");
	});
});
