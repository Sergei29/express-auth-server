import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.statusMessage = "Wrong payload";
    res.status(401).end();
    return;
  }

  console.log("credentials register: ", { name, email, password });

  res.status(200).send({ data: { id: Date.now().toString(), name, email } });
});

export { authRouter };
