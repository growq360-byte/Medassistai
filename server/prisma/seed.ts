import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const providers = [
  {
    name: "Dr. Amelia Chen",
    specialty: "General Practice",
    bio: "Family physician with 12 years of experience in primary care and preventative health.",
    email: "amelia.chen@medassist.ai",
    phone: "+1-555-0100",
  },
  {
    name: "Dr. Marcus Okafor",
    specialty: "Cardiology",
    bio: "Board-certified cardiologist focused on heart failure and interventional care.",
    email: "marcus.okafor@medassist.ai",
    phone: "+1-555-0101",
  },
  {
    name: "Dr. Priya Patel",
    specialty: "Dermatology",
    bio: "Specialist in medical and cosmetic dermatology, skin cancer screening.",
    email: "priya.patel@medassist.ai",
    phone: "+1-555-0102",
  },
  {
    name: "Dr. Lucas Hernandez",
    specialty: "Pediatrics",
    bio: "Pediatrician caring for children from birth through adolescence.",
    email: "lucas.hernandez@medassist.ai",
    phone: "+1-555-0103",
  },
  {
    name: "Dr. Sofia Rossi",
    specialty: "Psychiatry",
    bio: "Psychiatrist specializing in anxiety, depression, and cognitive behavioral therapy.",
    email: "sofia.rossi@medassist.ai",
    phone: "+1-555-0104",
  },
  {
    name: "Dr. James Nakamura",
    specialty: "Orthopedics",
    bio: "Orthopedic surgeon with a focus on sports injuries and joint replacement.",
    email: "james.nakamura@medassist.ai",
    phone: "+1-555-0105",
  },
];

async function main() {
  console.log("Seeding providers...");
  for (const p of providers) {
    await prisma.provider.upsert({
      where: { email: p.email },
      update: {},
      create: p,
    });
  }

  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@medassist.ai" },
    update: {},
    create: {
      email: "demo@medassist.ai",
      name: "Demo Patient",
      passwordHash,
      patientProfile: {
        create: {
          dateOfBirth: new Date("1990-06-15"),
          sex: "female",
          bloodType: "O+",
          heightCm: 168,
          weightKg: 65,
          allergies: JSON.stringify(["penicillin"]),
          medications: JSON.stringify(["loratadine 10mg daily"]),
          conditions: JSON.stringify(["seasonal allergies"]),
          emergencyContact: "Jane Doe — +1-555-0199",
        },
      },
    },
  });

  console.log(`Seeded demo user: ${demo.email}`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
