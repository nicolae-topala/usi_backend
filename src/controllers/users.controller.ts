import { Request, Response } from "express";
import { omit } from "lodash";
import config from "config";

// Utils
import logger from "../utils/logger";
import { sendResetPassword } from "../utils/smtp.utils";
import { signJwt } from "../utils/jwt.utils";

// Services
import {
  changeEmail,
  changePassword,
  findUser,
  getUser,
  createToken,
  resetPassword,
  setNullToken,
} from "../service/user.service";
import { createSession } from "../service/session.service";

// Schemas
import {
  ChangeEmailInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../Schema/users.schema";

export async function changePasswordHandler(
  req: Request<{}, {}, ChangePasswordInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user.id;
    const isValid = await changePassword({ ...req.body, id: userId });

    if (!isValid) return res.status(403).send("Wrong password!");
    return res.send("Password changed successfully!");
  } catch (e: any) {
    logger.error(e);
    return res.status(400).send(e.issues.message);
  }
}

export async function changeEmailHandler(
  req: Request<{}, {}, ChangeEmailInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user.id;
    const isValid = await changeEmail({ ...req.body, id: userId });

    if (!isValid) return res.status(404).send("User doesn't exist !");
    return res.send("Email changed successfully!");
  } catch (e: any) {
    logger.error(e);
    return res.status(400).send(e.issues.message);
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user.id;

    const data = await getUser(userId);
    if (!data) return res.status(404).send("User doesn't exist !");
    return res.send(data);
  } catch (e: any) {
    logger.error(e);
    return res.status(400).send(e.issues.message);
  }
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput["body"]>,
  res: Response
) {
  try {
    const user = await findUser({ ...req.body });

    if (!user)
      return res.status(404).send("There is no user with such username!");

    // If token newer than 5 minutes
    const time = user.createdAt.valueOf() + 5 * 60 * 1000 - Date.now();
    if (time > 0)
      return res
        .status(429)
        .send(
          "You need to wait " +
            (time / 1000).toFixed() +
            " seconds to create a new token!"
        );

    // Create random substring, we use 2,13 to create 11 long string. first 2 characters are 0. , so we don't substract them
    const token = Math.random().toString(36).substring(2, 13);
    const createTokens = await createToken(user.id, token);
    if (!createTokens) {
      return res.send("Could not create token!");
    }

    const sent = await sendResetPassword(user.email, createTokens);
    if (!sent) {
      res.send("Failed to send a token to your email!");
    }
    return res.send("Successfully send a token to your email!");
  } catch (e: any) {
    return res.status(400).send(e.issues.message);
  }
}

export async function resetPasswordHandler(
  req: Request<{}, {}, ResetPasswordInput["body"]>,
  res: Response
) {
  try {
    const user = await findUser({ token: req.body.token });

    if (!user) return res.status(404).send("Invalid token!");

    // If token older than 10 minutes
    if (Date.now() > user.createdAt.valueOf() + 10 * 60 * 1000)
      return res.status(403).send("Token expired!");

    const data = await resetPassword(user.id, req.body.password);
    if (data) await setNullToken(user.id);

    // Create a session
    const session = await createSession(user.id, req.get("user-agent") || "");

    // Create an access token
    const accessToken = signJwt(
      {
        ...omit(user, "username", "email", "status", "createdAt", "token"),
        session: session.id,
      },
      { expiresIn: config.get<string>("accessTokenTtl") }
    );

    // Create a refresh token
    const refreshToken = signJwt(
      {
        ...omit(user, "username", "email", "status", "createdAt", "token"),
        session: session.id,
      },
      { expiresIn: config.get<string>("refreshTokenTtl") }
    );

    // Return access & refresh tokens
    return res.send({ accessToken, refreshToken });
  } catch (e: any) {
    return res.status(400).send(e.issues.message);
  }
}
