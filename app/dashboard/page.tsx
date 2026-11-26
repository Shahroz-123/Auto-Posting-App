"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Share2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import DashboardSections from "@/components/DashboardSections";
import { useUserRole } from "@/components/UserRoleContext";

interface CompanyItem {
  id: number;
  name: string;
  industry: string;
  initials: string;
}

interface DashboardData {
  stats: {
    totalCompanies: number;
    scheduledPosts: number;
    publishedPosts: number;
    completedTasks: number;
  };
  pipeline: {
    draft: number;
    inReview: number;
    scheduled: number;
    published: number;
  };
  companies: CompanyItem[];
}

export default function Dashboard() {
  const { isAdmin } = useUserRole();
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Company State
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("Technology");
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?companyId=${selectedCompany}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedCompany]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const words = newCompanyName.trim().split(" ");
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : newCompanyName.slice(0, 2).toUpperCase();

    try {
      setCreatingCompany(true);
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
        setNewCompanyName("");
        setNewCompanyWebsite("");
        setIsAddCompanyOpen(false);
        await loadDashboard();
      }
    } catch (err) {
      console.error("Failed to create company from dashboard:", err);
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleDeleteCompany = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the database? All its posts, tasks, and media will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedCompany === id.toString()) {
          setSelectedCompany("all");
        }
        await loadDashboard();
      }
    } catch (err) {
      console.error("Failed to delete company:", err);
    }
  };

  const companiesList = dashboardData?.companies || [];

  const stats = [
    {
      title: "Total Companies",
      value: dashboardData?.stats.totalCompanies.toString() ?? "0",
      icon: Building2,
    },
    {
      title: "Scheduled Posts",
      value: dashboardData?.stats.scheduledPosts.toString() ?? "0",
      icon: CalendarDays,
    },
    {
      title: "Published Posts",
      value: dashboardData?.stats.publishedPosts.toString() ?? "0",
      icon: Share2,
    },
    {
      title: "Completed Tasks",
      value: dashboardData?.stats.completedTasks.toString() ?? "0",
      icon: CheckCircle,
    },
  ];

  const filteredCompanies = companiesList.filter(
    (company) =>
      selectedCompany === "all" || company.id.toString() === selectedCompany
  );

  const selectedCompanyName =
    selectedCompany === "all"
      ? "All Companies"
      : companiesList.find((c) => c.id.toString() === selectedCompany)?.name ??
        "Selected Company";

  return (
    <div className="space-y-8 p-8">
      {/* Dashboard Welcome Section */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live digital marketing operations loaded directly from Neon PostgreSQL database.
          </p>
        </div>

        <button
          onClick={() => setIsAddCompanyOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Plus size={18} />
          <span>Add New Company</span>
        </button>
      </section>

      {/* Company Workspace */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">Company Workspace</h2>
          <p className="text-sm text-gray-500">
            Select a client organization to filter marketing activity.
          </p>
        </div>

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-green-600 md:w-72"
        >
          <option value="all">All Companies in DB</option>
          {companiesList.map((company) => (
            <option key={company.id} value={company.id.toString()}>
              {company.name} ({company.industry})
            </option>
          ))}
        </select>

        <p className="mt-3 text-sm font-medium text-green-700">
          Currently viewing: {selectedCompanyName}
        </p>
      </section>

      {/* Dashboard Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <Icon size={22} className="text-green-700" />
              </div>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {loading ? "..." : stat.value}
              </h2>
            </div>
          );
        })}
      </section>

      {/* Company Cards */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">Your Companies</h2>

        {loading ? (
          <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-gray-100">
            <Loader2 className="animate-spin text-green-700" size={28} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 font-bold text-green-800">
                    {company.initials}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-xs text-gray-500">{company.industry}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCompany(company.id.toString())}
                    className="flex-1 rounded-lg border border-green-700 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-700 hover:text-white"
                  >
                    Open Workspace
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      title="Permanently Delete Company from Database"
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dashboard Sections */}
      <DashboardSections
        selectedCompany={selectedCompany}
        pipelineData={dashboardData?.pipeline}
        companiesList={companiesList}
      />

      {/* Add Company Modal */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Add Client Organization</h3>
              <button
                onClick={() => setIsAddCompanyOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Company / Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Logistics"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Industry Vertical
                </label>
                <select
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600 bg-white"
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
                  placeholder="e.g. apexlogistics.com"
                  value={newCompanyWebsite}
                  onChange={(e) => setNewCompanyWebsite(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCompany}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {creatingCompany ? "Saving to Database..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
