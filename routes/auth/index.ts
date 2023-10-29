import { Router } from "express";
import dotenv from "dotenv";

import {
  findUserBy,
  createNewUser,
  validatePassword,
  saveUserToken,
  generateTokens,
} from "../../lib/api";
import {
  verifyAccessToken,
  refreshAuthTokens,
  removeAccessToken,
  removeRefreshToken,
} from "../../middlewares/verifyJwt";
import { TOKEN } from "../../constants";

dotenv.config();

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.statusMessage = "Credentials dont match";
    res.status(403).end();
    return;
  }

  const foundUserDb = await findUserBy({ email });
  if (!foundUserDb) {
    res.statusMessage = "Credentials dont match";
    res.status(403).end();
    return;
  }

  const isPasswordMatch = await validatePassword(
    password,
    foundUserDb.passwordHash,
  );

  if (!isPasswordMatch) {
    res.statusMessage = "Credentials dont match.";
    res.status(403).end();
    return;
  }

  const userInfo = { name: foundUserDb.name, email: foundUserDb.email };

  const { refreshToken, accessToken } = generateTokens(foundUserDb.email);

  await saveUserToken(refreshToken, foundUserDb.id);

  res.cookie(TOKEN.REFRESH_JWT, refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 48 * 60 * 60 * 1000,
  });

  res.cookie(TOKEN.ACCESS_JWT, accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 4 * 60 * 60 * 1000,
  });

  res.status(200).send({ data: { ...userInfo, accessToken } });
});

authRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.statusMessage = "Credentials dont match";
    res.status(401).end();
    return;
  }

  const foundUser = await findUserBy({ email });
  if (!!foundUser) {
    res.statusMessage = "Credentials dont match";
    res.status(403).end();
    return;
  }

  const newUserDb = await createNewUser({ email, name, password });

  res
    .status(200)
    .send({ data: { name: newUserDb.name, email: newUserDb.email } });
});

authRouter.get(
  "/whoami",
  verifyAccessToken,
  refreshAuthTokens,
  async (req, res) => {
    const userInfo = res.locals.user;

    if (!userInfo) {
      res.statusMessage = "Not Authenticated";
      res.status(403).end();
      return;
    }

    res.status(200).json({ data: userInfo });
  },
);

authRouter.get("/logout", removeAccessToken, removeRefreshToken, (req, res) => {
  res.statusMessage = "logged out";
  res.status(204).end();
});

export { authRouter };
