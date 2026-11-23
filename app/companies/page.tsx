"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  Share2,
  CalendarDays,
  Plus,
  Search,
  Filter,
  Camera,
  BriefcaseBusiness,
  Video,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { SocialPlatform } from "@/lib/data";
import ConnectSocialModal from "@/components/ConnectSocialModal";

interface CompanyRecord {
  id: number;
  name: string;
  industry: string;
  initials: string;
  website: string | null;
  socialAccounts?: {
    id: number;
    platform: string;
    accountName: string;
    connected: boolean;
  }[];
  _count?: {
    posts: number;
    tasks: number;
  };
}

export default function CompaniesPage() {
  const [companiesList, setCompaniesList] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompanyForSocial, setSelectedCompanyForSocial] = useState<CompanyRecord | null>(null);

  // New company form state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("Technology");
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch actual data from database
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/companies");
      if (res.ok) {
        const data = await res.json();
        setCompaniesList(data);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const industries = [
    "all",
    ...Array.from(new Set(companiesList.map((c) => c.industry))),
  ];

  const filteredCompanies = companiesList.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "all" || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const words = newCompanyName.trim().split(" ");
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : newCompanyName.slice(0, 2).toUpperCase();

    try {
      setSubmitting(true);
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          industry: newCompanyIndustry,
          initials,
          website: newCompanyWebsite.trim() || `${newCompanyName.toLowerCase().replace(/\s+/g, "")}.com`,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCompaniesList((prev) => [...prev, created]);
        setNewCompanyName("");
        setNewCompanyIndustry("Technology");
        setNewCompanyWebsite("");
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save company to database:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "instagram":
        return <Camera size={14} className="text-pink-600" />;
      case "facebook":
        return <Globe size={14} className="text-blue-600" />;
      case "linkedin":
        return <BriefcaseBusiness size={14} className="text-blue-700" />;
      case "tiktok":
        return <Video size={14} className="text-gray-900" />;
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
            Companies & Workspaces
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live client organizations loaded directly from Neon PostgreSQL database.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Plus size={18} />
          <span>Add New Company</span>
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Total Companies</span>
            <Building2 size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{companiesList.length}</p>
          <p className="mt-1 text-xs text-green-700 font-medium">Synced with PostgreSQL</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Connected Channels</span>
            <Share2 size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">Multi-Channel</p>
          <p className="mt-1 text-xs text-gray-500">IG, FB, LinkedIn, TikTok</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Database Status</span>
            <Sparkles size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-green-700">Neon Live</p>
          <p className="mt-1 text-xs text-green-700 font-medium">PostgreSQL Connected</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Industries</span>
            <CalendarDays size={18} className="text-green-700" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {new Set(companiesList.map((c) => c.industry)).size}
          </p>
          <p className="mt-1 text-xs text-gray-500">Diverse business verticals</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter size={15} />
            <span>Industry:</span>
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-600"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind === "all" ? "All Industries" : ind}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Fetching companies from Neon Database...
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-base font-bold text-green-800 transition group-hover:bg-green-700 group-hover:text-white">
                      {company.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{company.name}</h3>
                      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 mt-0.5">
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={13} />
                    Active
                  </span>
                </div>

                {/* Website */}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
                  <Globe size={13} className="text-gray-400" />
                  <span className="truncate">
                    {company.website ?? `${company.name.toLowerCase().replace(/\s+/g, "")}.com`}
                  </span>
                </p>

                {/* Connected Social Accounts */}
                <div className="mt-4 rounded-xl bg-gray-50/90 p-3 border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-700">Social Accounts</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCompanyForSocial(company)}
                      className="text-[11px] font-semibold text-green-700 hover:text-green-800"
                    >
                      Manage &rarr;
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { key: "INSTAGRAM", icon: Camera, color: "text-pink-600", bg: "bg-pink-100", label: "Instagram" },
                      { key: "WHATSAPP", icon: MessageCircle, color: "text-green-600", bg: "bg-green-100", label: "WhatsApp" },
                      { key: "FACEBOOK", icon: Globe, color: "text-blue-600", bg: "bg-blue-100", label: "Facebook" },
                      { key: "LINKEDIN", icon: BriefcaseBusiness, color: "text-blue-700", bg: "bg-blue-100", label: "LinkedIn" },
                      { key: "TIKTOK", icon: Video, color: "text-gray-900", bg: "bg-gray-200", label: "TikTok" },
                    ].map((item) => {
                      const isConn = company.socialAccounts?.some(
                        (sa) => sa.platform === item.key && sa.connected
                      );
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.key}
                          title={`${item.label}: ${isConn ? "Connected (Ready to auto-post)" : "Not connected"}`}
                          className={`relative flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                            isConn
                              ? `${item.bg} border-green-300 shadow-xs`
                              : "border-gray-200 bg-white opacity-40"
                          }`}
                        >
                          <IconComp size={15} className={isConn ? item.color : "text-gray-400"} />
                          {isConn && (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metrics from DB */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-center">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-xs text-gray-500">Total Posts in DB</p>
                    <p className="mt-0.5 text-sm font-bold text-gray-900">
                      {company._count?.posts ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-xs text-gray-500">Tasks in DB</p>
                    <p className="mt-0.5 text-sm font-bold text-green-700">
                      {company._count?.tasks ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyForSocial(company)}
                  className="w-full rounded-xl border border-green-700 bg-green-50/50 py-2 text-center text-xs font-semibold text-green-800 transition hover:bg-green-700 hover:text-white"
                >
                  ⚡ Connect / Manage Socials
                </button>
                <Link
                  href="/create"
                  className="flex-1 rounded-xl bg-green-700 py-2.5 text-center text-xs font-semibold text-white shadow-xs transition hover:bg-green-800"
                >
                  Create Post
                </Link>
                <Link
                  href="/planner"
                  className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                >
                  Planner
                </Link>
              </div>
            </div>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
              <Building2 size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No companies found in database</p>
            </div>
          )}
        </section>
      )}

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-gray-900">Add New Company</h2>
            <p className="mt-1 text-xs text-gray-500">
              Directly creates and stores the new organization in Neon PostgreSQL.
            </p>

            <form onSubmit={handleAddCompany} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Software"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Industry
                </label>
                <select
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="Technology">Technology</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Travel">Travel</option>
                  <option value="Hospitality">Hospitality</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Website / Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. nexussoftware.io"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Social Accounts Modal */}
      {selectedCompanyForSocial && (
        <ConnectSocialModal
          company={selectedCompanyForSocial}
          isOpen={Boolean(selectedCompanyForSocial)}
          onClose={() => setSelectedCompanyForSocial(null)}
          onUpdated={fetchCompanies}
        />
      )}
    </div>
  );
}
