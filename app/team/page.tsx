"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Mail,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STRATEGIST" | "MANAGER" | "DESIGNER" | "COPYWRITER";
  avatar: string | null;
  createdAt: string;
  companyMembers?: {
    company: {
      id: number;
      name: string;
    };
  }[];
}

export default function TeamPage() {
  const [team, setTeam] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRecord["role"]>("MANAGER");
  const [submitting, setSubmitting] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error("Failed to load team from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredTeam = team.filter((member) => {
    const matchesRole =
      selectedRole === "all" || member.role === selectedRole.toUpperCase();
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTeam([...team, created]);
        setInviteName("");
        setInviteEmail("");
        setIsInviteOpen(false);
      }
    } catch (err) {
      console.error("Failed to invite member:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeam(team.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
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
            Marketing Team & Collaborators
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live team records synchronized with Neon PostgreSQL database.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Plus size={18} />
          <span>Invite Team Member</span>
        </button>
      </section>

      {/* Team Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total in Database</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{team.length}</p>
          <p className="mt-1 text-xs text-green-700 font-medium">PostgreSQL Synchronized</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Administrators</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {team.filter((m) => m.role === "ADMIN").length}
          </p>
          <p className="mt-1 text-xs text-green-700 font-medium">Full privileges</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Strategists & Managers</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {team.filter((m) => m.role === "STRATEGIST" || m.role === "MANAGER").length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Campaign operations</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Creators & Designers</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {team.filter((m) => m.role === "DESIGNER" || m.role === "COPYWRITER").length}
          </p>
          <p className="mt-1 text-xs text-gray-500">Content production</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search member name or email in DB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter size={15} />
            <span>Role:</span>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="STRATEGIST">Content Strategist</option>
            <option value="MANAGER">Social Media Manager</option>
            <option value="DESIGNER">Graphic Designer</option>
            <option value="COPYWRITER">Copywriter</option>
          </select>
        </div>
      </section>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Querying team members from Neon Database...
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 font-bold text-green-800 text-base shadow-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {member.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {member.role !== "ADMIN" && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      title="Remove member"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Role badge */}
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      member.role === "ADMIN"
                        ? "bg-green-50 text-green-800"
                        : member.role === "STRATEGIST"
                          ? "bg-purple-50 text-purple-700"
                          : member.role === "MANAGER"
                            ? "bg-blue-50 text-blue-700"
                            : member.role === "DESIGNER"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <ShieldCheck size={13} />
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 border-t border-gray-100 pt-3 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Created {new Date(member.createdAt).toLocaleDateString()}</span>
                <span className="text-green-700 font-semibold">Active in DB</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">Add Team Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel@markethub.internal"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="STRATEGIST">Content Strategist</option>
                  <option value="MANAGER">Social Media Manager</option>
                  <option value="DESIGNER">Graphic Designer</option>
                  <option value="COPYWRITER">Copywriter</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : "Save Member to DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
