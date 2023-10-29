import { RequestHandler } from "express";
import { ALLOWED_ORIGINS } from "../constants";

export const credentials: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;
  if (!!origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
};
