import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcryptjs from "bcryptjs";


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
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req:Request , res:Response) =>{
    try {
        const {email , password} = req.body;
       
    } catch (error) {
        
    }
}