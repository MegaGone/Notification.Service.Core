import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class TemplateAlreadyDisabledException {
  constructor() {
    throw ResponseStatus.BadRequest("Template already disabled.");
  }
}
