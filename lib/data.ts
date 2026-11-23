export interface Company {
  id: number;
  name: string;
  industry: string;
  initials: string;
  website?: string;
  status?: "Active" | "Pending" | "Paused";
  connectedPlatforms?: SocialPlatform[];
  monthlyReach?: string;
  totalPosts?: number;
  scheduledCount?: number;
}

export const companies: Company[] = [
  {
    id: 1,
    name: "Company One",
    industry: "Technology",
    initials: "C1",
    website: "companyone.tech",
    status: "Active",
    connectedPlatforms: ["instagram", "facebook", "linkedin", "tiktok"],
    monthlyReach: "420K",
    totalPosts: 45,
    scheduledCount: 5,
  },
  {
    id: 2,
    name: "Company Two",
    industry: "Real Estate",
    initials: "C2",
    website: "companytworealty.com",
    status: "Active",
    connectedPlatforms: ["instagram", "facebook", "linkedin"],
    monthlyReach: "280K",
    totalPosts: 38,
    scheduledCount: 3,
  },
  {
    id: 3,
    name: "Company Three",
    industry: "Healthcare",
    initials: "C3",
    website: "companythreehealth.org",
    status: "Active",
    connectedPlatforms: ["facebook", "linkedin"],
    monthlyReach: "190K",
    totalPosts: 29,
    scheduledCount: 4,
  },
  {
    id: 4,
    name: "Company Four",
    industry: "E-commerce",
    initials: "C4",
    website: "companyfourshop.com",
    status: "Active",
    connectedPlatforms: ["instagram", "facebook", "tiktok"],
    monthlyReach: "560K",
    totalPosts: 62,
    scheduledCount: 4,
  },
  {
    id: 5,
    name: "Company Five",
    industry: "Education",
    initials: "C5",
    website: "companyfiveedu.io",
    status: "Active",
    connectedPlatforms: ["instagram", "linkedin", "facebook"],
    monthlyReach: "150K",
    totalPosts: 24,
    scheduledCount: 2,
  },
  {
    id: 6,
    name: "Company Six",
    industry: "Finance",
    initials: "C6",
    website: "companysixfin.com",
    status: "Active",
    connectedPlatforms: ["linkedin", "facebook"],
    monthlyReach: "310K",
    totalPosts: 31,
    scheduledCount: 3,
  },
  {
    id: 7,
    name: "Company Seven",
    industry: "Fashion",
    initials: "C7",
    website: "companysevenwear.com",
    status: "Active",
    connectedPlatforms: ["instagram", "tiktok", "facebook"],
    monthlyReach: "490K",
    totalPosts: 54,
    scheduledCount: 2,
  },
  {
    id: 8,
    name: "Company Eight",
    industry: "Travel",
    initials: "C8",
    website: "companyeighttravel.com",
    status: "Active",
    connectedPlatforms: ["instagram", "facebook", "tiktok"],
    monthlyReach: "270K",
    totalPosts: 33,
    scheduledCount: 1,
  },
];

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "whatsapp";

export interface SocialAccount {
  id: string;
  companyId: number;
  platform: SocialPlatform;
  accountName: string;
  connected: boolean;
}

export interface SocialPost {
  id: string;
  companyId: number;
  companyName: string;
  caption: string;
  hashtags: string;
  platforms: SocialPlatform[];
  status: "draft" | "in_review" | "scheduled" | "published" | "failed";
  scheduledAt: string | null;
  publishedAt?: string | null;
  mediaUrl: string | null;
  likes?: number;
  comments?: number;
}

export const socialPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Photos, Reels and Stories",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Posts, images and videos",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional content",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form videos",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Broadcasts, Status & Channels",
  },
] as const;

