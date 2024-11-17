import { Router } from "express";
import { getUserById, login, logout, register } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/:id", authMiddleware, getUserById);
router.post("/logout", logout);

export default router;
