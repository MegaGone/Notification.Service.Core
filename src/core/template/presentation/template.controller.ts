import {
  StoreTemplateUseCase,
  UpdateTemplateUseCase,
  DisableTemplateUseCase,
  FindTemplatesPaginatedUseCase,
  FindTemplateByIdentificatorUseCase,
} from "../application";
import { Request, Response } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class TemplateController {
  constructor(
    private readonly _storeTemplateUseCase: StoreTemplateUseCase,
    private readonly _updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly _disableTemplateUseCase: DisableTemplateUseCase,
    private readonly _findTemplatesPaginatedUseCase: FindTemplatesPaginatedUseCase,
    private readonly _findTemplateByIdentificatorUseCase: FindTemplateByIdentificatorUseCase,
  ) {}

  public storeTemplate = (req: Request, res: Response) => {
    const { file } = req;
    const { sender, subject, description, fields, type } = req.body;

    this._storeTemplateUseCase
      .execute({
        type,
        sender,
        fields,
        subject,
        description,
        filename: file?.filename!,
      })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };

  public findTemplateByIdentificator = (req: Request, res: Response) => {
    const { identificator } = req.params;

    this._findTemplateByIdentificatorUseCase
      .execute({ identificator })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };

  public findTemplatesPaginated = (req: Request, res: Response) => {
    const { page, pageSize, enabled } = req.query;

    this._findTemplatesPaginatedUseCase
      .execute({
        page: +page!,
        pageSize: +pageSize!,
        enabled: enabled ? Boolean(enabled) : undefined,
      })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };

  public disableTemplate = (req: Request, res: Response) => {
    const { identificator } = req.params;

    this._disableTemplateUseCase
      .execute({ identificator })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };

  public updateTemplate = (req: Request, res: Response) => {
    const { file } = req;
    const { identificator, sender, subject, description, fields } = req.body;

    this._updateTemplateUseCase
      .execute({ identificator, sender, subject, description, fields, filename: file?.filename! })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };
}
