import winston, { format } from 'winston';
const { combine, printf } = format;
import 'winston-mongodb';

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] -> ${level}: ${message}${stack ? `\n${stack}` : ''}`;
});

/**
 * @description
 * this is a logger module, which is used to log error in the file and console
 * @example
 * ```ts
 * import { logger } from '@mdazad/common-utils';
 *
 * logger.info("this is an info");
 * logger.warn("this is a warning");
 * logger.debug("this is a debug");
 * logger.success("this is a success");
 * logger.error("this is an error");
 * ```
 */

export const logger = winston.createLogger({
  format: combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}

/**
 * @description
 * this function is used to add MongoDB transport to the logger
 * @param dbUrl
 * @param logger
 * @param collection
 * @example
 * ```ts
 * import { addMongoDBTransport, logger } from '@mdazad/common-utils';
 *
 * addMongoDBTransport("mongodb://localhost:27017/test", logger);
 * ```
 * @example
 * ```ts
 * import { addMongoDBTransport, logger } from '@mdazad/common-utils';
 *
 * addMongoDBTransport("mongodb://localhost:27017/test", logger, "error_log");
 * ```
 */
export const addMongoDBTransport = (
  dbUrl: string,
  logger: winston.Logger,
  collection = 'error_log'
) => {
  logger.add(
    new winston.transports.MongoDB({
      db: dbUrl,
      collection: collection,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      level: 'error',
      format: format.metadata(),
    })
  );
};

export default logger;
