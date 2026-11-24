"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  MessageCircle,
  Image,
  Film,
  Sparkles,
  FolderOpen,
  ListTodo,
  ArrowUpRight,
  Circle,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useUserRole } from "@/components/UserRoleContext";

/* ----------------------------------
   TYPES
---------------------------------- */

interface DashboardSectionsProps {
  selectedCompany: string;
  pipelineData?: {
    draft: number;
    inReview: number;
    scheduled: number;
    published: number;
  };
  companiesList?: {
    id: number;
    name: string;
    industry: string;
    initials: string;
  }[];
}

interface PipelineItem {
  label: string;
  count: number;
  color: string;
  width: string;
}

interface Task {
  id: number;
  title: string;
  companyId: number;
  company: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  completed: boolean;
}

interface CalendarEvent {
  id: number;
  companyId: number;
  day: string;
  date: string;
  title: string;
  time: string;
  platform: string;
}

/* ----------------------------------
   INTEGRATED TOOLS
---------------------------------- */

const tools = [
  {
    name: "Canva",
    description: "Design posts and creatives",
    icon: Image,
    status: "Planned",
  },
  {
    name: "CapCut",
    description: "Edit videos and Reels",
    icon: Film,
    status: "Planned",
  },
  {
    name: "Gemini AI",
    description: "Generate marketing content",
    icon: Sparkles,
    status: "Planned",
  },
  {
    name: "Google Drive",
    description: "Store marketing assets",
    icon: FolderOpen,
    status: "Planned",
  },
  {
    name: "Trello",
    description: "Manage marketing tasks",
    icon: ListTodo,
    status: "Planned",
  },
  {
    name: "Social Platforms",
    description: "Publish across social channels",
    icon: Camera,
    status: "Planned",
  },
];

/* ----------------------------------
   SECTION HEADING COMPONENT
---------------------------------- */

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-xl bg-green-50 p-2.5 text-green-700">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* ----------------------------------
   MAIN DASHBOARD SECTIONS
---------------------------------- */

