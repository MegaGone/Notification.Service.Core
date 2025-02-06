import { PORT } from "src/config/global.configuration";
import { Server } from "src/frameworks/webserver/server.model";
import { MainRoutes } from "./frameworks/webserver/routes";

(() => {
  bootstrap();
})();

async function bootstrap() {
  new Server({
    port: +PORT,
    routes: MainRoutes.routes,
  }).start();
}
