import { HTTP_STATUS_CODE_ENUM } from "./status-code.enum";

export class ResponseStatus extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }

  public static BadRequest(message: string): ResponseStatus {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.BAD_REQUEST, message);
  }

  public static Unauthorized(message: string): ResponseStatus {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.UNAUTHORIZE, message);
  }

  public static Forbidden(message: string): ResponseStatus {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.FORBBIDEN, message);
  }

  public static NotFound(message: string): ResponseStatus {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.NOT_FOUND, message);
  }

  public static Unprocessable(message: string): ResponseStatus {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.REQUEST_UNPROCESSABLE, message);
  }

  public static InternalServer(message: string = "Unknown error.") {
    return new ResponseStatus(HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR, message);
  }
}
