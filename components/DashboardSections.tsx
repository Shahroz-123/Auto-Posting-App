"use client";
import { useState } from "react";
import { companies } from "@/lib/data";
import {
  CalendarDays,
  Clock3,
  FileText,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  Image,
  Film,
  Sparkles,
  FolderOpen,
  ListTodo,
  ArrowUpRight,
  Circle,
} from "lucide-react";

/* ----------------------------------
   TYPES
---------------------------------- */

interface DashboardSectionsProps {
  selectedCompany: string;
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
   SAMPLE PIPELINE DATA
---------------------------------- */

const pipelineData: Record<number, PipelineItem[]> = {
  1: [
    { label: "Draft", count: 4, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 2, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 5, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 8, color: "bg-green-500", width: "25%" },
  ],
  2: [
    { label: "Draft", count: 3, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 1, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 2, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 6, color: "bg-green-500", width: "25%" },
  ],
  3: [
    { label: "Draft", count: 2, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 3, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 4, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 5, color: "bg-green-500", width: "25%" },
  ],
  4: [
    { label: "Draft", count: 3, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 2, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 3, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 7, color: "bg-green-500", width: "25%" },
  ],
  5: [
    { label: "Draft", count: 1, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 2, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 2, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 4, color: "bg-green-500", width: "25%" },
  ],
  6: [
    { label: "Draft", count: 2, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 1, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 3, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 5, color: "bg-green-500", width: "25%" },
  ],
  7: [
    { label: "Draft", count: 4, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 2, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 2, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 6, color: "bg-green-500", width: "25%" },
  ],
  8: [
    { label: "Draft", count: 2, color: "bg-gray-400", width: "30%" },
    { label: "In Review", count: 1, color: "bg-amber-400", width: "20%" },
    { label: "Scheduled", count: 3, color: "bg-blue-500", width: "25%" },
    { label: "Published", count: 5, color: "bg-green-500", width: "25%" },
  ],
};

/* ----------------------------------
   SAMPLE TASK DATA
---------------------------------- */

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finalize Instagram campaign",
    companyId: 1,
    company: "Company One",
    priority: "High",
    due: "2026-11-17",
    completed: false,
  },
  {
    id: 2,
    title: "Review product launch creatives",
    companyId: 4,
    company: "Company Four",
    priority: "High",
    due: "2026-11-17",
    completed: false,
  },
  {
    id: 3,
    title: "Prepare LinkedIn content",
    companyId: 2,
    company: "Company Two",
    priority: "Medium",
    due: "2026-11-18",
    completed: false,
  },
  {
    id: 4,
    title: "Upload weekly video assets",
    companyId: 5,
    company: "Company Five",
    priority: "Low",
    due: "2026-11-20",
    completed: false,
  },
  {
    id: 5,
    title: "Prepare healthcare awareness post",
    companyId: 3,
    company: "Company Three",
    priority: "High",
    due: "2026-11-18",
    completed: false,
  },
  {
    id: 6,
    title: "Review fashion campaign",
    companyId: 7,
    company: "Company Seven",
    priority: "Medium",
    due: "2026-11-21",
    completed: false,
  },
];
/* ----------------------------------
   SAMPLE CALENDAR DATA
---------------------------------- */

