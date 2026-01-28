import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";
import { getVideoCreditsResponse } from "@/client/video";
import { getErrorMessage } from "@/util/error";

export async function videoCreditsRequest(request: Request, response: Response) {
	try {
		logInfo("Received video credits command");

		const videoResponse = await request.pages.soraPage.evaluate(getVideoCreditsResponse);

		response.json(videoResponse);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		logError(errorMessage);

		response.json({
			error: errorMessage,
		});
	}
}
