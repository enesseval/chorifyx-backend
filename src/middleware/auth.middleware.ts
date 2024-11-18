import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

declare global {
   namespace Express {
      interface Request {
         user?: {
            userId: String;
         };
      }
   }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const token = req.cookies["access-token"];

      console.log("token", token);
      console.log("req", req.params);

      if (!token) {
         if (req.params.id) {
            const user = await User.findById(req.params.id);
            if (user && !user.status) {
               req.user = { userId: user._id.toString() };
               next();
               return;
            }
         }
         res.status(401).json({
            success: false,
            message: "Yetkisiz erirşim",
         });
         return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { userId: string };

      req.user = decoded;

      next();
   } catch (error) {
      res.status(401).json({
         success: false,
         message: "Yetkilendirme başarısız - Geçersiz token",
         error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
   }
};
