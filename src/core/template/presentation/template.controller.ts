import { Request, Response } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { StoreTemplateUseCase } from "../application/store-template/store-template.use-case";
import { DisableTemplateUseCase } from "../application/disable-template/disable-template.use-case";

export class TemplateController {
  constructor(
    private readonly _storeTemplateUseCase: StoreTemplateUseCase,
    private readonly _disableTemplateUseCase: DisableTemplateUseCase,
  ) {}

  public storeTemplate = (req: Request, res: Response) => {
    const { file } = req;
    const { sender, subject, description, fields } = req.body;

    this._storeTemplateUseCase
      .execute({
        sender,
        fields,
        subject,
        description,
        filename: file?.filename!,
      })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };

  public disableTemplate = (req: Request, res: Response) => {
    const { id } = req.params;

    this._disableTemplateUseCase
      .execute({ id })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };
}
