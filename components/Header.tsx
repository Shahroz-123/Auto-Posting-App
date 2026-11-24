"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  User,
  Check,
} from "lucide-react";
import { useUserRole, RoleType } from "@/components/UserRoleContext";

export default function Header() {
  const { role, setRole, isAdmin } = useUserRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rolesList: { key: RoleType; label: string; desc: string; icon: any }[] = [
    {
      key: "ADMIN",
      label: "Administrator",
      desc: "Full database permissions & deletion rights",
      icon: ShieldAlert,
    },
    {
      key: "MANAGER",
      label: "Campaign Manager",
      desc: "Create, schedule & publish without deletion",
      icon: ShieldCheck,
    },
    {
      key: "CLIENT",
      label: "Client / Viewer",
      desc: "Review published analytics & schedule calendar",
      icon: User,
    },
  ];

  const currentRoleInfo = rolesList.find((r) => r.key === role) || rolesList[0];

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2">
        <Search size={17} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns, companies, posts..."
          className="w-64 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right Side: Role Selector & User Profile */}
      <div className="flex items-center gap-5">
        {/* Active Role Indicator Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          <span className={`h-2 w-2 rounded-full ${isAdmin ? "bg-green-600" : "bg-blue-600"}`} />
          <span>Active Mode: <strong className="text-gray-900">{role}</strong></span>
        </div>

        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
        >
          <Bell size={20} />
          <span className="absolute 1 top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-1.5 pr-3 hover:bg-gray-50 transition"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm text-white ${
                isAdmin
                  ? "bg-green-700"
                  : role === "MANAGER"
                  ? "bg-blue-600"
                  : "bg-purple-600"
              }`}
            >
              {role[0]}
            </div>

            <div className="text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {currentRoleInfo.label}
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                {role === "ADMIN" ? "Admin Access" : "Standard Access"}
              </p>
            </div>

            <ChevronDown size={15} className="text-gray-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Switch User Role
              </p>

              {rolesList.map((r) => {
                const Icon = r.icon;
                const isSelected = r.key === role;
                return (
                  <button
                    key={r.key}
                    onClick={() => {
                      setRole(r.key);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left transition ${
                      isSelected
                        ? "bg-green-50 text-green-900 font-semibold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Icon size={16} className={isSelected ? "text-green-700 mt-0.5" : "text-gray-400 mt-0.5"} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{r.label}</span>
                        {isSelected && <Check size={14} className="text-green-700" />}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
