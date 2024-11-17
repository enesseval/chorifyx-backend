import { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../models/user.model";
import { IUserCreate, IUserLogin, IUserResponse } from "../types/user.types";
import { sendVerificationMail } from "../config/email";
import { createTokenAndSetCookies } from "../utils/auth.utils";

export const register = async (req: Request<{}, {}, IUserCreate>, res: Response): Promise<void> => {
   try {
      const { name, surname, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         res.status(400).json({ success: false, message: "Bu email adresi zaten kullanılıyor." });
         return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationCode = await sendVerificationMail(email);

      const newUser = await User.create({
         name,
         surname,
         email,
         password: hashedPassword,
         verificationCode,
      });

      const userResponse: IUserResponse = {
         id: newUser._id.toString(),
         name: newUser.name,
         surname: newUser.surname,
         email: newUser.email,
         status: newUser.status,
      };

      res.status(201).json({ success: true, message: "Kullanıcı başarıyla oluşturuldu.", data: userResponse.id });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Kullanıcı oluşturulurken bir hata oluştu.",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};

export const login = async (req: Request<{}, {}, IUserLogin>, res: Response): Promise<void> => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
         res.status(401).json({ success: false, message: "Email hatalı lütfen kontrol ediniz." });
         return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         res.status(401).json({ success: false, message: "Şifre hatalı lütfen kontrol ediniz." });
         return;
      }

      const userResponse: IUserResponse = {
         id: user._id.toString(),
         name: user.name,
         surname: user.surname,
         email: user.email,
         status: user.status,
      };

      await createTokenAndSetCookies(user, res);

      res.status(200).json({
         success: true,
         message: "Giriş başarılı",
         data: {
            userId: userResponse.id,
         },
      });
   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: "Giriş yapılırken bir hata oluştu",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id } = req.params;

      if (req.user?.userId !== id) {
         res.status(403).json({
            success: false,
            message: "Bu bilgilere erişim yetkiniz yoktur.",
         });
         return;
      }

      //şifre hariç tutuluyor
      const user = await User.findById(id).select("-password");

      if (!user) {
         res.status(404).json({
            success: false,
            message: "Kullanıcı bulunamadı.",
         });
         return;
      }

      res.status(200).json({ success: true, data: user });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Kullanıcı bilgileri alınırken bir hata oluştu",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
   try {
      res.clearCookie("access-token", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
      });

      if (req.body.userId) {
         await User.findByIdAndUpdate(req.body.userId, {
            $unset: { refreshToken: 1 },
         });
      }

      res.status(200).json({
         success: true,
         message: "Başarıyla çıkış yapıldı.",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Çıkış yapılırken bir hata oluştu",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};
