"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Images,
  UploadCloud,
  Search,
  Film,
  Image as ImageIcon,
  FolderOpen,
  Trash2,
  Copy,
  CheckCircle2,
  X,
  Loader2,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface MediaRecord {
  id: number;
  companyId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  company: {
    id: number;
    name: string;
    industry: string;
  };
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaRecord[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaRecord | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [failedPreviewIds, setFailedPreviewIds] = useState<Record<number, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Upload Form State
  const [uploadName, setUploadName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const localPreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  );
  const [uploadType, setUploadType] = useState<"image" | "video" | "graphic">("image");
  const [uploadCompanyId, setUploadCompanyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [resMedia, resCompanies] = await Promise.all([
          fetch("/api/media"),
          fetch("/api/companies"),
        ]);

        if (!active) return;

        if (resMedia.ok) {
          const mediaData = await resMedia.json();
          setMediaList(mediaData);
        }
        if (resCompanies.ok) {
          const companiesData = await resCompanies.json();
          setCompanies(companiesData);
          if (companiesData.length > 0) {
            setUploadCompanyId((prev) => prev || companiesData[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load media from DB:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const filteredMedia = mediaList.filter((item) => {
    const matchesType = selectedType === "all" || item.fileType === selectedType;
    const matchesCompany =
      selectedCompany === "all" || item.companyId.toString() === selectedCompany;
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesCompany && matchesSearch;
  });

  const totalStorageBytes = mediaList.reduce((acc, item) => acc + (item.fileSize || 0), 0);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        if (previewAsset?.id === id) {
          setPreviewAsset(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  const handleCopy = async (asset: MediaRecord) => {
    const fullUrl =
      asset.fileUrl.startsWith("http")
        ? asset.fileUrl
        : `${window.location.origin}${asset.fileUrl}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Fallback for non-HTTPS contexts
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelection = (file: File) => {
    setUploadError(null);
    setSelectedFile(file);
    if (!uploadName) setUploadName(file.name);
    if (file.type.startsWith("video/")) {
      setUploadType("video");
    } else if (file.type === "image/svg+xml") {
      setUploadType("graphic");
    } else {
      setUploadType("image");
    }
  };

  const resetUploadModal = () => {
    setIsUploadOpen(false);
    setUploadName("");
    setSelectedFile(null);
    setUploadError(null);
    setIsDragging(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!selectedFile && !uploadName.trim()) {
      setUploadError("Please select a file or enter an asset title.");
      return;
    }

    if (!uploadCompanyId) {
      setUploadError("Please select a company workspace.");
      return;
    }

    try {
      setSubmitting(true);

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("companyId", uploadCompanyId);
        formData.append("fileType", uploadType);
        if (uploadName.trim()) {
          formData.append("fileName", uploadName.trim());
        }

        const resUpload = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await resUpload.json();
        if (!resUpload.ok) {
          setUploadError(uploadData.error || "Failed to upload file.");
          return;
        }

        if (uploadData.mediaRecord) {
          setMediaList((prev) => [uploadData.mediaRecord, ...prev]);
          resetUploadModal();
          return;
        }

        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: Number(uploadCompanyId),
            fileName: uploadData.fileName || uploadName.trim(),
            fileType: uploadData.fileType || uploadType,
            fileUrl: uploadData.url,
            mimeType: uploadData.mimeType,
            fileSize: uploadData.size,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json();
          setUploadError(errJson.error || "Failed to save media record.");
          return;
        }

        const created = await res.json();
        setMediaList((prev) => [created, ...prev]);
        resetUploadModal();
        return;
      }

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: Number(uploadCompanyId),
          fileName: uploadName.includes(".")
            ? uploadName
            : `${uploadName}.${uploadType === "video" ? "mp4" : "png"}`,
          fileType: uploadType,
          fileUrl: `/previews/placeholder.png`,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        setUploadError(errJson.error || "Failed to save media record.");
        return;
      }

      const created = await res.json();
      setMediaList((prev) => [created, ...prev]);
      resetUploadModal();
    } catch (err: unknown) {
      console.error("Failed to save media asset to DB:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFallbackIcon = (fileType: string) => (
    <div className="text-center">
      {fileType === "video" ? (
        <Film size={36} className="mx-auto text-blue-600 mb-2" />
      ) : fileType === "graphic" ? (
        <FolderOpen size={36} className="mx-auto text-amber-500 mb-2" />
      ) : (
        <ImageIcon size={36} className="mx-auto text-green-700 mb-2" />
      )}
      <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-gray-700 shadow-2xs uppercase">
        {fileType}
      </span>
    </div>
  );

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
            Images and assets stored in your Neon PostgreSQL database & media storage.
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
              Media Storage Summary
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {mediaList.length} Assets{" "}
              <span className="text-sm font-normal text-gray-500">
                ({totalStorageBytes > 0 ? `${formatBytes(totalStorageBytes)} stored` : "recorded in PostgreSQL"})
              </span>
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
          {filteredMedia.map((asset) => {
            const hasFailed = failedPreviewIds[asset.id];
            const isVideo = asset.fileType === "video";

            return (
              <div
                key={asset.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
              >
                {/* Visual Thumbnail Preview */}
                <div
                  onClick={() => setPreviewAsset(asset)}
                  className="relative flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden bg-linear-to-br from-green-50/70 via-gray-50 to-gray-100"
                >
                  {!hasFailed && asset.fileUrl ? (
                    isVideo ? (
                      <video
                        src={asset.fileUrl}
                        muted
                        playsInline
                        preload="metadata"
                        onError={() =>
                          setFailedPreviewIds((prev) => ({ ...prev, [asset.id]: true }))
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        loading="lazy"
                        onError={() =>
                          setFailedPreviewIds((prev) => ({ ...prev, [asset.id]: true }))
                        }
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="p-4">{renderFallbackIcon(asset.fileType)}</div>
                  )}

                  {/* Company Tag */}
                  <span className="absolute top-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-green-800 shadow-xs">
                    {asset.company?.name ?? `Company #${asset.companyId}`}
                  </span>

                  {/* Type Badge */}
                  <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-xs">
                    {asset.fileType}
                  </span>

                  {/* Hover Preview Hint */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
                      <Eye size={14} /> Preview
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-gray-900" title={asset.fileName}>
                      {asset.fileName}
                    </p>
                    {asset.fileSize ? (
                      <span className="shrink-0 text-[10px] font-semibold text-gray-400">
                        {formatBytes(asset.fileSize)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                    <span>Recorded {new Date(asset.createdAt).toLocaleDateString()}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        title="Preview Asset"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-700 transition"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        onClick={() => handleCopy(asset)}
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
            );
          })}

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
                onClick={resetUploadModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              {uploadError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drag & Drop + File Picker */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) handleFileSelection(droppedFile);
                }}
                className={`rounded-xl border-2 border-dashed p-4 text-center transition ${
                  isDragging
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-gray-50/50 hover:border-green-500"
                }`}
              >
                {localPreviewUrl && selectedFile ? (
                  <div className="space-y-2">
                    {selectedFile.type.startsWith("video/") ? (
                      <video
                        src={localPreviewUrl}
                        controls
                        className="mx-auto max-h-36 rounded-lg"
                      />
                    ) : (
                      <img
                        src={localPreviewUrl}
                        alt="Upload preview"
                        className="mx-auto max-h-36 rounded-lg object-contain"
                      />
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="truncate font-medium">{selectedFile.name}</span>
                      <span className="shrink-0 text-gray-400">
                        {formatBytes(selectedFile.size)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <UploadCloud size={28} className="mx-auto text-green-700" />
                    <p className="mt-1.5 text-xs font-semibold text-gray-700">
                      Drag & drop an image or video here
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      PNG, JPG, WEBP, GIF, SVG, MP4 (Max 50 MB)
                    </p>
                  </div>
                )}

                <label className="mt-3 inline-block cursor-pointer rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                  <span>{selectedFile ? "Change File" : "Choose File"}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelection(f);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

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
                  onChange={(e) => setUploadType(e.target.value as "image" | "video" | "graphic")}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-green-600"
                >
                  <option value="image">Image (PNG/JPG/WEBP)</option>
                  <option value="video">Video / Reel (MP4)</option>
                  <option value="graphic">Graphic / Logo</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetUploadModal}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-green-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {submitting ? "Saving to Storage..." : "Save to Library"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Preview Lightbox Modal */}
      {previewAsset && (
        <div
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-gray-900">{previewAsset.fileName}</h3>
                <p className="text-xs text-gray-500">
                  {previewAsset.company?.name ?? `Company #${previewAsset.companyId}`} ·{" "}
                  {previewAsset.fileType.toUpperCase()} · {formatBytes(previewAsset.fileSize)}
                </p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex max-h-[60vh] items-center justify-center bg-gray-950/5 p-6">
              {!failedPreviewIds[previewAsset.id] && previewAsset.fileUrl ? (
                previewAsset.fileType === "video" ? (
                  <video
                    src={previewAsset.fileUrl}
                    controls
                    className="max-h-[52vh] w-full rounded-xl"
                  />
                ) : (
                  <img
                    src={previewAsset.fileUrl}
                    alt={previewAsset.fileName}
                    onError={() =>
                      setFailedPreviewIds((prev) => ({ ...prev, [previewAsset.id]: true }))
                    }
                    className="max-h-[52vh] w-auto rounded-xl object-contain shadow-sm"
                  />
                )
              ) : (
                <div className="py-12">{renderFallbackIcon(previewAsset.fileType)}</div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <span className="truncate text-xs text-gray-400 max-w-xs" title={previewAsset.fileUrl}>
                {previewAsset.fileUrl}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(previewAsset)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {copiedId === previewAsset.id ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-700" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <a
                  href={previewAsset.fileUrl}
                  download={previewAsset.fileName}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => handleDelete(previewAsset.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
