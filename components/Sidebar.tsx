"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  FileText,
  Images,
  CheckSquare,
  Users,
  Settings,
  Share2,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    name: "Create & Publish",
    icon: Share2,
    href: "/create",
  },
  {
    name: "Companies",
    icon: Building2,
    href: "/companies",
  },
  {
    name: "Content Planner",
    icon: CalendarDays,
    href: "/planner",
  },
  {
    name: "Posts",
    icon: FileText,
    href: "/posts",
  },
  {
    name: "Media Library",
    icon: Images,
    href: "/media",
  },
  {
    name: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    name: "Team",
    icon: Users,
    href: "/team",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-5 shadow-xs shrink-0 overflow-y-auto">

      {/* Logo */}
      <Link href="/" className="group mb-8 block transition">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white font-bold text-lg shadow-sm group-hover:bg-green-800 transition">
            M
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-gray-900 group-hover:text-green-700 transition">
              MarketHub
            </h1>
            <p className="text-[11px] font-medium text-gray-500">
              Marketing Management Portal
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Main Navigation
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-green-50 text-green-800 font-semibold shadow-xs"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={isActive ? "text-green-700" : "text-gray-500"}
                />
                <span>{item.name}</span>
              </div>

              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-xs font-bold text-green-800">
            8C
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">
              Admin Workspace
            </p>
            <p className="truncate text-[11px] text-gray-500">
              8 Companies Active
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}
