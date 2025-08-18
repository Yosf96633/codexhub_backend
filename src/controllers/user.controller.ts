import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: `All fields are required!` });
    }
    let user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: `User already exist!` });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);

    //Create user.
    user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res
      .status(201)
      .json({ success: true, message: "Sign up successful!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Input fields are required!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Account not found!" });
    }
    const { password: userPassword } = user;
    const isCorrect = await bcryptjs.compare(password, userPassword!);
    if (!isCorrect) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Credentials!" });
    }
    const accessToken = jwt.sign(
      {
        id: user._id,
        name: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET as string
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // 🔒 prevents JS access (XSS safe)
      secure: false, // ✅ only over HTTPS (set false for local dev)
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1,
    });
    let { username, email: emailAddress } = user;
    return res.status(200).json({
      success: true,
      data: { username, email: emailAddress },
      message: "Login successfull!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken");
    const username = req.user?.username;
    return res
      .status(200)
      .json({ success: true, message: `${username} logout successfully` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};
