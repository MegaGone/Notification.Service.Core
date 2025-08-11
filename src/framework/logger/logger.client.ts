import {
  createLogger,
  Logger,
  format as WinstonFormat,
  transport as WinstonTransport,
  transports as WinstonTransports,
} from "winston";
import {
  WINSTON_APPLICATION_NAME,
  WINSTON_DEFAULT_LOG_LEVEL,
  WINSTON_DEFAULT_DATE_FORMAT,
} from "src/configuration/logger.configuration";
import { SeqTransport } from "@datalust/winston-seq";
import { WinstonConfig } from "./types/winston.type";
import { NODE_ENV } from "src/configuration/global.configuration";

export class LoggerClient {
  private _logger: Logger;

  constructor(
    settings: WinstonConfig = {
      applicationName: WINSTON_APPLICATION_NAME,
      formats: [
        WinstonFormat.errors({ stack: true }),
        WinstonFormat.timestamp({ format: WINSTON_DEFAULT_DATE_FORMAT }),
        WinstonFormat.json(),
      ],
      logLevel: WINSTON_DEFAULT_LOG_LEVEL,
    },
  ) {
    const transports: Array<WinstonTransport> = [];

    if (NODE_ENV === "development") {
      transports.push(
        new WinstonTransports.Console({
          format: WinstonFormat.simple(),
        }),
      );
    }

    if (settings?.seq?.serverURL) {
      transports.push(
        new SeqTransport({
          serverUrl: settings.seq.serverURL,
          apiKey: settings.seq.apiKey || "",
          onError: (error) => {
            console.error("[ERROR][LOGGER] ", error);
          },
          handleExceptions: settings.seq?.handleExceptions || true,
          handleRejections: settings.seq?.handleRejections || true,
        }),
      );
    }

    this._logger = createLogger({
      format: WinstonFormat.combine(...settings.formats),
      defaultMeta: { application: settings.applicationName },
      transports,
      level: settings.logLevel,
    });
  }

  public error(message: string, meta?: Record<string, unknown>) {
    this._logger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>) {
    this._logger.warn(message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>) {
    this._logger.info(message, meta);
  }

  public http(message: string, meta?: Record<string, unknown>) {
    this._logger.http(message, meta);
  }
}
