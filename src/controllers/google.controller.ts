import axios from "axios";
import { Request, Response } from "express";
import User from "../models/user.model";
import { createTokenAndSetCookies } from "../utils/auth.utils";

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
   try {
      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

      googleAuthUrl.searchParams.append("client_id", process.env.GOOGLE_CLIENT_ID!);
      googleAuthUrl.searchParams.append("redirect_uri", process.env.REDIRECT_URI!);
      googleAuthUrl.searchParams.append("response_type", "code");
      googleAuthUrl.searchParams.append("scope", "email profile");

      res.redirect(googleAuthUrl.toString());
   } catch (error) {
      const errorCode = "AUTH_INIT_FAILED";
      const errorMessage = "Google giriş işlemi başlatılamadı.";

      res.redirect(`${process.env.CLIENT_URL}/error?code=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
   }
};

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
   try {
      const { code } = req.query;

      if (!code) {
         throw new Error("Auth code is missing");
      }

      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
         code,
         client_id: process.env.GOOGLE_CLIENT_ID,
         client_secret: process.env.GOOGLE_CLIENT_SECRET,
         redirect_uri: process.env.REDIRECT_URI,
         grant_type: "authorization_code",
      });

      const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
         headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
         },
      });

      if (!userInfo.data.email || !userInfo.data.verified_email) {
         throw new Error("Google account email is not verified");
      }

      let user = await User.findOne({ email: userInfo.data.email });

      if (user && user.authProvider === "local") {
         // Eğer kullanıcı daha önce normal kayıt olduysa
         return res.redirect(`${process.env.CLIENT_URL}/error?code=EMAIL_IN_USE&message=${encodeURIComponent("Bu email adresi zaten klasik yöntemle kayıtlı. Lütfen şifrenizle giriş yapın.")}`);
      }

      if (!user) {
         user = await User.create({
            name: userInfo.data.given_name,
            surname: userInfo.data.family_name,
            email: userInfo.data.email,
            profileImage: userInfo.data.picture,
            authProvider: "google",
            status: true,
         });
      } else {
         // Mevcut kullanıcının son giriş zamanını güncelle
         user.lastLogin = new Date();
         await user.save();
      }

      await createTokenAndSetCookies(user, res);

      res.redirect(`${process.env.CLIENT_URL}/user/${user._id}`);
   } catch (error) {
      let errorCode = "AUTH_CALLBACK_FAILED";
      let errorMessage = "Google giriş işlemi tamamlanamadı";
      if (error instanceof Error) {
         switch (error.message) {
            case "Auth code is missing":
               errorCode = "MISSING_CODE";
               errorMessage = "Doğrulama kodu eksik";
               break;
            case "Google account email is not verified":
               errorCode = "EMAIL_NOT_VERIFIED";
               errorMessage = "Google hesabınızın email adresi doğrulanmamış";
               break;
            // ... diğer özel hata durumları
         }
      }

      res.redirect(`${process.env.CLIENT_URL}/error?code=${errorCode}&message=${encodeURIComponent(errorMessage)}`);
   }
};
