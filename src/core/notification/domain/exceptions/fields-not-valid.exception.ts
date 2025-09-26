import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class FieldsNotValidException {
  constructor() {
    throw ResponseStatus.BadRequest("Fields are not valid.");
  }
}
