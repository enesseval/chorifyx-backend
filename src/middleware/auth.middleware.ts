import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

      if (!token) {
         res.status(401).json({
            success: false,
            message: "Yetkisiz erişim",
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
