
import cors from "cors";
import { DBConnection } from "./Database/dbConnection.js";
import authRouter from "./modules/auth/auth.controller.js";
import postRouter from "./modules/post/post.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import {createHandler} from 'graphql-http/lib/use/express'
import { schema } from "./app.schema.js";


const bootstrap = (app, express) => {
  app.use(cors())
  app.use('/uploads', express.static('./src/uploads'))
  app.use(express.json());
  DBConnection();



app.use('/graphql' , createHandler({schema:schema}))

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use('/posts', postRouter)



  app.get("/", (req, res) => res.send("Hello World!"));
  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "Invalid Routing" });
  });
  app.use(globalErrorHandling);
};

export default bootstrap;   
