import path from "path"

import { DBConnection } from "./Database/dbConnection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import cors from "cors"

const bootstrap = (app, express) => {
  app.use(cors())
  app.use('/uploads', express.static('./src/uploads'))


  app.use(express.json());
  DBConnection();
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.get("/", (req, res) => res.send("Hello World!"));
  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "Invalid Routing" });
  });
  app.use(globalErrorHandling);
};

export default bootstrap;   
