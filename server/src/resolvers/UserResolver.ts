import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { compare, hash } from "bcryptjs";

import { User } from "../entity/User";

import { CustomContext } from "../context/custom-context";
import {
  generateRefreshToken,
  generateAccessToken,
  isAuthenticated,
} from "../utils/token.utils";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query()
  hello(): string {
    return "Hello";
  }
  @Query()
  @UseMiddleware(isAuthenticated)
  bye(@Ctx() { payload }: CustomContext): string {
    return `Your user id: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: CustomContext) {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: CustomContext) {
    res.cookie("jid", "", {
      httpOnly: true,
    });

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: CustomContext
  ): Promise<LoginResponse | Error> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return new Error("User not found");
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      return new Error("Wrong password");
    }

    res.cookie("SameSite", "None");

    res.cookie("jid", generateRefreshToken(user), {
      httpOnly: true,
    });

    return {
      accessToken: generateAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);
    await User.insert({ email: email, password: hashedPassword });
    try {
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);
    return true;
  }
}
