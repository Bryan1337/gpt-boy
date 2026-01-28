import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["test/**/*.test.ts"],
		environment: "node",
		setupFiles: ["test/setup.ts"],
		clearMocks: true,
		coverage: {
			provider: "istanbul",
			reporter: ["text", "html", "lcov", "json-summary"],
			reportsDirectory: "coverage",
			include: ["src/**/*.ts"],
			exclude: [
				"src/index.ts",
				"src/browser-util/index.ts",
				"src/browser-util/turnstile.ts",
				"src/browser-util/sentinel.ts",
			],
			thresholds: {
				lines: 95,
				functions: 95,
				branches: 95,
				statements: 95,
			},
		},
	},
	resolve: {
		alias: [
			{ find: "@/test", replacement: path.resolve(__dirname, "test") },
			{ find: "@", replacement: path.resolve(__dirname, "src") },
		],
	},
});
