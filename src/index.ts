import { PORT } from "src/config";
import { Server } from "src/presentation";

const server = new Server(+PORT);
server.start();
