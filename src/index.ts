import { MainRouter } from "./framework/server/routes";
import { MServer } from "./framework/server/server.model";
import { API_VERSION, PORT } from "src/configuration/global.configuration";

(() => {
  bootstrap();
})();

async function bootstrap() {
  new MServer({
    port: +PORT,
    routes: MainRouter.routes(),
    apiVersion: API_VERSION,
  }).start();
}
