import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class TemplateTypeNotAllowedException {
  constructor() {
    throw ResponseStatus.BadRequest("Template type not allowed.");
  }
}
