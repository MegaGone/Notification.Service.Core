import { Request, Response, NextFunction } from "express";

export interface CompanyApiPort {
    register(req: Request, res: Response, next: NextFunction): void;
}
