import winston, { format } from 'winston';
const { combine, printf } = format;
import 'winston-mongodb';

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] -> ${level}: ${message}${stack ? `\n${stack}` : ''}`;
});

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

export const addMongoDBTransport = (
  dbUrl: string,
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
