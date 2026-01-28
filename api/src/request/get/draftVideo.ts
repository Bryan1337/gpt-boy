import { Request, Response } from "express";
import { logError, logInfo } from "@/util/log";
import { getVideoDraftResponse } from "@/client/video";
import { getErrorMessage } from "@/util/error";

export async function draftVideoRequest(request: Request, response: Response) {
	try {
		const { taskId } = request.query as { taskId: string };

		logInfo("Received draft video command", taskId);

		const draftResponse = await request.pages.soraPage.evaluate(getVideoDraftResponse, {
			body: { taskId },
		});

		response.json(draftResponse);
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		logError(errorMessage);

		response.json({
			error: errorMessage,
		});
	}
}
