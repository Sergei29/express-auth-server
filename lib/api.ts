import bcryptjs from "bcryptjs";

import { IUser, IUserDb } from "../types";
import { db } from "./db";

const hashPassword = async (pw: string) => {
  const salt = await bcryptjs.genSalt(10);
  const hashedPw = await bcryptjs.hash(pw, salt);

  return hashedPw;
};

export const validatePassword = (password: string, passwordHash: string) => {
  return bcryptjs.compare(password, passwordHash);
};

export const findUserBy = async ({
  email,
  id,
}: {
  email?: string;
  id?: string;
}): Promise<IUserDb | null> => {
  if (!email && !id) return null;

  if (!!email) {
    return await db.user.findUnique({ where: { email } });
  } else {
    return await db.user.findUnique({ where: { id } });
  }
};

export const createNewUser = async ({
  password,
  name,
  email,
}: { password: string } & Pick<IUser, "name" | "email">): Promise<IUserDb> => {
  const passwordHash = await hashPassword(password);
  const newUser = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  return newUser;
};

export const formatDateToString = ({
  createdAt,
  updatedAt,
  ...restUser
}: IUserDb): IUser => ({
  ...restUser,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
