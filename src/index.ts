import { PORT } from "src/config/global.configuration";
import { Server } from "src/frameworks/webserver/server.model";

(() => {
  bootstrap();
})();

async function bootstrap() {
  new Server({
    port: +PORT,
  }).start();
}
