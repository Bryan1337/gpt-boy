import { describe, expect, it } from "vitest";
import request from "supertest";
import { getServer } from "@/util/server";

describe("getServer", () => {
	it("applies CORS headers", async () => {
		const server = getServer();
		server.get("/ping", (_, response) => response.json({ ok: true }));

		const response = await request(server).get("/ping");

		expect(response.status).toBe(200);
		expect(response.body.ok).toBe(true);
		expect(response.headers["access-control-allow-origin"]).toBe("*");
		expect(response.headers["access-control-allow-methods"]).toContain("GET");
		expect(response.headers["access-control-allow-headers"]).toContain("Content-Type");
	});
});
