import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────
  const hashedPassword = await bcryptjs.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      tradingViewId: "admin_tv",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── Tools ───────────────────────────────────────────────────────────────
  const tool1 = await prisma.tool.upsert({
    where: { slug: "smart-money-tracker" },
    update: {},
    create: {
      name: "Smart Money Tracker",
      slug: "smart-money-tracker",
      description:
        "Track institutional money flow with advanced volume analysis. Identify smart money accumulation and distribution patterns in real-time with colour-coded volume bars, delta divergences, and automatic supply/demand zone detection.",
      // TradingView chart screenshot (public Unsplash finance photo)
      imageUrl:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      // TradingView YouTube channel intro — well-known public video
      youtubeUrl: "https://www.youtube.com/watch?v=qJ1687F8sBQ",
      isActive: true,
    },
  });

  const tool2 = await prisma.tool.upsert({
    where: { slug: "trend-reversal-pro" },
    update: {},
    create: {
      name: "Trend Reversal Pro",
      slug: "trend-reversal-pro",
      description:
        "Detect trend reversals early using a proprietary blend of price action signals, RSI divergence, and volume momentum. Configurable alerts notify you the moment a reversal pattern completes, so you're never late to the trade.",
      imageUrl:
        "https://images.unsplash.com/photo-1642790551116-18e4f049e6d3?w=800&q=80",
      youtubeUrl: "https://www.youtube.com/watch?v=EQTHMSa8Can",
      isActive: true,
    },
  });

  const tool3 = await prisma.tool.upsert({
    where: { slug: "auto-fibonacci-zones" },
    update: {},
    create: {
      name: "Auto Fibonacci Zones",
      slug: "auto-fibonacci-zones",
      description:
        "Automatically plots Fibonacci retracement and extension zones on any timeframe by detecting significant swing highs and lows. Includes confluence highlighting so you can instantly spot high-probability entry areas without manual drawing.",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      youtubeUrl: "https://www.youtube.com/watch?v=5-FKXR2n7CE",
      isActive: true,
    },
  });

  console.log(`✅ Tools: ${tool1.name} | ${tool2.name} | ${tool3.name}`);

  // ── Plans ───────────────────────────────────────────────────────────────
  const planData = [
    { name: "Monthly Basic", durationDays: 30, price: 14.99 },
    { name: "Quarterly Basic", durationDays: 90, price: 39.99 },
    { name: "Yearly Basic", durationDays: 365, price: 129.99 },
    { name: "Monthly Standard", durationDays: 30, price: 19.99 },
    { name: "Quarterly Standard", durationDays: 90, price: 49.99 },
    { name: "Yearly Standard", durationDays: 365, price: 179.99 },
    { name: "Monthly Premium", durationDays: 30, price: 29.99 },
    { name: "Quarterly Premium", durationDays: 90, price: 74.99 },
    { name: "Yearly Premium", durationDays: 365, price: 249.99 },
  ];

  await prisma.plan.deleteMany(); // Reset plans

  const createdPlans = [];
  for (const plan of planData) {
    createdPlans.push(await prisma.plan.create({ data: plan }));
  }
  console.log(`✅ Plans: ${planData.length} global plans created`);

  // Link tools to some plans
  await prisma.tool.update({
    where: { id: tool1.id },
    data: { plans: { connect: [{ id: createdPlans[6].id }, { id: createdPlans[7].id }, { id: createdPlans[8].id }] } },
  });
  await prisma.tool.update({
    where: { id: tool2.id },
    data: { plans: { connect: [{ id: createdPlans[3].id }, { id: createdPlans[4].id }, { id: createdPlans[5].id }] } },
  });
  await prisma.tool.update({
    where: { id: tool3.id },
    data: { plans: { connect: [{ id: createdPlans[0].id }, { id: createdPlans[1].id }, { id: createdPlans[2].id }] } },
  });

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
