import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";
import { signToken } from "../middleware/auth.js";

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      patientProfile: { create: {} },
    },
    include: { patientProfile: true },
  });
  const token = signToken({ id: user.id, email: user.email });
  return { user: sanitize(user), token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { patientProfile: true },
  });
  if (!user) throw new HttpError(401, "Invalid credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials");
  const token = signToken({ id: user.id, email: user.email });
  return { user: sanitize(user), token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { patientProfile: true },
  });
  if (!user) throw new HttpError(404, "User not found");
  return sanitize(user);
}

function sanitize<T extends { passwordHash: string }>(user: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}
