module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./tsconfig.base.json", "./bot/test/tsconfig.json", "./api/test/tsconfig.json"],
		tsconfigRootDir: __dirname,
	},
	plugins: ["@typescript-eslint"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
};
