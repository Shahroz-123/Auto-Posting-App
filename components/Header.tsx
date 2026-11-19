import {
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">

      {/* Search */}

      <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-2">
        <Search size={18} className="text-gray-500" />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-64 bg-transparent text-sm outline-none"
        />
      </div>

      {/* Right Side */}

      <div className="flex items-center gap-6">

        <button className="relative">
          <Bell size={21} className="text-gray-600" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
            A
          </div>

          <div>
            <p className="text-sm font-semibold">
              Admin User
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

          <ChevronDown size={17} />

        </div>

      </div>

    </header>
  );
}