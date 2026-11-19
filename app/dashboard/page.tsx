
"use client";

import { useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  Share2,
} from "lucide-react";

import { companies } from "@/lib/data";
import DashboardSections from "@/components/DashboardSections";

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState("all");

  const stats = [
    {
      title: "Total Companies",
      value: "8",
      icon: Building2,
    },
    {
      title: "Scheduled Posts",
      value: "24",
      icon: CalendarDays,
    },
    {
      title: "Published Posts",
      value: "156",
      icon: Share2,
    },
    {
      title: "Completed Tasks",
      value: "42",
      icon: CheckCircle,
    },
  ];

  const filteredCompanies = companies.filter(
    (company) =>
      selectedCompany === "all" ||
      company.id.toString() === selectedCompany
  );

  const selectedCompanyName =
    selectedCompany === "all"
      ? "All Companies"
      : companies.find(
          (company) => company.id.toString() === selectedCompany
        )?.name ?? "Selected Company";

  return (
    <div className="space-y-8 p-8">

      {/* Dashboard Welcome Section */}

      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your digital marketing operations across all companies.
        </p>
      </section>

      {/* Company Workspace */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">
            Company Workspace
          </h2>

          <p className="text-sm text-gray-500">
            Select a company to manage its marketing activities.
          </p>
        </div>

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-green-600 md:w-72"
        >
          <option value="all">
            All Companies
          </option>

          {companies.map((company) => (
            <option
              key={company.id}
              value={company.id.toString()}
            >
              {company.name}
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

                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <Icon
                  size={22}
                  className="text-green-700"
                />

              </div>

              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>

            </div>
          );
        })}

      </section>

      {/* Company Cards */}

      <section>

        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Your Companies
        </h2>

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
                  <h3 className="font-semibold text-gray-900">
                    {company.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {company.industry}
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedCompany(company.id.toString())
                }
                className="mt-5 w-full rounded-lg border border-green-700 py-2 text-sm font-medium text-green-700 transition hover:bg-green-700 hover:text-white"
              >
                Open Workspace
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* Dashboard Sections */}

      <DashboardSections selectedCompany={selectedCompany} />

    </div>
  );
}
