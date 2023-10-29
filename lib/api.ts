import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { IUser, IUserDb } from "../types";
import { db } from "./db";

dotenv.config();

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

export const saveUserToken = async (
  refreshToken: string | null,
  userId: string,
) => {
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      refreshToken,
    },
  });
  return updatedUser;
};

export const generateTokens = (email: string) => {
  const accessToken = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "4h",
  });

  const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "2d",
  });

  return { accessToken, refreshToken };
};

export const decodeAccessToken = (accessToken: string) => {
  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as Record<string, any>;
    return decodedAccessToken.email as string;
  } catch (error) {
    return null;
  }
};

export const decodeRefreshToken = (refreshToken: string) => {
  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as Record<string, any>;
    return decodedRefreshToken.email as string;
  } catch (error) {
    return null;
  }
};

export const reGenerateTokens = async (refreshToken: string) => {
  try {
    const tokenEmail = decodeRefreshToken(refreshToken);
    if (!tokenEmail) {
      throw new Error("Invalid token");
    }

    const userMatch = await db.user.findUniqueOrThrow({
      where: {
        email: tokenEmail,
        refreshToken,
      },
    });

    const userInfo = { name: userMatch.name, email: userMatch.email };
    const regenerated = generateTokens(userInfo.email);
    await db.user.update({
      where: { id: userMatch.id },
      data: { refreshToken: regenerated.refreshToken },
    });

    return { ...regenerated, userInfo };
  } catch (error) {
    console.log("reGenerateTokens/ Error: ", error);
    return null;
  }
};
