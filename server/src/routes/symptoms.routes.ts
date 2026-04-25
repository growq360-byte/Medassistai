import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { assessSymptoms } from "../services/claudeService.js";
import { toJson, fromJson } from "../lib/arrays.js";

const router = Router();

router.use(requireAuth);

const assessSchema = z.object({
  symptoms: z.array(z.string().min(1)).min(1),
  severity: z.enum(["mild", "moderate", "severe"]),
  duration: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

router.post("/assess", validateBody(assessSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof assessSchema>;
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id },
    });
    const allergies = fromJson(profile?.allergies);
    const medications = fromJson(profile?.medications);
    const conditions = fromJson(profile?.conditions);
    const patientContext = profile
      ? [
          profile.sex ? `Sex: ${profile.sex}` : null,
          profile.dateOfBirth
            ? `DOB: ${profile.dateOfBirth.toISOString().slice(0, 10)}`
            : null,
          allergies.length ? `Allergies: ${allergies.join(", ")}` : null,
          medications.length ? `Medications: ${medications.join(", ")}` : null,
          conditions.length ? `Conditions: ${conditions.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("; ")
      : undefined;

    const result = await assessSymptoms({ ...body, patientContext });

    const saved = await prisma.symptomAssessment.create({
      data: {
        userId: req.user!.id,
        symptoms: toJson(body.symptoms),
        severity: body.severity,
        duration: body.duration,
        notes: body.notes,
        aiAssessment: result.assessment,
        urgency: result.urgency,
      },
    });

    res.status(201).json({
      assessment: { ...saved, symptoms: fromJson(saved.symptoms) },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const items = await prisma.symptomAssessment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({
      history: items.map((i) => ({ ...i, symptoms: fromJson(i.symptoms) })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
