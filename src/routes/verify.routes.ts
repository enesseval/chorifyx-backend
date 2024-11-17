import { Router } from "express";
import { verifyCode } from "../controllers/verifyController";

const router = Router();

router.post("/verify-code", verifyCode);

export default router;
