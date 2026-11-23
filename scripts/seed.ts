import "dotenv/config";
import { prisma } from "../lib/prisma";

async function seed() {
  console.log("Seeding full database data into Neon PostgreSQL...");

  // 1. Ensure Companies
  const existingCompanies = await prisma.company.findMany();
  let companyMap = new Map();

  if (existingCompanies.length === 0) {
    const companiesToCreate = [
      { name: "Company One", industry: "Technology", initials: "C1", website: "companyone.tech" },
      { name: "Company Two", industry: "Real Estate", initials: "C2", website: "companytworealty.com" },
      { name: "Company Three", industry: "Healthcare", initials: "C3", website: "companythreehealth.org" },
      { name: "Company Four", industry: "E-commerce", initials: "C4", website: "companyfourshop.com" },
      { name: "Company Five", industry: "Education", initials: "C5", website: "companyfiveedu.io" },
      { name: "Company Six", industry: "Finance", initials: "C6", website: "companysixfin.com" },
      { name: "Company Seven", industry: "Fashion", initials: "C7", website: "companysevenwear.com" },
      { name: "Company Eight", industry: "Travel", initials: "C8", website: "companyeighttravel.com" },
    ];
    for (const c of companiesToCreate) {
      const created = await prisma.company.create({ data: c });
      companyMap.set(created.id, created);
    }
  } else {
    for (const c of existingCompanies) {
      companyMap.set(c.id, c);
    }
  }

  const allCompanies = await prisma.company.findMany();
  const c1 = allCompanies[0]?.id;
  const c2 = allCompanies[1]?.id || c1;
  const c3 = allCompanies[2]?.id || c1;
  const c4 = allCompanies[3]?.id || c1;
  const c5 = allCompanies[4]?.id || c1;
  const c6 = allCompanies[5]?.id || c1;
  const c7 = allCompanies[6]?.id || c1;
  const c8 = allCompanies[7]?.id || c1;

  // 2. Ensure Users / Team
  const userCount = await prisma.user.count();
  if (userCount <= 1) {
    const sampleUsers = [
      { name: "Admin User", email: "admin@markethub.internal", role: "ADMIN" as const },
      { name: "Sarah Jenkins", email: "sarah.j@markethub.internal", role: "STRATEGIST" as const },
      { name: "Hamza Malik", email: "hamza.m@markethub.internal", role: "MANAGER" as const },
      { name: "Elena Rostova", email: "elena.r@markethub.internal", role: "DESIGNER" as const },
      { name: "David Kim", email: "david.k@markethub.internal", role: "COPYWRITER" as const },
      { name: "Ayesha Khan", email: "ayesha.k@markethub.internal", role: "MANAGER" as const },
    ];
    for (const u of sampleUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
    }
  }

  // 3. Ensure Posts
  const postCount = await prisma.post.count();
  if (postCount < 5) {
    const postsData = [
      {
        companyId: c1,
        caption: "Excited to launch our revolutionary cloud AI assistant for modern teams! Boost productivity by 40% with zero setup.",
        hashtags: "#TechInnovation #AI #CloudComputing #Productivity",
        platforms: ["LINKEDIN", "FACEBOOK"] as any,
        status: "PUBLISHED" as const,
        publishedAt: new Date("2026-11-18T10:30:00Z"),
      },
      {
        companyId: c4,
        caption: "Black Friday early bird VIP deals are here! Up to 60% off everything in stock for the next 48 hours only.",
        hashtags: "#Ecommerce #Sale #FashionDeals #ShopNow",
        platforms: ["INSTAGRAM", "TIKTOK"] as any,
        status: "PUBLISHED" as const,
        publishedAt: new Date("2026-11-17T16:15:00Z"),
      },
      {
        companyId: c2,
        caption: "Virtual tour of the stunning penthouse in Downtown skyline. 4 Bed, 3 Bath, panoramic views, now available for private showings.",
        hashtags: "#LuxuryRealEstate #Penthouse #Architecture #HomeTour",
        platforms: ["INSTAGRAM", "FACEBOOK", "LINKEDIN"] as any,
        status: "SCHEDULED" as const,
        scheduledAt: new Date("2026-11-20T14:00:00Z"),
      },
      {
        companyId: c3,
        caption: "5 Daily wellness habits recommended by top cardiologists to improve your heart health this winter season.",
        hashtags: "#Healthcare #Wellness #HealthyLiving #HeartHealth",
        platforms: ["FACEBOOK", "LINKEDIN"] as any,
        status: "SCHEDULED" as const,
        scheduledAt: new Date("2026-11-21T11:00:00Z"),
      },
      {
        companyId: c7,
        caption: "Behind the scenes of our Autumn/Winter runaway collection! Sustainable fabrics meeting avant-garde street style.",
        hashtags: "#StreetStyle #SustainableFashion #OOTD #WinterStyle",
        platforms: ["INSTAGRAM", "TIKTOK"] as any,
        status: "IN_REVIEW" as const,
        scheduledAt: new Date("2026-11-22T18:00:00Z"),
      },
      {
        companyId: c6,
        caption: "Market outlook analysis: Q4 interest rate strategies and what they mean for SME portfolio diversification.",
        hashtags: "#Finance #MarketAnalysis #Investing #Economics",
        platforms: ["LINKEDIN"] as any,
        status: "DRAFT" as const,
      },
      {
        companyId: c8,
        caption: "Top 7 hidden gems in Bali you haven't seen on Instagram yet. Bookmark this for your 2027 holiday plans!",
        hashtags: "#TravelGram #Wanderlust #BaliGuide #ExploreMore",
        platforms: ["INSTAGRAM", "TIKTOK", "FACEBOOK"] as any,
        status: "DRAFT" as const,
      },
    ];
    for (const p of postsData) {
      await prisma.post.create({ data: p });
    }
  }

  // 4. Ensure Tasks
  const taskCount = await prisma.task.count();
  if (taskCount < 5) {
    const tasksData = [
      {
        companyId: c1,
        title: "Finalize Instagram campaign graphics and reels",
        priority: "HIGH" as const,
        dueDate: new Date("2026-11-20"),
        completed: false,
      },
      {
        companyId: c4,
        title: "Review product launch creatives and video cuts",
        priority: "HIGH" as const,
        dueDate: new Date("2026-11-20"),
        completed: false,
      },
      {
        companyId: c2,
        title: "Prepare LinkedIn corporate thought leadership post",
        priority: "MEDIUM" as const,
        dueDate: new Date("2026-11-21"),
        completed: false,
      },
      {
        companyId: c5,
        title: "Upload weekly video assets and sound clips",
        priority: "LOW" as const,
        dueDate: new Date("2026-11-22"),
        completed: false,
      },
      {
        companyId: c3,
        title: "Prepare healthcare awareness post for Facebook",
        priority: "HIGH" as const,
        dueDate: new Date("2026-11-21"),
        completed: false,
      },
      {
        companyId: c7,
        title: "Review fashion winter collection lookbook tags",
        priority: "MEDIUM" as const,
        dueDate: new Date("2026-11-22"),
        completed: true,
      },
    ];
    for (const t of tasksData) {
      await prisma.task.create({ data: t });
    }
  }

  // 5. Ensure Media
  const mediaCount = await prisma.media.count();
  if (mediaCount === 0) {
    const mediaData = [
      { companyId: c1, fileName: "hero-campaign-banner.png", fileUrl: "/previews/tech-banner.png", fileType: "image" },
      { companyId: c2, fileName: "penthouse-aerial-view.mp4", fileUrl: "/previews/penthouse.mp4", fileType: "video" },
      { companyId: c3, fileName: "wellness-infographic.png", fileUrl: "/previews/wellness.png", fileType: "image" },
      { companyId: c4, fileName: "black-friday-promo-teaser.mp4", fileUrl: "/previews/promo.mp4", fileType: "video" },
      { companyId: c7, fileName: "winter-collection-lookbook.png", fileUrl: "/previews/fashion.png", fileType: "image" },
    ];
    for (const m of mediaData) {
      await prisma.media.create({ data: m });
    }
  }

  console.log("Seeding complete! Current Database Status:");
  console.log("Companies:", await prisma.company.count());
  console.log("Users:", await prisma.user.count());
  console.log("Posts:", await prisma.post.count());
  console.log("Tasks:", await prisma.task.count());
  console.log("Media:", await prisma.media.count());
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

