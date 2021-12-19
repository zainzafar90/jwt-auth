import { sign, verify } from "jsonwebtoken";
import { CustomContext } from "../context/custom-context";
import { MiddlewareFn } from "type-graphql";
import { User } from "../entity/User";

export const generateAccessToken = (user: User) => {
  return sign(
    { userId: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

export const generateRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, email: user.email, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

export const isAuthenticated: MiddlewareFn<CustomContext> = (
  { context },
  next
) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("Not authenticated");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.error(error);
    throw new Error("Not authenticated");
  }

  return next();
};
