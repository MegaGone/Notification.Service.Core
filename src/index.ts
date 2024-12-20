import { PORT } from "src/configuration";
import { Server } from "src/presentation/server";

(() => {
  main();
})();

async function main(): Promise<void> {
  new Server({
    port: PORT,
  }).start();
}