/* ----------------------------------
   SAMPLE POSTS DATA
---------------------------------- */
export const initialPostsData: SocialPost[] = [
  {
    id: "post-1",
    companyId: 1,
    companyName: "Company One",
    caption: "Excited to launch our revolutionary cloud AI assistant for modern teams! Boost productivity by 40% with zero setup.",
    hashtags: "#TechInnovation #AI #CloudComputing #Productivity",
    platforms: ["linkedin", "facebook"],
    status: "published",
    scheduledAt: null,
    publishedAt: "2026-11-18 10:30 AM",
    mediaUrl: "/previews/tech-preview.jpg",
    likes: 342,
    comments: 28,
  },
  {
    id: "post-2",
    companyId: 4,
    companyName: "Company Four",
    caption: "Black Friday early bird VIP deals are here! Up to 60% off everything in stock for the next 48 hours only.",
    hashtags: "#Ecommerce #Sale #FashionDeals #ShopNow",
    platforms: ["instagram", "tiktok"],
    status: "published",
    scheduledAt: null,
    publishedAt: "2026-11-17 04:15 PM",
    mediaUrl: "/previews/sale-preview.jpg",
    likes: 1205,
    comments: 94,
  },
  {
    id: "post-3",
    companyId: 2,
    companyName: "Company Two",
    caption: "Virtual tour of the stunning penthouse in Downtown skyline. 4 Bed, 3 Bath, panoramic views, now available for private showings.",
    hashtags: "#LuxuryRealEstate #Penthouse #Architecture #HomeTour",
    platforms: ["instagram", "facebook", "linkedin"],
    status: "scheduled",
    scheduledAt: "2026-11-20 02:00 PM",
    publishedAt: null,
    mediaUrl: "/previews/estate-preview.jpg",
  },
  {
    id: "post-4",
    companyId: 3,
    companyName: "Company Three",
    caption: "5 Daily wellness habits recommended by top cardiologists to improve your heart health this winter season.",
    hashtags: "#Healthcare #Wellness #HealthyLiving #HeartHealth",
    platforms: ["facebook", "linkedin"],
    status: "scheduled",
    scheduledAt: "2026-11-21 11:00 AM",
    publishedAt: null,
    mediaUrl: null,
  },
  {
    id: "post-5",
    companyId: 7,
    companyName: "Company Seven",
    caption: "Behind the scenes of our Autumn/Winter runaway collection! Sustainable fabrics meeting avant-garde street style.",
    hashtags: "#StreetStyle #SustainableFashion #OOTD #WinterStyle",
    platforms: ["instagram", "tiktok"],
    status: "in_review",
    scheduledAt: "2026-11-22 06:00 PM",
    publishedAt: null,
    mediaUrl: "/previews/fashion-preview.jpg",
  },
  {
    id: "post-6",
    companyId: 5,
    companyName: "Company Five",
    caption: "New scholarship program announced for upcoming computer science and AI master programs. Apply before deadline!",
    hashtags: "#Education #Scholarship #HigherEd #LearnCoding",
    platforms: ["linkedin", "facebook"],
    status: "in_review",
    scheduledAt: "2026-11-23 09:30 AM",
    publishedAt: null,
    mediaUrl: null,
  },
  {
    id: "post-7",
    companyId: 6,
    companyName: "Company Six",
    caption: "Market outlook analysis: Q4 interest rate strategies and what they mean for SME portfolio diversification.",
    hashtags: "#Finance #MarketAnalysis #Investing #Economics",
    platforms: ["linkedin"],
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    mediaUrl: null,
  },
  {
    id: "post-8",
    companyId: 8,
    companyName: "Company Eight",
    caption: "Top 7 hidden gems in Bali you haven't seen on Instagram yet. Bookmark this for your 2027 holiday plans!",
    hashtags: "#TravelGram #Wanderlust #BaliGuide #ExploreMore",
    platforms: ["instagram", "tiktok", "facebook"],
    status: "draft",
    scheduledAt: null,
    publishedAt: null,
    mediaUrl: "/previews/travel-preview.jpg",
  },
  {
    id: "post-9",
    companyId: 1,
    companyName: "Company One",
    caption: "System update notification: API rate limit adjustments and upcoming maintenance schedule.",
    hashtags: "#DevOps #SysAdmin #TechAlert",
    platforms: ["linkedin"],
    status: "published",
    scheduledAt: null,
    publishedAt: "2026-11-15 08:00 AM",
    mediaUrl: null,
    likes: 88,
    comments: 5,
  },
];

/* ----------------------------------
   SAMPLE MEDIA ASSETS
---------------------------------- */
export interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "graphic";
  format: string;
  size: string;
  dimensions: string;
  companyId: number;
  companyName: string;
  uploadDate: string;
  tags: string[];
}

