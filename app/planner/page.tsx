"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Filter,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface PostRecord {
  id: number;
  companyId: number;
  caption: string;
  hashtags: string | null;
  platforms: string[];
  status: "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED";
  scheduledAt: string | null;
  publishedAt: string | null;
  company: {
    id: number;
    name: string;
    industry: string;
  };
}

export default function ContentPlannerPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string; industry: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const fetchPlannerData = async () => {
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
      console.error("Failed to load planner data from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const getWeekDates = (offsetWeeks: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offsetWeeks * 7);

    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const fullNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      days.push({
        key: dayNames[i],
        label: fullNames[i],
        date: `${monthName} ${d.getDate()}`,
        dateObj: d,
        dayIndex: d.getDay(),
        isoDate: d.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const daysOfWeek = getWeekDates(currentWeekIndex);
  const weekStart = daysOfWeek[0].date;
  const weekEnd = daysOfWeek[6].date;
  const yearString = daysOfWeek[0].dateObj.getFullYear();
  const todayIso = new Date().toISOString().split("T")[0];

  const filteredPosts = posts.filter((item) => {
    return (
      selectedCompany === "all" ||
      item.companyId.toString() === selectedCompany
    );
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

  return (
    <div className="space-y-8 p-8">
      {/* Back Button */}
      <BackButton href="/" label="Back to Dashboard" />

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Planner & Calendar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live schedule loaded from Neon PostgreSQL database.
          </p>
        </div>

        <Link
          href="/create"
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Plus size={18} />
          <span>Schedule New Post</span>
        </Link>
      </section>

      {/* Controls Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Company Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter size={15} />
            <span>Workspace:</span>
          </div>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-green-600"
          >
            <option value="all">All Companies in DB</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name} ({c.industry})
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentWeekIndex((prev) => prev - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="rounded-xl bg-green-50 px-4 py-2 text-center">
            <p className="text-xs font-bold text-green-800">
              {currentWeekIndex === 0
                ? "This Week"
                : currentWeekIndex > 0
                ? `+${currentWeekIndex} Week`
                : `${currentWeekIndex} Week`}{" "}
              · {weekStart} – {weekEnd}, {yearString}
            </p>
          </div>

          <button
            onClick={() => setCurrentWeekIndex((prev) => prev + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Quick Metrics */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total in DB</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{filteredPosts.length}</p>
          <p className="mt-1 text-[11px] text-green-700 font-medium">PostgreSQL live posts</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Scheduled Drops</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {filteredPosts.filter((p) => p.status === "SCHEDULED").length}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">Queued in database</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Published</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {filteredPosts.filter((p) => p.status === "PUBLISHED").length}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">Completed broadcasts</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Client Workspaces</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{companies.length}</p>
          <p className="mt-1 text-[11px] text-gray-500">Neon DB active</p>
        </div>
      </section>

      {/* Weekly Planner Board */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Fetching content calendar from Neon PostgreSQL...
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const dayEvents = filteredPosts.filter((post, postIdx) => {
                if (post.scheduledAt) {
                  return post.scheduledAt.startsWith(day.isoDate);
                }
                return currentWeekIndex === 0 && postIdx % 7 === idx;
              });

              const isToday = day.isoDate === todayIso;

              return (
                <div
                  key={day.key}
                  className={`flex flex-col rounded-xl border p-3 min-h-[380px] transition ${
                    isToday
                      ? "border-green-500 bg-green-50/20 shadow-xs"
                      : "border-gray-100 bg-gray-50/60"
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isToday ? "text-green-800" : "text-gray-600"
                        }`}
                      >
                        {day.label}
                      </p>
                      <p className="text-[11px] text-gray-400">{day.date}</p>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-green-700 px-2 py-0.5 text-[9px] font-bold text-white">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Slots */}
                  <div className="mt-3 flex-1 space-y-2.5">
                    {dayEvents.map((post) => (
                      <div
                        key={post.id}
                        className="group rounded-xl border border-gray-200 bg-white p-3 shadow-xs transition hover:border-green-300 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                            {post.platforms[0] && getPlatformIcon(post.platforms[0])}
                            <span className="capitalize">{post.platforms[0] || "Social"}</span>
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              post.status === "PUBLISHED"
                                ? "bg-green-50 text-green-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {post.status === "PUBLISHED" ? "Live" : "Queued"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs font-bold text-gray-900 leading-tight">
                          {post.caption}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] text-gray-400">
                          <span className="font-semibold text-green-800">
                            {post.company?.name}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock3 size={11} />
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "10:00 AM"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {dayEvents.length === 0 && (
                      <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-center">
                        <p className="text-[11px] text-gray-400">No drops scheduled</p>
                        <Link
                          href="/create"
                          className="mt-1 text-[11px] font-semibold text-green-700 hover:underline"
                        >
                          + Add post
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Day Add button */}
                  <Link
                    href="/create"
                    className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-800"
                  >
                    <Plus size={13} />
                    <span>Add Post</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
