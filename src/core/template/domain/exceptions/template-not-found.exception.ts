import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class TemplateNotFoundException {
  constructor(private readonly _id: string) {
    throw ResponseStatus.NotFound(`Template ${_id} not found.`);
  }
}
