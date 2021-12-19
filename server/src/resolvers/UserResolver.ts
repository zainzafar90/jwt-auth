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

@ObjectType()
class LoginResponse {
  @Field(() => String)
  accessToken: string;
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
