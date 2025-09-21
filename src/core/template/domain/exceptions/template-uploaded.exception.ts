import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class UploadFileException {
  constructor() {
    throw ResponseStatus.InternalServer("Cannot upload file.");
  }
}
