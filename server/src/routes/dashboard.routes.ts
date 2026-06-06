import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const [conversations, messages, assessments, appointments, upcomingAppts] =
      await Promise.all([
        prisma.chatConversation.count({ where: { userId } }),
        prisma.chatMessage.count({
          where: { conversation: { userId } },
        }),
        prisma.symptomAssessment.count({ where: { userId } }),
        prisma.appointment.count({ where: { userId } }),
        prisma.appointment.findMany({
          where: {
            userId,
            status: { in: ["PENDING", "CONFIRMED"] },
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: "asc" },
          take: 3,
          include: { provider: true },
        }),
      ]);

    const recentAssessments = await prisma.symptomAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        symptoms: true,
        urgency: true,
        createdAt: true,
      },
    });

    res.json({
      stats: {
        conversations,
        messages,
        assessments,
        appointments,
      },
      upcomingAppointments: upcomingAppts,
      recentAssessments,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
