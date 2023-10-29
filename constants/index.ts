import { CorsOptions } from "cors";

export const TOKEN = {
  REFRESH_JWT: "refresh_jwt",
  ACCESS_JWT: "access_jwt",
} as const;

export const ALLOWED_ORIGINS = ["http://localhost:3000"];

export const CORS_OPTIONS: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
