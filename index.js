import path from "node:path";

import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve("./src/config/.env") });

import express from "express";
import bootstrap from "./src/app.controller.js";
import { authentication } from "./src/middleware/Socket/auth.middleware.js";
import { socketConnection } from "./src/Database/models/user.model.js";
import { runIo } from "./src/modules/socket/socket.controller.js";
const app = express();
const port = process.env.PORT || 5000;

bootstrap(app, express);
const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
runIo(httpServer)