export const initialMediaAssets: MediaAsset[] = [
  {
    id: "med-1",
    name: "hero-campaign-banner.png",
    type: "image",
    format: "PNG",
    size: "2.4 MB",
    dimensions: "1920x1080",
    companyId: 1,
    companyName: "Company One",
    uploadDate: "Nov 18, 2026",
    tags: ["Tech", "Banner", "Campaign"],
  },
  {
    id: "med-2",
    name: "penthouse-aerial-view.mp4",
    type: "video",
    format: "MP4",
    size: "18.6 MB",
    dimensions: "1080x1920",
    companyId: 2,
    companyName: "Company Two",
    uploadDate: "Nov 17, 2026",
    tags: ["Reel", "Drone", "Real Estate"],
  },
  {
    id: "med-3",
    name: "wellness-infographic.png",
    type: "graphic",
    format: "PNG",
    size: "1.1 MB",
    dimensions: "1080x1080",
    companyId: 3,
    companyName: "Company Three",
    uploadDate: "Nov 16, 2026",
    tags: ["Infographic", "Health", "Tips"],
  },
  {
    id: "med-4",
    name: "black-friday-promo-teaser.mp4",
    type: "video",
    format: "MP4",
    size: "12.3 MB",
    dimensions: "1080x1920",
    companyId: 4,
    companyName: "Company Four",
    uploadDate: "Nov 18, 2026",
    tags: ["TikTok", "Promo", "Sale"],
  },
  {
    id: "med-5",
    name: "campus-orientation-flyer.png",
    type: "graphic",
    format: "PNG",
    size: "3.2 MB",
    dimensions: "1200x630",
    companyId: 5,
    companyName: "Company Five",
    uploadDate: "Nov 15, 2026",
    tags: ["Education", "Flyer"],
  },
  {
    id: "med-6",
    name: "q4-market-report-chart.png",
    type: "image",
    format: "PNG",
    size: "850 KB",
    dimensions: "1200x800",
    companyId: 6,
    companyName: "Company Six",
    uploadDate: "Nov 14, 2026",
    tags: ["Finance", "Report", "Graph"],
  },
  {
    id: "med-7",
    name: "winter-collection-lookbook.png",
    type: "image",
    format: "PNG",
    size: "4.5 MB",
    dimensions: "1080x1350",
    companyId: 7,
    companyName: "Company Seven",
    uploadDate: "Nov 18, 2026",
    tags: ["Fashion", "Lookbook", "Instagram"],
  },
  {
    id: "med-8",
    name: "bali-waterfall-drone.mp4",
    type: "video",
    format: "MP4",
    size: "24.1 MB",
    dimensions: "1080x1920",
    companyId: 8,
    companyName: "Company Eight",
    uploadDate: "Nov 12, 2026",
    tags: ["Travel", "Video", "Reels"],
  },
];

/* ----------------------------------
   SAMPLE TEAM DATA
---------------------------------- */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Content Strategist" | "Social Media Manager" | "Graphic Designer" | "Copywriter";
  avatarInitials: string;
  status: "online" | "away" | "offline";
  assignedCompanies: number[];
  activity: string;
}

export const initialTeamData: TeamMember[] = [
  {
    id: "team-1",
    name: "Admin User",
    email: "admin@markethub.internal",
    role: "Administrator",
    avatarInitials: "AU",
    status: "online",
    assignedCompanies: [1, 2, 3, 4, 5, 6, 7, 8],
    activity: "Active now",
  },
  {
    id: "team-2",
    name: "Sarah Jenkins",
    email: "sarah.j@markethub.internal",
    role: "Content Strategist",
    avatarInitials: "SJ",
    status: "online",
    assignedCompanies: [1, 4, 7],
    activity: "Edited Post #1 12m ago",
  },
  {
    id: "team-3",
    name: "Hamza Malik",
    email: "hamza.m@markethub.internal",
    role: "Social Media Manager",
    avatarInitials: "HM",
    status: "online",
    assignedCompanies: [2, 3, 6],
    activity: "Scheduled 3 posts today",
  },
  {
    id: "team-4",
    name: "Elena Rostova",
    email: "elena.r@markethub.internal",
    role: "Graphic Designer",
    avatarInitials: "ER",
    status: "away",
    assignedCompanies: [4, 7, 8],
    activity: "Uploaded 4 creative assets",
  },
  {
    id: "team-5",
    name: "David Kim",
    email: "david.k@markethub.internal",
    role: "Copywriter",
    avatarInitials: "DK",
    status: "offline",
    assignedCompanies: [1, 5, 6],
    activity: "Active yesterday",
  },
  {
    id: "team-6",
    name: "Ayesha Khan",
    email: "ayesha.k@markethub.internal",
    role: "Social Media Manager",
    avatarInitials: "AK",
    status: "online",
    assignedCompanies: [5, 8],
    activity: "Reviewing TikTok video specs",
  },
];
