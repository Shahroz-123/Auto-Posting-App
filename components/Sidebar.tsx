
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Images,
  CheckSquare,
  Users,
  Settings,
  Share2,
} from "lucide-react";

const menuItems = [
  {
    name: "Create & Publish",
    icon: Share2,
    href: "/create",
  },
  {
    name: "Companies",
    icon: Building2,
    href: "#",
  },
  {
    name: "Content Planner",
    icon: CalendarDays,
    href: "#",
  },
  {
    name: "Posts",
    icon: Share2,
    href: "#",
  },
  {
    name: "Media Library",
    icon: Images,
    href: "#",
  },
  {
    name: "Tasks",
    icon: CheckSquare,
    href: "#",
  },
  {
    name: "Team",
    icon: Users,
    href: "#",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "#",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white p-5">

      {/* Logo */}

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-green-700">
          MarketHub
        </h1>

        <p className="text-xs text-gray-500">
          Marketing Management Portal
        </p>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2">

    {menuItems.map((item) => {
        const Icon = item.icon;

        return (
            <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-800"
            >
                <Icon size={19} />

                <span>{item.name}</span>
            </Link>
        );
    })}
      </nav>

      {/* Footer */}

      <div className="border-t pt-4">
        <p className="text-sm font-semibold">
          Admin Workspace
        </p>

        <p className="text-xs text-gray-500">
          Manage your companies
        </p>
      </div>

    </aside>
  );
}