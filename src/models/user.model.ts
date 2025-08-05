import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      require: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model("User", userSchema);
