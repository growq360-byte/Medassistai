import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/error.js";
import { streamChatReply, type ChatTurn } from "../services/claudeService.js";

const router = Router();

router.use(requireAuth);

router.get("/conversations", async (req, res, next) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  title: z.string().min(1).max(120).optional(),
});

router.post("/conversations", validateBody(createSchema), async (req, res, next) => {
  try {
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: req.user!.id,
        title: req.body.title ?? "New conversation",
      },
    });
    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
});

router.get("/conversations/:id", async (req, res, next) => {
  try {
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) throw new HttpError(404, "Conversation not found");
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
});

router.delete("/conversations/:id", async (req, res, next) => {
  try {
    const existing = await prisma.chatConversation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) throw new HttpError(404, "Conversation not found");
    await prisma.chatConversation.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

router.post("/conversations/:id/messages", async (req, res, next) => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) throw new HttpError(404, "Conversation not found");

    // Save the user message first.
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: parsed.data.content,
      },
    });

    // Build history for Claude — filter out empty messages (from failed streams).
    const history: ChatTurn[] = [
      ...conversation.messages
        .filter((m) => m.role !== "SYSTEM" && m.content.trim() !== "")
        .map((m) => ({
          role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        })),
      { role: "user", content: parsed.data.content },
    ];

    // Stream via SSE.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    let assistantText = "";
    try {
      for await (const delta of streamChatReply(history)) {
        assistantText += delta;
        res.write(`data: ${JSON.stringify({ type: "delta", text: delta })}\n\n`);
      }
      if (assistantText.trim()) {
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: "ASSISTANT",
            content: assistantText,
          },
        });
      }
      // Update conversation title on first reply if still default.
      if (
        conversation.title === "New conversation" &&
        conversation.messages.length === 0
      ) {
        const newTitle = parsed.data.content.slice(0, 60);
        await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: { title: newTitle },
        });
      } else {
        await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() },
        });
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    } catch (err) {
      console.error("Stream error:", err);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "AI stream failed" })}\n\n`,
      );
    } finally {
      res.end();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
