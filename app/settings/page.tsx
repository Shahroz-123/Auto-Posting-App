"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Share2,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  MessageCircle,
  Key,
  RefreshCw,
  Save,
  AlertCircle,
  Building2,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import ConnectSocialModal from "@/components/ConnectSocialModal";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "automation" | "notifications">("general");
  const [savedNotice, setSavedNotice] = useState(false);

  // General Settings State
  const [portalName, setPortalName] = useState("MarketHub");
  const [supportEmail, setSupportEmail] = useState("admin@markethub.internal");
  const [timezone, setTimezone] = useState("Asia/Karachi (GMT+05:00)");
  const [defaultCurrency, setDefaultCurrency] = useState("USD ($)");

  // Company Social Accounts State
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companySocials, setCompanySocials] = useState<any[]>([]);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCompaniesList(data);
          setSelectedCompanyId(data[0].id.toString());
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const loadCompanySocials = (cId: string) => {
    if (!cId) return;
    fetch(`/api/social-accounts?companyId=${cId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanySocials(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (selectedCompanyId) {
      loadCompanySocials(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const selectedCompany = companiesList.find(
    (c) => c.id.toString() === selectedCompanyId
  );

  // Integrations State
  const [integrations, setIntegrations] = useState([
    {
      id: "meta",
      name: "Meta Business Suite",
      description: "Direct posting to Facebook Pages & Instagram Business accounts",
      connected: true,
      account: "MarketHub Meta App #84920",
      status: "Operational",
      icon: Camera,
      badge: "Facebook & Instagram",
    },
    {
      id: "linkedin",
      name: "LinkedIn Marketing Developer API",
      description: "Company page updates, document carousels, and article sharing",
      connected: true,
      account: "MarketHub LinkedIn v2",
      status: "Operational",
      icon: BriefcaseBusiness,
      badge: "LinkedIn Pages",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business Cloud API",
      description: "Direct broadcasts, product catalogs, and channel announcements",
      connected: true,
      account: "WhatsApp Business Cloud #77192",
      status: "Operational",
      icon: MessageCircle,
      badge: "WhatsApp Cloud",
    },
    {
      id: "tiktok",
      name: "TikTok for Business API",
      description: "Direct video publishing to company TikTok accounts and analytics",
      connected: false,
      account: "Not connected",
      status: "Setup Required",
      icon: Video,
      badge: "TikTok Video",
    },
    {
      id: "canva",
      name: "Canva Connect Partner API",
      description: "Export designs and creatives straight into MarketHub Media Library",
      connected: true,
      account: "Enterprise Pro Team",
      status: "Operational",
      icon: Globe,
      badge: "Design Suite",
    },
  ]);

  // Automation State
  const [autoRetry, setAutoRetry] = useState(true);
  const [smartTiming, setSmartTiming] = useState(true);
  const [defaultHashtags, setDefaultHashtags] = useState("#Marketing #DigitalMarketing #BusinessGrowth");

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [failedPostAlert, setFailedPostAlert] = useState(true);

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              connected: !item.connected,
              status: !item.connected ? "Operational" : "Disconnected",
            }
          : item
      )
    );
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Back Button */}
      <BackButton href="/" label="Back to Dashboard" />

      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Portal & Workspace Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage connected social media platforms, API keys, publishing preferences, and notifications.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </section>

      {/* Saved Toast Alert */}
      {savedNotice && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 animate-in fade-in">
          <CheckCircle2 size={18} className="text-green-700" />
          <span>Settings saved successfully across all 8 company workspaces!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { key: "general", label: "General Settings", icon: Settings },
          { key: "integrations", label: "Social API Integrations", icon: Share2 },
          { key: "automation", label: "Publishing & Automation", icon: Sliders },
          { key: "notifications", label: "Notifications & Alerts", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-green-700 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === "general" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">
              Agency & Portal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Portal Display Name
                </label>
                <input
                  type="text"
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Admin System Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Default Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="Asia/Karachi (GMT+05:00)">Asia/Karachi (GMT+05:00)</option>
                  <option value="Asia/Dubai (GMT+04:00)">Asia/Dubai (GMT+04:00)</option>
                  <option value="Europe/London (GMT+00:00)">Europe/London (GMT+00:00)</option>
                  <option value="America/New_York (GMT-05:00)">America/New_York (GMT-05:00)</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  All scheduled drops and calendar times adhere to this timezone.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Currency for Ad Budgets
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="PKR (Rs)">PKR (Rs)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Social API Integrations */}
      {activeTab === "integrations" && (
        <section className="space-y-6">
          {/* Company-Specific Social Accounts Connection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Client Organization Social Accounts
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Connect verified Facebook Pages, Instagram, LinkedIn, and TikTok channels per company for auto-posting.
                </p>
              </div>

              {selectedCompany && (
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(true)}
                  className="rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-green-800"
                >
                  ⚡ Connect / Manage {selectedCompany.name} Accounts
                </button>
              )}
            </div>

            {/* Select Organization */}
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-green-700" />
                <span className="text-xs font-semibold text-gray-700">Select Client Organization:</span>
              </div>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-green-600 md:w-64"
              >
                {companiesList.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name} ({c.industry})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Grid for this Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { key: "INSTAGRAM", label: "Instagram Business", icon: Camera, color: "text-pink-600", bg: "bg-pink-50" },
                { key: "WHATSAPP", label: "WhatsApp Business", icon: MessageCircle, color: "text-green-600", bg: "bg-green-50" },
                { key: "FACEBOOK", label: "Facebook Page", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                { key: "LINKEDIN", label: "LinkedIn Company", icon: BriefcaseBusiness, color: "text-blue-700", bg: "bg-blue-50" },
                { key: "TIKTOK", label: "TikTok for Business", icon: Video, color: "text-gray-900", bg: "bg-gray-100" },
              ].map((plat) => {
                const Icon = plat.icon;
                const connectedAccount = companySocials.find(
                  (a) => a.platform === plat.key && a.connected
                );
                return (
                  <div
                    key={plat.key}
                    className="rounded-xl border border-gray-200 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plat.bg}`}>
                        <Icon size={20} className={plat.color} />
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          connectedAccount
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {connectedAccount ? "Connected" : "Disconnected"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-900">{plat.label}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {connectedAccount ? connectedAccount.accountName : "No account linked"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSocialModalOpen(true)}
                      className="w-full rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      {connectedAccount ? "Configure" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Global Developer APIs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              Agency Platform Developer Apps
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Underlying developer API gateways enabling auto-posting protocols.
            </p>

            <div className="mt-6 space-y-4">
              {integrations.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-green-50 p-3 text-green-700">
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            {item.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                        <p className="mt-2 text-xs font-medium text-gray-700">
                          Account: <span className="text-gray-500">{item.account}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.connected
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.status}
                      </span>

                      <button
                        onClick={() => toggleIntegration(item.id)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          item.connected
                            ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                            : "bg-green-700 text-white hover:bg-green-800"
                        }`}
                      >
                        {item.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Automation Rules */}
      {activeTab === "automation" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">
              Automated Publishing & Content Engine
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Auto-Retry Failed Social Drops</p>
                  <p className="text-xs text-gray-500">
                    Automatically retry publishing up to 3 times with exponential backoff if platform API fails.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRetry}
                  onChange={(e) => setAutoRetry(e.target.checked)}
                  className="h-5 w-5 accent-green-700 rounded"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">AI Optimal Engagement Timing</p>
                  <p className="text-xs text-gray-500">
                    Suggest optimal publishing hours during post scheduling based on historical audience metrics.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smartTiming}
                  onChange={(e) => setSmartTiming(e.target.checked)}
                  className="h-5 w-5 accent-green-700 rounded"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Global Default Brand Hashtags
                </label>
                <input
                  type="text"
                  value={defaultHashtags}
                  onChange={(e) => setDefaultHashtags(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Pre-populates new posts in Create & Publish screen.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">
              Email & System Alerts
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Immediate Post Failure Alerts</p>
                  <p className="text-xs text-gray-500">
                    Receive urgent email notifications if a scheduled drop fails or account token expires.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={failedPostAlert}
                  onChange={(e) => setFailedPostAlert(e.target.checked)}
                  className="h-5 w-5 accent-green-700 rounded"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Weekly Executive Digest</p>
                  <p className="text-xs text-gray-500">
                    Receive weekly Monday summary of total reach, published posts, and task velocity.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  className="h-5 w-5 accent-green-700 rounded"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Team Task Assignments</p>
                  <p className="text-xs text-gray-500">
                    Send notification email when a team member assigns a marketing task.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-5 w-5 accent-green-700 rounded"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Connect Social Accounts Modal */}
      {isSocialModalOpen && selectedCompany && (
        <ConnectSocialModal
          company={{
            id: selectedCompany.id,
            name: selectedCompany.name,
            industry: selectedCompany.industry,
            initials: selectedCompany.initials || "MH",
          }}
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          onUpdated={() => loadCompanySocials(selectedCompanyId)}
        />
      )}
    </div>
  );
}

