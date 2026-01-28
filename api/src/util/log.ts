import chalk from "chalk";

export enum LogLevel {
	INFO = "INFO",
	WARNING = "WARNING",
	ERROR = "ERROR",
}

export const log = (...messages: string[]) => {
	logInfo(...messages);
};

export const logInfo = (...messages: string[]) => {
	logMessage(chalk.blue(LogLevel.INFO), ...messages);
};

export const logWarning = (...messages: string[]) => {
	logMessage(chalk.yellow(LogLevel.WARNING), ...messages);
};

export const logError = (...messages: string[]) => {
	logMessage(chalk.red(LogLevel.ERROR), ...messages);
};

const logMessage = (logLevel: string, ...messages: string[]) => {
	const currentDate = new Date();
	console.log(`[${currentDate.toLocaleString()}]`, `[${logLevel}]`, ...messages);
};
