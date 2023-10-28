import { Router } from "express";
import dotenv from "dotenv";

import {
  findUserBy,
  createNewUser,
  formatDateToString,
  validatePassword,
} from "../../lib/api";

dotenv.config();

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.statusMessage = "Wrong payload";
    res.status(401).end();
    return;
  }

  const foundUserDb = await findUserBy({ email });
  if (!foundUserDb) {
    res.statusMessage = "User not found. Go to register";
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

  const { passwordHash, ...userInfo } = formatDateToString(foundUserDb);
  res.status(200).send({ data: userInfo });
});

authRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.statusMessage = "Wrong payload";
    res.status(401).end();
    return;
  }

  const foundUser = await findUserBy({ email });
  if (!!foundUser) {
    res.statusMessage = "User already exists. Go to login";
    res.status(403).end();
    return;
  }

  const newUserDb = await createNewUser({ email, name, password });

  const { passwordHash, ...userInfo } = formatDateToString(newUserDb);

  res.status(200).send({ data: userInfo });
});

export { authRouter };
