import { Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const createTokenAndSetCookies = async (user: any, res: Response) => {
   try {
      const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY!, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ userId: user._id }, process.env.JTW_REFRESH_SECRET_KEY!, { expiresIn: "7d" });

      await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });

      const cookieOptions = {
         httpOnly: true,
         sameSite: "strict" as const,
         maxAge: 60 * 60 * 1000,
      };

      res.cookie("access-token", accessToken, {
         ...cookieOptions,
         secure: process.env.NODE_ENV === "production",
      });

      return { accessToken };
   } catch (error) {
      throw new Error(`Token oluşturulurken bir hata oluştu: ${error}`);
   }
};
