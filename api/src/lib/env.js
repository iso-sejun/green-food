import { HttpError } from "./http-error.js";

export function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new HttpError(
      503,
      `Missing required environment variable: ${name}`,
      { env: name }
    );
  }

  return value;
}

