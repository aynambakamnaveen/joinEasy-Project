import express from "express";
import { login, register, authMe, logout } from "../controllers/user.controll.js";
import upload from "../middlewares/upload.js";
import protect from "../middlewares/protect.js";
const router = express.Router();

router.post("/user/login", login);
router.post("/user/logout", logout);
router.post("/user/register", upload.single("ProfileImage"), register);
router.get("/user/auth", protect, authMe);

export default router;
