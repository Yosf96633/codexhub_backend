import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { MyJwtPayload } from "../types/express";
export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.cookies)
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    console.log(accessToken);
    const decodedToken = (await jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    )) as MyJwtPayload;
    console.log(decodedToken);
    if (!decodedToken) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid access token!` });
    }
    req.user = {
      id: decodedToken.id,
      username: decodedToken.username,
      email: decodedToken.email,
    };
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};
