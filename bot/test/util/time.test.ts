import { describe, expect, it, vi } from "vitest";
import { formatSeconds, pause } from "@/util/time";

describe("time utils", () => {
	it("formats seconds into human readable units", () => {
		expect(formatSeconds(0)).toBe("0 seconds");
		expect(formatSeconds(61)).toBe("1 minute, 1 second");
		expect(formatSeconds(3661)).toBe("1 hour, 1 minute, 1 second");
		expect(formatSeconds(90061)).toBe("1 day, 1 hour, 1 minute, 1 second");
	});

	it("pauses for the requested duration", async () => {
		vi.useFakeTimers();
		const promise = pause(1000);
		vi.advanceTimersByTime(1000);
		await expect(promise).resolves.toBeUndefined();
		vi.useRealTimers();
	});
});
