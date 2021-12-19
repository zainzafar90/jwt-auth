import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { generateAccessToken, generateRefreshToken } from "./utils/token.utils";

(async () => {
  const app = express();
  app.use(cookieParser());
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;

    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.error(error);
      return res.send({ ok: false, accessToken: "" });
    }

    const user = await User.findOne({ email: payload.email });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    res.cookie("jid", generateRefreshToken(user), {
      httpOnly: true,
    });

    return res.send({
      ok: true,
      accessToken: generateAccessToken(user),
    });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [UserResolver] }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Listen on port 4000");
  });
})();
