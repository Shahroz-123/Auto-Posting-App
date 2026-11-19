export interface Company {
  id: number;
  name: string;
  industry: string;
  initials: string;
}

export const companies: Company[] = [
  {
    id: 1,
    name: "Company One",
    industry: "Technology",
    initials: "C1",
  },
  {
    id: 2,
    name: "Company Two",
    industry: "Real Estate",
    initials: "C2",
  },
  {
    id: 3,
    name: "Company Three",
    industry: "Healthcare",
    initials: "C3",
  },
  {
    id: 4,
    name: "Company Four",
    industry: "E-commerce",
    initials: "C4",
  },
  {
    id: 5,
    name: "Company Five",
    industry: "Education",
    initials: "C5",
  },
  {
    id: 6,
    name: "Company Six",
    industry: "Finance",
    initials: "C6",
  },
  {
    id: 7,
    name: "Company Seven",
    industry: "Fashion",
    initials: "C7",
  },
  {
    id: 8,
    name: "Company Eight",
    industry: "Travel",
    initials: "C8",
  },
];

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok";

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
  caption: string;
  platforms: SocialPlatform[];
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  scheduledAt: string | null;
  mediaUrl: string | null;
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
] as const;