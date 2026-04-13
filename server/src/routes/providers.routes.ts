import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ providers });
  } catch (err) {
    next(err);
  }
});

export default router;
