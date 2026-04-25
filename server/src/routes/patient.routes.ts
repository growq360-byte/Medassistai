import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";
import { toJson, fromJson } from "../lib/arrays.js";

const router = Router();

const updateSchema = z.object({
  dateOfBirth: z.string().datetime().nullable().optional(),
  sex: z.string().nullable().optional(),
  bloodType: z.string().nullable().optional(),
  heightCm: z.number().int().positive().nullable().optional(),
  weightKg: z.number().int().positive().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  emergencyContact: z.string().nullable().optional(),
});

function profileToApi(p: {
  allergies: string;
  medications: string;
  conditions: string;
  [key: string]: unknown;
}) {
  return {
    ...p,
    allergies: fromJson(p.allergies),
    medications: fromJson(p.medications),
    conditions: fromJson(p.conditions),
  };
}

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!profile) throw new HttpError(404, "Profile not found");
    res.json({ profile: profileToApi(profile) });
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, validateBody(updateSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof updateSchema>;
    const data = {
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : body.dateOfBirth,
      sex: body.sex,
      bloodType: body.bloodType,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      allergies: body.allergies ? toJson(body.allergies) : undefined,
      medications: body.medications ? toJson(body.medications) : undefined,
      conditions: body.conditions ? toJson(body.conditions) : undefined,
      emergencyContact: body.emergencyContact,
    };
    const profile = await prisma.patientProfile.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: {
        userId: req.user!.id,
        ...data,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      },
    });
    res.json({ profile: profileToApi(profile) });
  } catch (err) {
    next(err);
  }
});

export default router;
