import {createLogger, format, transports} from 'winston'
import * as config from '../config/editorConfig.json'

export const logger = createLogger({
    transports: [new transports.Console()],
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `[${timestamp}] ${level}: ${message}`
        })
    ),
})

logger.level = config.logLevel
