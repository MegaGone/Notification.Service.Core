import { Logform } from "winston";
import { SeqTransportOptions } from "src/presentation/logger";

export type WinstonConfig = {
    logLevel?: string;
    applicationName: string;
    seq?: SeqTransportOptions;
    formats: Array<Logform.Format>;
};
