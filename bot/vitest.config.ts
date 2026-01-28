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
			exclude: ["src/index.ts"],
		},
	},
	resolve: {
		alias: [
			{ find: "@/test", replacement: path.resolve(__dirname, "test") },
			{ find: "@", replacement: path.resolve(__dirname, "src") },
		],
	},
});
