import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";

import { credentials } from "./middlewares/credentials";
import { authRouter } from "./routes/auth";
import { CORS_OPTIONS } from "./constants";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 5050;

app.use(credentials);
app.use(cors(CORS_OPTIONS));
app.use(logger("dev"));
app.use(express.json(), express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Express auth");
});

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
