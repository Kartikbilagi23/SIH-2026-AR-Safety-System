import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate, type AuthRequest } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user!.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;