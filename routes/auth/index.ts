import { Router } from "express";
import dotenv from "dotenv";

import { findUserBy, createNewUser, validatePassword } from "../../lib/api";

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

  res
    .status(200)
    .send({ data: { name: foundUserDb.name, email: foundUserDb.email } });
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

export { authRouter };
