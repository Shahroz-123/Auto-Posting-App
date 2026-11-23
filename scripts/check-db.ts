import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Checking Neon PostgreSQL Database Connection...");

  // 1. Check Companies
  let companyCount = await prisma.company.count();
  console.log(`Current Companies count: ${companyCount}`);

  if (companyCount === 0) {
    console.log("Database is empty. Seeding initial 8 companies...");
    const sampleCompanies = [
      { name: "Company One", industry: "Technology", initials: "C1", website: "companyone.tech" },
      { name: "Company Two", industry: "Real Estate", initials: "C2", website: "companytworealty.com" },
      { name: "Company Three", industry: "Healthcare", initials: "C3", website: "companythreehealth.org" },
      { name: "Company Four", industry: "E-commerce", initials: "C4", website: "companyfourshop.com" },
      { name: "Company Five", industry: "Education", initials: "C5", website: "companyfiveedu.io" },
      { name: "Company Six", industry: "Finance", initials: "C6", website: "companysixfin.com" },
      { name: "Company Seven", industry: "Fashion", initials: "C7", website: "companysevenwear.com" },
      { name: "Company Eight", industry: "Travel", initials: "C8", website: "companyeighttravel.com" },
    ];

    for (const c of sampleCompanies) {
      await prisma.company.create({ data: c });
    }
    companyCount = await prisma.company.count();
    console.log(`-> Successfully seeded ${companyCount} companies into Neon!`);
  }

  // 2. Check Users
  let userCount = await prisma.user.count();
  console.log(`Current Users count: ${userCount}`);
  if (userCount === 0) {
    console.log("Seeding initial team users...");
    const sampleUsers = [
      { name: "Admin User", email: "admin@markethub.internal", role: "ADMIN" as const },
      { name: "Sarah Jenkins", email: "sarah.j@markethub.internal", role: "STRATEGIST" as const },
      { name: "Hamza Malik", email: "hamza.m@markethub.internal", role: "MANAGER" as const },
      { name: "Elena Rostova", email: "elena.r@markethub.internal", role: "DESIGNER" as const },
      { name: "David Kim", email: "david.k@markethub.internal", role: "COPYWRITER" as const },
    ];
    for (const u of sampleUsers) {
      await prisma.user.create({ data: u });
    }
    userCount = await prisma.user.count();
    console.log(`-> Successfully seeded ${userCount} team members into Neon!`);
  }

  // 3. Check Posts
  let postCount = await prisma.post.count();
  console.log(`Current Posts count: ${postCount}`);
  if (postCount === 0) {
    const firstCompany = await prisma.company.findFirst();
    if (firstCompany) {
      console.log("Seeding initial sample post...");
      await prisma.post.create({
        data: {
          companyId: firstCompany.id,
          caption: "Launching our next-gen marketing intelligence portal for modern teams!",
          hashtags: "#Marketing #Tech #Growth",
          platforms: ["INSTAGRAM", "LINKEDIN"],
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      postCount = await prisma.post.count();
      console.log(`-> Successfully seeded sample post into Neon!`);
    }
  }

  // 4. Check Tasks
  let taskCount = await prisma.task.count();
  console.log(`Current Tasks count: ${taskCount}`);
  if (taskCount === 0) {
    const firstCompany = await prisma.company.findFirst();
    if (firstCompany) {
      console.log("Seeding initial sample task...");
      await prisma.task.create({
        data: {
          companyId: firstCompany.id,
          title: "Review Q4 product launch creatives",
          priority: "HIGH",
          dueDate: new Date(Date.now() + 86400000 * 3),
          completed: false,
        },
      });
      taskCount = await prisma.task.count();
      console.log(`-> Successfully seeded sample task into Neon!`);
    }
  }

  // Summary
  console.log("\n================ DATABASE AUDIT SUMMARY ================");
  console.log(`Companies in DB: ${await prisma.company.count()}`);
  console.log(`Users in DB:     ${await prisma.user.count()}`);
  console.log(`Posts in DB:     ${await prisma.post.count()}`);
  console.log(`Tasks in DB:     ${await prisma.task.count()}`);
  console.log(`Media in DB:     ${await prisma.media.count()}`);
  console.log(`Publish Logs:    ${await prisma.publishLog.count()}`);
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("Database connection error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
