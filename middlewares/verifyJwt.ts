import { RequestHandler } from "express";

import {
  findUserBy,
  decodeAccessToken,
  decodeRefreshToken,
  reGenerateTokens,
  saveUserToken,
} from "../lib/api";
import { db } from "../lib/db";
import { TOKEN } from "../constants";

export const verifyAccessToken: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies[TOKEN.ACCESS_JWT];
  const refreshToken = req.cookies[TOKEN.REFRESH_JWT];

  if (!accessToken && !refreshToken) {
    res.statusMessage = "Not authenticated";
    res.status(401).end();
    return;
  }

  const decodedEmail = decodeAccessToken(accessToken);
  if (!decodedEmail) {
    // not decoded jwt email
    res.statusMessage = "Not authenticated";
    res.status(401).end();
    return;
  }

  const userFound = await findUserBy({ email: decodedEmail });
  if (!userFound) {
    // user not found by matching jwt email
    res.statusMessage = "Not authenticated";
    res.status(401).end();
    return;
  }

  const userInfo = { name: userFound.name, email: userFound.email };
  res.locals.user = userInfo;
  return next();
};

export const refreshAuthTokens: RequestHandler = async (req, res, next) => {
  const isLoggedIn = !!req.cookies[TOKEN.ACCESS_JWT];
  if (isLoggedIn) {
    return next();
  }

  res.locals.user = null;

  // not logged in , but maybe refresh token still exists and valid
  const refreshToken = req.cookies[TOKEN.REFRESH_JWT];
  if (!refreshToken) {
    res.statusMessage = "Not authenticated";
    res.status(401).end();
    return;
  }

  const regenerated = await reGenerateTokens(refreshToken);
  if (!regenerated) {
    // no refresh token or refresh token is not valid
    res.statusMessage = "Not Authenticated";
    res.status(401).end();
    return;
  }

  // regenerated access and refresh tokens based on user info found
  res.locals.user = regenerated.userInfo;

  res.cookie(TOKEN.REFRESH_JWT, regenerated.refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 48 * 60 * 60 * 1000,
  });

  res.cookie(TOKEN.ACCESS_JWT, regenerated.accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 4 * 60 * 60 * 1000,
  });

  next();
};

export const removeAccessToken: RequestHandler = async (req, res, next) => {
  const accessToken = req.cookies[TOKEN.ACCESS_JWT];

  if (!accessToken) return next();

  const decodedEmail = decodeAccessToken(accessToken);
  if (!decodedEmail) return next();

  const userFound = await findUserBy({ email: decodedEmail });
  if (!userFound) return next();

  res.cookie(TOKEN.ACCESS_JWT, accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: -1,
  });

  next();
};

export const removeRefreshToken: RequestHandler = async (req, res, next) => {
  const refreshToken = req.cookies[TOKEN.REFRESH_JWT];
  if (!refreshToken) return next();

  const decodedEmail = decodeRefreshToken(refreshToken);
  if (!decodedEmail) return next();

  const userMatch = await db.user.findUnique({
    where: {
      email: decodedEmail,
      refreshToken,
    },
  });
  if (!userMatch) return next();

  res.cookie(TOKEN.REFRESH_JWT, refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: -1,
  });
  await saveUserToken(null, userMatch.id);

  next();
};
