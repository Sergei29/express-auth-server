import express, { Express, Request, Response } from "express";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(logger("dev"));
app.use(express.json(), express.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Express auth");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