export default function DashboardSections({
  selectedCompany,
  pipelineData,
  companiesList = [],
}: DashboardSectionsProps) {
  const { isAdmin } = useUserRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCompanyId, setNewTaskCompanyId] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskDue, setNewTaskDue] = useState("");

  useEffect(() => {
    if (companiesList.length > 0 && !newTaskCompanyId) {
      setNewTaskCompanyId(companiesList[0].id.toString());
    }
  }, [companiesList, newTaskCompanyId]);

  useEffect(() => {
    async function loadTasksAndEvents() {
      try {
        setLoadingTasks(true);
        const [tasksRes, postsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/posts"),
        ]);

        if (tasksRes.ok) {
          const rawTasks = await tasksRes.json();
          if (Array.isArray(rawTasks)) {
            setTasks(
              rawTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                companyId: t.companyId,
                company: t.company?.name || `Company ${t.companyId}`,
                priority:
                  t.priority === "HIGH"
                    ? "High"
                    : t.priority === "LOW"
                    ? "Low"
                    : "Medium",
                due: t.dueDate
                  ? new Date(t.dueDate).toISOString().split("T")[0]
                  : "No date",
                completed: Boolean(t.completed),
              }))
            );
          }
        }

        if (postsRes.ok) {
          const rawPosts = await postsRes.json();
          if (Array.isArray(rawPosts)) {
            const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            setEvents(
              rawPosts
                .filter(
                  (p: any) =>
                    p.status === "scheduled" ||
                    p.status === "publishing" ||
                    p.scheduledAt
                )
                .slice(0, 6)
                .map((p: any) => {
                  const dateObj = p.scheduledAt
                    ? new Date(p.scheduledAt)
                    : new Date(p.createdAt);
                  return {
                    id: p.id,
                    companyId: p.companyId,
                    day: dayNames[dateObj.getDay()],
                    date: dateObj.getDate().toString(),
                    title: p.caption
                      ? p.caption.slice(0, 30) + (p.caption.length > 30 ? "..." : "")
                      : "Scheduled Post",
                    time: dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    platform:
                      Array.isArray(p.platforms) && p.platforms.length > 0
                        ? p.platforms[0]
                        : "Instagram",
                  };
                })
            );
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard tasks/events from DB:", err);
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasksAndEvents();
  }, []);

  // Content & Social Pipeline derived from real database
  const draftCount = pipelineData?.draft ?? 0;
  const inReviewCount = pipelineData?.inReview ?? 0;
  const scheduledCount = pipelineData?.scheduled ?? 0;
  const publishedCount = pipelineData?.published ?? 0;
  const totalInPipeline = draftCount + inReviewCount + scheduledCount + publishedCount || 1;

  const pipeline: PipelineItem[] = [
    {
      label: "Draft",
      count: draftCount,
      color: "bg-gray-400",
      width: `${Math.round((draftCount / totalInPipeline) * 100)}%`,
    },
    {
      label: "In Review",
      count: inReviewCount,
      color: "bg-amber-400",
      width: `${Math.round((inReviewCount / totalInPipeline) * 100)}%`,
    },
    {
      label: "Scheduled",
      count: scheduledCount,
      color: "bg-blue-500",
      width: `${Math.round((scheduledCount / totalInPipeline) * 100)}%`,
    },
    {
      label: "Published",
      count: publishedCount,
      color: "bg-green-500",
      width: `${Math.round((publishedCount / totalInPipeline) * 100)}%`,
    },
  ];

  // Filter tasks by selected company
  const filteredTasks = tasks.filter(
    (task) =>
      selectedCompany === "all" || task.companyId.toString() === selectedCompany
  );

  // Filter calendar events by selected company
  const filteredEvents = events.filter(
    (event) =>
      selectedCompany === "all" || event.companyId.toString() === selectedCompany
  );

  // Add a new task directly to database
  async function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDue) return;

    const companyId =
      selectedCompany === "all"
        ? Number(newTaskCompanyId || companiesList[0]?.id || 1)
        : Number(selectedCompany);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          dueDate: newTaskDue,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [
          ...prev,
          {
            id: created.id,
            title: created.title,
            companyId: created.companyId,
            company: created.company?.name || `Company ${created.companyId}`,
            priority: newTaskPriority,
            due: newTaskDue,
            completed: false,
          },
        ]);
        setNewTaskTitle("");
        setNewTaskPriority("Medium");
        setNewTaskDue("");
        setShowTaskForm(false);
      }
    } catch (err) {
      console.error("Failed to add task to database:", err);
    }
  }

  // Toggle task completion in Neon DB
  async function toggleTaskCompletion(taskId: number) {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextCompleted = !target.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted } : t))
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed: nextCompleted }),
      });
    } catch (err) {
      console.error("Failed to toggle task in DB:", err);
    }
  }

  // Delete task from Neon DB
  async function handleDeleteTask(taskId: number) {
    if (!confirm("Are you sure you want to permanently delete this task from the database?")) return;
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error("Failed to delete task from DB:", err);
    }
  }

  const selectedCompanyName =
    selectedCompany === "all"
      ? "All Companies"
      : companiesList.find((c) => c.id.toString() === selectedCompany)?.name ||
        `Company ${selectedCompany}`;

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* LEFT COLUMN */}
      <div className="space-y-6 xl:col-span-2">
        {/* CONTENT & SOCIAL PIPELINE */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeading
              title="Content & Social Pipeline"
              subtitle="Live content stats from Neon database"
              icon={FileText}
            />

            <span className="mb-5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {selectedCompanyName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {pipeline.map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {item.count}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Camera size={14} className="text-pink-600" /> Instagram
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-green-600" /> WhatsApp
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-blue-600" /> Facebook
            </span>
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness size={14} className="text-blue-700" /> LinkedIn
            </span>
            <span className="flex items-center gap-1.5">
              <Video size={14} className="text-gray-900" /> TikTok
            </span>
          </div>
        </section>

        {/* PRIORITY TASK MATRIX */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeading
              title="Priority Task Matrix"
              subtitle="Active tasks stored in database"
              icon={ListTodo}
            />

            <Link
              href="/tasks"
              className="mb-5 text-sm font-medium text-green-700 hover:text-green-800"
            >
              View all tasks →
            </Link>
          </div>

          {loadingTasks ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="animate-spin text-green-700" size={24} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500">
                    <th className="pb-3 font-medium">Task</th>
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Due date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-4 pr-3">
                        <span
                          className={
                            task.completed
                              ? "text-gray-400 line-through"
                              : "font-medium text-gray-800"
                          }
                        >
                          {task.title}
                        </span>
                      </td>

                      <td className="py-4 pr-3 text-gray-500">{task.company}</td>

                      <td className="py-4 pr-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-50 text-red-700"
                              : task.priority === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-4 text-gray-500">
                        {task.due}
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              task.completed
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            {task.completed ? "Completed" : "Mark complete"}
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              title="Delete Task from Database"
                              className="rounded-lg p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-sm text-gray-400"
                      >
                        No tasks found for this workspace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="mt-4 flex items-center gap-2 rounded-lg border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            <Circle size={15} />
            {showTaskForm ? "Cancel" : "Add a task"}
          </button>

          {showTaskForm && (
            <form
              onSubmit={handleAddTask}
              className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <h3 className="font-semibold text-gray-900">Create New Task</h3>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Assign Company
                </label>
                <select
                  value={
                    selectedCompany === "all"
                      ? newTaskCompanyId
                      : selectedCompany
                  }
                  onChange={(e) => setNewTaskCompanyId(e.target.value)}
                  disabled={selectedCompany !== "all"}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm disabled:bg-gray-100"
                >
                  {companiesList.map((company) => (
                    <option key={company.id} value={company.id.toString()}>
                      {company.name} ({company.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(
                      e.target.value as "High" | "Medium" | "Low"
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Create Task
              </button>
            </form>
          )}
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        {/* CALENDAR WEEK */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <SectionHeading
              title="Calendar Week"
              subtitle="Upcoming posts from database"
              icon={CalendarDays}
            />

            <Link
              href="/planner"
              aria-label="Open calendar"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className="w-11 shrink-0 rounded-lg bg-gray-50 py-2 text-center">
                  <p className="text-[10px] font-semibold text-gray-400">
                    {event.day}
                  </p>
                  <p className="mt-0.5 text-base font-bold text-gray-800">
                    {event.date}
                  </p>
                </div>

                <div className="min-w-0 flex-1 border-b border-gray-100 pb-3">
                  <p className="text-sm font-medium text-gray-800">
                    {event.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Clock3 size={12} />
                    {event.time} · {event.platform}
                  </p>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                No scheduled posts found in database.
              </p>
            )}
          </div>

          <Link
            href="/planner"
            className="mt-4 block w-full rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open full planner
          </Link>
        </section>

        {/* INTEGRATED TOOLS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeading
            title="Integrated Tools"
            subtitle="Your marketing tools in one workspace"
            icon={Sparkles}
          />

          <div className="space-y-3">
            {tools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50/40"
                >
                  <div className="rounded-lg bg-gray-100 p-2.5 text-gray-700">
                    <ToolIcon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {tool.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {tool.description}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                    {tool.status}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-400">
            Tool connections will be activated as we implement their APIs and
            authentication.
          </p>
        </section>
      </div>
    </div>
  );
}
