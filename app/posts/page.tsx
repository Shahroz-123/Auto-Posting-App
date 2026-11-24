"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Copy,
  ThumbsUp,
  MessageCircle,
  X,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { SocialPlatform } from "@/lib/data";
import { useUserRole } from "@/components/UserRoleContext";

interface PostRecord {
  id: number;
  companyId: number;
  caption: string;
  hashtags: string | null;
  platforms: string[];
  status: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED";
  scheduledAt: string | null;
  publishedAt: string | null;
  mediaUrl: string | null;
  company: {
    id: number;
    name: string;
    industry: string;
  };
}

export default function PostsPage() {
  const { isAdmin } = useUserRole();
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewPost, setPreviewPost] = useState<PostRecord | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [statusAlert, setStatusAlert] = useState("");

  const handleRunCron = async () => {
    try {
      setRunningCron(true);
      setStatusAlert("");
      const res = await fetch("/api/cron/publish", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatusAlert(`⚡ Auto-Posting Engine ran: ${data.processedCount} scheduled post(s) processed.`);
        fetchPostsAndCompanies();
      }
    } catch (err: any) {
      setStatusAlert(`Engine run error: ${err.message}`);
    } finally {
      setRunningCron(false);
    }
  };

  const handlePublishNow = async (postId: number) => {
    try {
      setPublishingId(postId);
      setStatusAlert("");
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatusAlert(data.message);
        fetchPostsAndCompanies();
      }
    } catch (err: any) {
      setStatusAlert(`Publishing error: ${err.message}`);
    } finally {
      setPublishingId(null);
    }
  };

  const fetchPostsAndCompanies = async () => {
    try {
      setLoading(true);
      const [resPosts, resCompanies] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/companies"),
      ]);

      if (resPosts.ok) {
        const postsData = await resPosts.json();
        setPosts(postsData);
      }
      if (resCompanies.ok) {
        const companiesData = await resCompanies.json();
        setCompanies(companiesData);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndCompanies();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesStatus =
      selectedStatus === "all" || post.status === selectedStatus.toUpperCase();
    const matchesCompany =
      selectedCompany === "all" || post.companyId.toString() === selectedCompany;
    const matchesPlatform =
      selectedPlatform === "all" ||
      post.platforms.includes(selectedPlatform.toUpperCase());
    const matchesSearch =
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.hashtags && post.hashtags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.company.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCompany && matchesPlatform && matchesSearch;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Camera size={13} className="text-pink-600" />;
      case "whatsapp":
        return <MessageCircle size={13} className="text-green-600" />;
      case "facebook":
        return <Globe size={13} className="text-blue-600" />;
      case "linkedin":
        return <BriefcaseBusiness size={13} className="text-blue-700" />;
      case "tiktok":
        return <Video size={13} className="text-gray-900" />;
      default:
        return <Globe size={13} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: PostRecord["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={12} /> Published
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <Clock3 size={12} /> Scheduled
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <AlertCircle size={12} /> In Review
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            Failed
          </span>
        );
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this post from the database?")) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setStatusAlert("Post deleted from database successfully.");
      }
    } catch (err: any) {
      console.error("Failed to delete post:", err);
    }
  };

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const inReviewCount = posts.filter((p) => p.status === "IN_REVIEW").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-8 p-8">
      {/* Back Button */}
      <BackButton href="/" label="Back to Dashboard" />

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Posts & Campaign Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            All records loaded directly from your Neon PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunCron}
            disabled={runningCron}
            className="flex items-center gap-2 rounded-xl border border-green-700 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 shadow-xs transition hover:bg-green-100 disabled:opacity-50"
          >
            {runningCron ? (
              <Loader2 size={16} className="animate-spin text-green-700" />
            ) : (
              <span>⚡</span>
            )}
            <span>{runningCron ? "Publishing Queue..." : "Run Auto-Posting Engine"}</span>
          </button>

          <Link
            href="/create"
            className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
          >
            <Plus size={18} />
            <span>Create New Post</span>
          </Link>
        </div>
      </section>

      {statusAlert && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs font-semibold text-green-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-700" />
            <span>{statusAlert}</span>
          </div>
          <button
            onClick={() => setStatusAlert("")}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Stats Counters */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total in Database</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{posts.length}</p>
          <p className="mt-1 text-xs text-green-700 font-medium">PostgreSQL Synchronized</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Scheduled</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{scheduledCount}</p>
          <p className="mt-1 text-xs text-gray-500">Queued in database</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Published</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{publishedCount}</p>
          <p className="mt-1 text-xs text-gray-500">Live across channels</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Drafts / In Review</p>
          <p className="mt-2 text-3xl font-bold text-gray-700">{draftCount + inReviewCount}</p>
          <p className="mt-1 text-xs text-gray-500">Awaiting publishing</p>
        </div>
      </section>

      {/* Filter Tabs & Search */}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
          {[
            { key: "all", label: "All Posts" },
            { key: "published", label: "Published" },
            { key: "scheduled", label: "Scheduled" },
            { key: "in_review", label: "In Review" },
            { key: "draft", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedStatus === tab.key
                  ? "bg-green-700 text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Workspace and Platform Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by caption, tags, or company in DB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
            >
              <option value="all">All Companies in DB</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
        </div>
      </section>

      {/* Posts Table / Feed */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Querying Neon PostgreSQL Database...
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 pl-2">Post Content</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Channels</th>
                  <th className="pb-3">Schedule / Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-gray-50/70">
                    {/* Content */}
                    <td className="py-4 pl-2 pr-4 max-w-xs">
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
                        {post.caption}
                      </p>
                      {post.hashtags && (
                        <p className="mt-1 line-clamp-1 text-xs text-green-700 font-medium">
                          {post.hashtags}
                        </p>
                      )}
                    </td>

                    {/* Company */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-800">
                        {post.company?.name ?? `Company #${post.companyId}`}
                      </span>
                    </td>

                    {/* Platforms */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {post.platforms.map((p) => (
                          <span
                            key={p}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-2xs"
                          >
                            {getPlatformIcon(p)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status & Timing */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <div>
                        {getStatusBadge(post.status)}
                        <p className="mt-1 text-[11px] text-gray-500">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleDateString()
                              : "Draft saved"}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status !== "PUBLISHED" && (
                          <button
                            onClick={() => handlePublishNow(post.id)}
                            disabled={publishingId === post.id}
                            title="Publish Now to Connected Channels"
                            className="flex items-center gap-1 rounded-lg bg-green-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-800 transition disabled:opacity-50"
                          >
                            {publishingId === post.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Send size={12} />
                            )}
                            <span>Publish</span>
                          </button>
                        )}

                        <button
                          onClick={() => setPreviewPost(post)}
                          title="Preview Post"
                          className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-700 transition"
                        >
                          <Eye size={16} />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            title="Delete Post from Database"
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      No posts found in database matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Post Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-green-700" />
                <h3 className="font-bold text-gray-900">Post Feed Preview</h3>
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Social Card Mockup */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800 text-sm">
                    {previewPost.company?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {previewPost.company?.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {previewPost.status === "PUBLISHED" ? "Live" : "Scheduled"} · Sponsored
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {previewPost.platforms.map((p) => (
                    <span key={p}>{getPlatformIcon(p)}</span>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <p className="mt-3.5 text-sm text-gray-800 leading-relaxed">
                {previewPost.caption}
              </p>
              {previewPost.hashtags && (
                <p className="mt-2 text-xs font-semibold text-green-700">
                  {previewPost.hashtags}
                </p>
              )}

              {/* Media Container Mockup */}
              <div className="mt-4 flex h-48 items-center justify-center rounded-xl bg-linear-to-br from-green-50 to-gray-100 border border-gray-100 text-gray-400">
                <div className="text-center">
                  <Camera size={32} className="mx-auto text-green-600 mb-1" />
                  <p className="text-xs font-medium text-gray-600">Post Media Content</p>
                  <p className="text-[10px] text-gray-400">{previewPost.company?.name} Workspace</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
