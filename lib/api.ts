import { IUser, IUserDb } from "../types";
import { db } from "./db";

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
}: { password: string } & Pick<IUser, "name" | "email">) => {
  // const newUser = await db.user.create()
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
