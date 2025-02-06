import { Logform } from "winston";
import { SeqTransportOptions } from "./seq.type";

export type WinstonConfig = {
  logLevel?: string;
  applicationName: string;
  seq?: SeqTransportOptions;
  formats: Array<Logform.Format>;
};
