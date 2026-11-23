"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  X,
  Clock3,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface TaskRecord {
  id: number;
  companyId: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  completed: boolean;
  company: {
    id: number;
    name: string;
  };
  assignedTo?: {
    id: number;
    name: string;
  } | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string; industry: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("2026-11-25");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasksAndCompanies = async () => {
    try {
      setLoading(true);
      const [resTasks, resCompanies] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/companies"),
      ]);

      if (resTasks.ok) {
        const tasksData = await resTasks.json();
        setTasks(tasksData);
      }
      if (resCompanies.ok) {
        const companiesData = await resCompanies.json();
        setCompanies(companiesData);
        if (companiesData.length > 0 && !newCompanyId) {
          setNewCompanyId(companiesData[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to load tasks from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndCompanies();
  }, []);

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    const updatedStatus = !task?.completed;

    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: updatedStatus }),
      });
    } catch (err) {
      console.error("Failed to update task in db:", err);
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: Number(newCompanyId),
          title: newTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate,
        }),
      });

      if (res.ok) {
        const createdTask = await res.json();
        setTasks([createdTask, ...tasks]);
        setNewTitle("");
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to save task to db:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCompany =
      selectedCompany === "all" || task.companyId.toString() === selectedCompany;
    const matchesPriority =
      selectedPriority === "all" || task.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "completed" ? task.completed : !task.completed);
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.company.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCompany && matchesPriority && matchesStatus && matchesSearch;
  });

  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH" && !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-8 p-8">
      {/* Back Button */}
      <BackButton href="/" label="Back to Dashboard" />

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Marketing Tasks & Operations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live task records synced in real-time with Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Plus size={18} />
          <span>Create Task</span>
        </button>
      </section>

      {/* Stats Counters */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Pending Tasks</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{pendingCount}</p>
          <p className="mt-1 text-xs text-gray-500">Active in database</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">High Priority</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{highPriorityCount}</p>
          <p className="mt-1 text-xs text-red-700 font-medium">Needs urgent attention</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{completedCount}</p>
          <p className="mt-1 text-xs text-green-700 font-medium">Synced with PostgreSQL</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Completion Rate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Overall velocity</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search task or company in DB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-green-600"
          >
            <option value="all">All Companies in DB</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Task List Table */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Loading tasks from Neon PostgreSQL...
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 pl-2 w-10">Done</th>
                  <th className="pb-3">Task Details</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`transition ${
                      task.completed ? "bg-gray-50/40 opacity-75" : "hover:bg-gray-50/70"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 pl-2 pr-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                          task.completed
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 bg-white hover:border-green-600 text-transparent"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-4 pr-4">
                      <p
                        className={`text-sm font-semibold transition ${
                          task.completed ? "text-gray-400 line-through" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </p>
                    </td>

                    {/* Company */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-800">
                        {task.company?.name ?? `Company #${task.companyId}`}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          task.priority === "HIGH"
                            ? "bg-red-50 text-red-700"
                            : task.priority === "MEDIUM"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 pr-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock3 size={13} className="text-gray-400" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 pr-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete Task"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                      No tasks found in database matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">Create New Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prepare TikTok Reel audio snippet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Assign Company
                </label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : "Save Task to DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
