"use client";

import { useEffect, useState } from "react";
import {
  Images,
  UploadCloud,
  Search,
  Film,
  Image,
  FolderOpen,
  Trash2,
  Copy,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface MediaRecord {
  id: number;
  companyId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Upload Form State
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "video" | "graphic">("image");
  const [uploadCompanyId, setUploadCompanyId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMediaAndCompanies = async () => {
    try {
      setLoading(true);
      const [resMedia, resCompanies] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/companies"),
      ]);

      if (resMedia.ok) {
        const mediaData = await resMedia.json();
        setMediaList(mediaData);
      }
      if (resCompanies.ok) {
        const companiesData = await resCompanies.json();
        setCompanies(companiesData);
        if (companiesData.length > 0 && !uploadCompanyId) {
          setUploadCompanyId(companiesData[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to load media from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaAndCompanies();
  }, []);

  const filteredMedia = mediaList.filter((item) => {
    const matchesType = selectedType === "all" || item.fileType === selectedType;
    const matchesCompany =
      selectedCompany === "all" || item.companyId.toString() === selectedCompany;
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCompany && matchesSearch;
  });

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaList(mediaList.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  const handleCopy = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: Number(uploadCompanyId),
          fileName: uploadName.includes(".")
            ? uploadName
            : `${uploadName}.${uploadType === "video" ? "mp4" : "png"}`,
          fileType: uploadType,
          fileUrl: `/uploads/${uploadName}`,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setMediaList([created, ...mediaList]);
        setUploadName("");
        setIsUploadOpen(false);
      }
    } catch (err) {
      console.error("Failed to save media asset to DB:", err);
    } finally {
      setSubmitting(false);
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
            Media & Asset Library
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Asset metadata loaded live from your Neon PostgreSQL database.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-green-800"
        >
          <UploadCloud size={18} />
          <span>Upload Asset</span>
        </button>
      </section>

      {/* Storage Usage Bar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Database Media Records
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {mediaList.length} Assets <span className="text-sm font-normal text-gray-500">recorded in PostgreSQL</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Images (
              {mediaList.filter((m) => m.fileType === "image").length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Videos (
              {mediaList.filter((m) => m.fileType === "video").length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Graphics (
              {mediaList.filter((m) => m.fileType === "graphic").length})
            </span>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All Assets" },
            { key: "image", label: "Images" },
            { key: "video", label: "Videos" },
            { key: "graphic", label: "Graphics" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedType(tab.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedType === tab.key
                  ? "bg-green-700 text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Company Filter */}
        <div className="flex flex-1 max-w-lg items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search file name or company in DB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

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

      {/* Media Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={32} className="animate-spin text-green-700" />
          <p className="mt-3 text-sm font-semibold text-gray-600">
            Fetching assets from Neon Database...
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
            >
              {/* Visual Thumbnail Preview */}
              <div className="relative flex h-44 w-full items-center justify-center bg-linear-to-br from-green-50/70 via-gray-50 to-gray-100 p-4">
                <div className="text-center">
                  {asset.fileType === "video" ? (
                    <Film size={36} className="mx-auto text-blue-600 mb-2" />
                  ) : asset.fileType === "graphic" ? (
                    <FolderOpen size={36} className="mx-auto text-amber-500 mb-2" />
                  ) : (
                    <Image size={36} className="mx-auto text-green-700 mb-2" />
                  )}
                  <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-gray-700 shadow-2xs uppercase">
                    {asset.fileType}
                  </span>
                </div>

                {/* Company Tag */}
                <span className="absolute top-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-green-800 shadow-xs">
                  {asset.company?.name ?? `Company #${asset.companyId}`}
                </span>
              </div>

              {/* Details */}
              <div className="p-4">
                <p className="truncate text-sm font-bold text-gray-900" title={asset.fileName}>
                  {asset.fileName}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                  <span>Recorded {new Date(asset.createdAt).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(asset.id)}
                      title="Copy URL"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-700 transition"
                    >
                      {copiedId === asset.id ? (
                        <CheckCircle2 size={15} className="text-green-700" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(asset.id)}
                      title="Delete Asset"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMedia.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
              <Images size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No assets found in database</p>
            </div>
          )}
        </section>
      )}

      {/* Upload Asset Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">Upload Media Asset</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Asset Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. holiday-promo-hero.png"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Assign Company
                </label>
                <select
                  value={uploadCompanyId}
                  onChange={(e) => setUploadCompanyId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Asset Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="image">Image (PNG/JPG)</option>
                  <option value="video">Video / Reel (MP4)</option>
                  <option value="graphic">Graphic / Logo</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
