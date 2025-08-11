import { Router } from "express";

export interface IServerOptions {
  port: number;
  routes: Router;
  apiVersion: string;
}