const weekEvents: CalendarEvent[] = [
  {
    id: 1,
    companyId: 1,
    day: "MON",
    date: "16",
    title: "Instagram campaign",
    time: "10:00 AM",
    platform: "Instagram",
  },
  {
    id: 2,
    companyId: 2,
    day: "TUE",
    date: "17",
    title: "LinkedIn company update",
    time: "12:30 PM",
    platform: "LinkedIn",
  },
  {
    id: 3,
    companyId: 4,
    day: "WED",
    date: "18",
    title: "Product launch video",
    time: "02:00 PM",
    platform: "TikTok",
  },
  {
    id: 4,
    companyId: 3,
    day: "THU",
    date: "19",
    title: "Healthcare awareness post",
    time: "11:00 AM",
    platform: "Facebook",
  },
  {
    id: 5,
    companyId: 5,
    day: "FRI",
    date: "20",
    title: "Weekly marketing review",
    time: "03:00 PM",
    platform: "Internal",
  },
];

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
}: DashboardSectionsProps) {
  // Get the selected company's pipeline.
  // When "all" is selected, combine all company statistics.

  const pipeline: PipelineItem[] =
    selectedCompany === "all"
      ? [
          {
            label: "Draft",
            count: Object.values(pipelineData)
              .flat()
              .filter((item) => item.label === "Draft")
              .reduce((sum, item) => sum + item.count, 0),
            color: "bg-gray-400",
            width: "30%",
          },
          {
            label: "In Review",
            count: Object.values(pipelineData)
              .flat()
              .filter((item) => item.label === "In Review")
              .reduce((sum, item) => sum + item.count, 0),
            color: "bg-amber-400",
            width: "20%",
          },
          {
            label: "Scheduled",
            count: Object.values(pipelineData)
              .flat()
              .filter((item) => item.label === "Scheduled")
              .reduce((sum, item) => sum + item.count, 0),
            color: "bg-blue-500",
            width: "25%",
          },
          {
            label: "Published",
            count: Object.values(pipelineData)
              .flat()
              .filter((item) => item.label === "Published")
              .reduce((sum, item) => sum + item.count, 0),
            color: "bg-green-500",
            width: "25%",
          },
        ]
      : (pipelineData[Number(selectedCompany)] ?? []);

  // Filter tasks by selected company.

  const filteredTasks = initialTasks.filter(
    (task) =>
      selectedCompany === "all" ||
      task.companyId.toString() === selectedCompany,
  );

  // Filter calendar events by selected company.

  const filteredEvents = weekEvents.filter(
    (event) =>
      selectedCompany === "all" ||
      event.companyId.toString() === selectedCompany,
  );

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [showTaskForm, setShowTaskForm] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [newTaskCompanyId, setNewTaskCompanyId] = useState("1");

  const [newTaskPriority, setNewTaskPriority] = useState<
    "High" | "Medium" | "Low"
  >("Medium");

  const [newTaskDue, setNewTaskDue] = useState("");

  // Add a new task
  function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTaskTitle.trim() || !newTaskDue) {
      return;
    }

    const companyId =
      selectedCompany === "all"
        ? Number(newTaskCompanyId)
        : Number(selectedCompany);

    const selectedCompanyData = companies.find(
      (company) => company.id === companyId,
    );

    if (!selectedCompanyData) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      companyId,
      company: selectedCompanyData.name,
      priority: newTaskPriority,
      due: newTaskDue,
      completed: false,
    };

    setTasks((previousTasks) => [...previousTasks, newTask]);

    // Reset form
    setNewTaskTitle("");
    setNewTaskPriority("Medium");
    setNewTaskDue("");
    setShowTaskForm(false);
  }

  // Mark task as completed or pending
  function toggleTaskCompletion(taskId: number) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* LEFT COLUMN */}

      <div className="space-y-6 xl:col-span-2">
        {/* CONTENT & SOCIAL PIPELINE */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeading
              title="Content & Social Pipeline"
              subtitle="Track content from creation to publication"
              icon={FileText}
            />

            <span className="mb-5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {selectedCompany === "all"
                ? "All Companies"
                : `Company ${selectedCompany}`}
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
              <Camera size={14} />
              Instagram
            </span>

            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              Facebook
            </span>

            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness size={14} />
              LinkedIn
            </span>

            <span className="flex items-center gap-1.5">
              <Video size={14} />
              TikTok
            </span>
          </div>
        </section>

        {/* PRIORITY TASK MATRIX */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionHeading
              title="Priority Task Matrix"
              subtitle="Keep important marketing work on track"
              icon={ListTodo}
            />

            <button className="mb-5 text-sm font-medium text-green-700 hover:text-green-800">
              View all tasks →
            </button>
          </div>

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
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          task.completed
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {task.completed ? "Completed" : "Mark complete"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      No tasks available for this company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

              {/* Task title */}

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

              {/* Company selection */}

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
                  {companies.map((company) => (
                    <option key={company.id} value={company.id.toString()}>
                      {company.name}
                    </option>
                  ))}
                </select>

                {selectedCompany !== "all" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Task will be assigned to the selected company.
                  </p>
                )}
              </div>

              {/* Priority */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Priority
                </label>

                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(
                      e.target.value as "High" | "Medium" | "Low",
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Deadline */}

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

              {/* Submit */}

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
              subtitle="Upcoming posts and activities"
              icon={CalendarDays}
            />

            <button
              aria-label="Open calendar"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="mb-4 rounded-xl bg-green-50 p-3">
            <p className="text-xs font-medium text-green-700">THIS WEEK</p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              November 16–20, 2026
            </p>
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
                No scheduled activities for this company.
              </p>
            )}
          </div>

          <button className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Open full calendar
          </button>
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
