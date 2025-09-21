import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class TemplateDuplicatedException {
  constructor() {
    throw ResponseStatus.BadRequest("Cannot duplicate templates by description.");
  }
}
