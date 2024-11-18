import { Request, Response } from "express";
import User from "../models/user.model";
import { createTokenAndSetCookies } from "../utils/auth.utils";
import { sendVerificationMail } from "../config/email";

export const verifyCode = async (req: Request, res: Response): Promise<void> => {
   try {
      const { id, verificationCode } = req.body;

      if (!id || !verificationCode) {
         res.status(400).json({
            success: false,
            message: "ID ve doğrulama kodu alınırken bir hata oluştu.",
         });
         return;
      }

      const user = await User.findById(id);

      if (!user) {
         res.status(404).json({
            success: false,
            message: "Kullanıcı bulunamadı.",
         });
         return;
      }

      if (user.verificationExpiry && user.verificationExpiry < new Date()) {
         res.status(400).json({
            success: false,
            message: "Doğrulama kodunun süresi dolmuştur.",
         });
         return;
      }

      if (user.verificationCode !== verificationCode) {
         res.status(400).json({
            success: false,
            message: "Geçersiz doğrulama kodu.",
         });
         return;
      }

      const { accessToken } = await createTokenAndSetCookies(user, res);

      if (!accessToken) {
         res.status(400).json({
            success: false,
            message: "Token oluşturulamadı.",
         });
         return;
      }

      await User.findByIdAndUpdate(id, {
         status: true,
         $unset: {
            verificationCode: 1,
            verificationExpiry: 1,
            verifyCodeLimit: 1,
         },
      });

      res.status(201).json({
         success: true,
         message: "Email başarıyla doğrulandı.",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Doğrulama işlemi sırasında bir hata oluştu",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};

export const resendVerifyCode = async (req: Request, res: Response): Promise<void> => {
   const { id } = req.body;

   const user = await User.findById(id);

   if (!user) {
      res.status(404).json({
         success: false,
         message: "Kullanıcı bulunamadı.",
      });
      return;
   }

   if (user.verifyCodeLimit === 0) {
      res.status(400).json({
         success: false,
         message: "Doğrulama kodu gönderim limiti doldu. Lütfen bizimle iletişime geçin.",
      });
      return;
   }

   const verificationCode = await sendVerificationMail(user.email);

   user.verificationCode = verificationCode.toString();
   user.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
   user.verifyCodeLimit = user.verifyCodeLimit - 1;

   await user.save();

   res.status(201).json({
      success: true,
      message: "Doğrulama kodu gönderildi.",
   });
};
