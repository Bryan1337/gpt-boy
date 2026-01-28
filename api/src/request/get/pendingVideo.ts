import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";
import { getPendingVideoResponse } from "@/client/video";
import { getErrorMessage } from "@/util/error";

export async function pendingVideoRequest(request: Request, response: Response) {
	try {
		const { taskId } = request.query as { taskId: string };

		logInfo("Received pending video command", taskId);

		const videoResponse = await request.pages.soraPage.evaluate(getPendingVideoResponse, {
			body: { taskId },
		});

		response.json(videoResponse);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		logError(errorMessage);

		response.json({
			error: errorMessage,
		});
	}
}
