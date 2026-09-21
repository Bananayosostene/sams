import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Test@12345";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("✅ Admin user already exists:", existing.email);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email,
        password: hashed,
        role: "admin",
        assignedCourses: [],
        status: "active",
      },
    });
    console.log("✅ Admin user created:", admin.email);
  }

  console.log("─────────────────────────────────");
  console.log("Admin login:", email);
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
