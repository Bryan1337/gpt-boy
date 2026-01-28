import { describe, expect, it, vi } from "vitest";
import timeUtil from "@/browser-util/time";

describe("time util", () => {
	it("formats seconds into human readable units", () => {
		const { formatSeconds } = timeUtil();
		expect(formatSeconds(0)).toBe("0 seconds");
		expect(formatSeconds(61)).toBe("1 minute, 1 second");
		expect(formatSeconds(3661)).toBe("1 hour, 1 minute, 1 second");
		expect(formatSeconds(90061)).toBe("1 day, 1 hour, 1 minute, 1 second");
		expect(formatSeconds(2)).toBe("2 seconds");
		expect(formatSeconds(7322)).toBe("2 hours, 2 minutes, 2 seconds");
		expect(formatSeconds(60)).toBe("1 minute");
		expect(formatSeconds(172800)).toBe("2 days");
	});

	it("pauses for the requested duration", async () => {
		const { pause } = timeUtil();
		vi.useFakeTimers();
		const promise = pause(1000);
		vi.advanceTimersByTime(1000);
		await expect(promise).resolves.toBeUndefined();
		vi.useRealTimers();
	});
});
