import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user!.id },
      orderBy: { scheduledAt: "asc" },
      include: { provider: true },
    });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  providerId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
});

router.post("/", validateBody(createSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>;
    const provider = await prisma.provider.findUnique({
      where: { id: body.providerId },
    });
    if (!provider) throw new HttpError(404, "Provider not found");

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user!.id,
        providerId: body.providerId,
        scheduledAt: new Date(body.scheduledAt),
        reason: body.reason,
        notes: body.notes,
        status: "PENDING",
      },
      include: { provider: true },
    });
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  reason: z.string().min(1).max(500).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

router.patch("/:id", validateBody(updateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof updateSchema>;
    const existing = await prisma.appointment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new HttpError(404, "Appointment not found");
    const appointment = await prisma.appointment.update({
      where: { id: existing.id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
      include: { provider: true },
    });
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new HttpError(404, "Appointment not found");
    await prisma.appointment.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
