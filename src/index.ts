import { Router } from "express";
import { MServer } from "./framework/server/server.model";
import { API_VERSION, PORT } from "src/configuration/global.configuration";

(() => {
  bootstrap();
})();

async function bootstrap() {
  new MServer({
    port: +PORT,
    routes: Router(),
    apiVersion: API_VERSION,
  }).start();
}
