import { Router } from "express";
import { resendVerifyCode, verifyCode } from "../controllers/verifyController";

const router = Router();

router.post("/verify-code", verifyCode);
router.post("/resend-verify-code", resendVerifyCode);

export default router;
