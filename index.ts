import express, { Express, Request, Response } from "express";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";

import { authRouter } from "./routes/auth";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 5050;
const rpID = "localhost";
const protocol = "http";
const expectedOrigin = `${protocol}://${rpID}:${port}`;

app.use(cors());
app.use(logger("dev"));
app.use(express.json(), express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Express auth");
});

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
