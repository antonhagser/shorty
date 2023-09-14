import { createLogger, format, transports, Logger, addColors } from "winston";

// Set up winston logger
export const customLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

export function createCustomLogger(): Logger {
    const logger = createLogger({
        level: "debug",
        levels: customLevels,
        format: format.combine(format.timestamp(), format.json()),
        transports: [
            new transports.Console({
                format: format.combine(format.colorize(), format.simple()),
            }),
            new transports.File({
                filename: "logs/error.log",
                level: "error",
            }),
            new transports.File({
                filename: "logs/combined.log",
            }),
        ],
    });

    addColors({
        fatal: "red",
        error: "red",
        warn: "yellow",
        info: "green",
        debug: "blue",
        trace: "magenta",
    });

    return logger;
}
