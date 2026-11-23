"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Share2,
  Loader2,
} from "lucide-react";
import DashboardSections from "@/components/DashboardSections";

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
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
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
    }
    loadDashboard();
  }, [selectedCompany]);

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
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-500">
          Live digital marketing operations loaded directly from Neon PostgreSQL database.
        </p>
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
        <h2 className="mb-4 text-lg font-bold text-gray-900">Your Companies in DB</h2>

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

                <button
                  onClick={() => setSelectedCompany(company.id.toString())}
                  className="mt-5 w-full rounded-lg border border-green-700 py-2 text-sm font-medium text-green-700 transition hover:bg-green-700 hover:text-white"
                >
                  Open Workspace
                </button>
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
    </div>
  );
}
