import { Page } from "puppeteer";

declare module "express-serve-static-core" {
	interface Request {
		pages: {
			soraPage: Page;
			chatGptPage: Page;
		};
	}
}
