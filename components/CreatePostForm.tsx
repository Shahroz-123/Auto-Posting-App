"use client";

import { useEffect, useState } from "react";

import {
  ImagePlus,
  CalendarDays,
  Send,
  Save,
  Sparkles,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
  X,
  Clock3,
  MonitorPlay,
} from "lucide-react";

import {
  companies,
  socialPlatforms,
  SocialPlatform,
} from "@/lib/data";

type PublishMode = "now" | "schedule" | "draft";

type PlatformCaptions = Partial<
  Record<SocialPlatform, string>
>;

export default function CreatePostForm() {

  const [companyId, setCompanyId] = useState("1");

  const [selectedPlatforms, setSelectedPlatforms] =
    useState<SocialPlatform[]>(["instagram", "facebook"]);

  const [caption, setCaption] = useState("");

  const [hashtags, setHashtags] = useState(
    "#Marketing #Business"
  );

  const [media, setMedia] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [publishMode, setPublishMode] =
    useState<PublishMode>("draft");

  const [scheduledDate, setScheduledDate] = useState("");

  const [scheduledTime, setScheduledTime] = useState("10:00");

  const [activePlatform, setActivePlatform] =
    useState<SocialPlatform>("instagram");

  const [customCaptions, setCustomCaptions] =
    useState<PlatformCaptions>({});

  const [message, setMessage] = useState("");

    function togglePlatform(platform: SocialPlatform) {

    setSelectedPlatforms((previous) => {

      if (previous.includes(platform)) {

        return previous.filter(
          (item) => item !== platform
        );

      }

      return [...previous, platform];

    });

  }

  function updateCustomCaption(
    platform: SocialPlatform,
    value: string
  ) {

    setCustomCaptions((previous) => ({
      ...previous,
      [platform]: value,
    }));

  }

    useEffect(() => {

    if (!media) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(media);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };

  }, [media]);


  function handleMediaUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a supported image or video.");
      event.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage("Maximum upload size is 50 MB.");
      event.target.value = "";
      return;
    }

    setMessage("");
    setMedia(file);

  }

    function handleSubmit(mode: PublishMode) {

    if (!caption.trim()) {
      setMessage("Please enter a caption.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setMessage("Please select at least one platform.");
      return;
    }

    if (
      mode === "schedule" &&
      (!scheduledDate || !scheduledTime)
    ) {
      setMessage("Please select a date and time.");
      return;
    }

    if (mode === "schedule") {

      const scheduledAt = new Date(
        `${scheduledDate}T${scheduledTime}:00`
      );

      if (
        Number.isNaN(scheduledAt.getTime()) ||
        scheduledAt.getTime() <= Date.now()
      ) {
        setMessage("Please select a future publishing time.");
        return;
      }

    }

    const postPayload = {

      companyId: Number(companyId),

      caption,

      hashtags,

      mediaName: media?.name ?? null,

      platforms: selectedPlatforms.map((platform) => ({

        platform,

        caption:
          customCaptions[platform]?.trim() || caption,

      })),

      status: mode === "now"
        ? "publishing"
        : mode === "schedule"
          ? "scheduled"
          : "draft",

      scheduledAt:
        mode === "schedule"
          ? new Date(
              `${scheduledDate}T${scheduledTime}:00`
            ).toISOString()
          : null,

    };

    console.log("Post payload:", postPayload);

    setMessage(
      mode === "now"
        ? "Post prepared for publishing. API integration is still required."
        : mode === "schedule"
          ? "Schedule prepared. Backend scheduling is still required."
          : "Draft prepared successfully."
    );

  }

    const selectedCompany = companies.find(
    (company) => company.id === Number(companyId)
  );

  const currentCaption =
    customCaptions[activePlatform]?.trim() || caption;

  const platformIcons = {
    instagram: Camera,
    facebook: Globe,
    linkedin: BriefcaseBusiness,
    tiktok: MonitorPlay,
  };

  const activePlatformName = socialPlatforms.find(
    (platform) => platform.id === activePlatform
  )?.name;

  return (

    <div className="mx-auto max-w-7xl space-y-6 p-6">

      {/* Page Heading */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create & Publish
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create content once and manage publishing
          across multiple social media platforms.
        </p>
      </div>


      {/* Main Layout */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* LEFT: CONTENT EDITOR */}

        <div className="space-y-6 xl:col-span-2">

          {/* Company Selection */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="mb-4 font-semibold">
              1. Select Company
            </h2>

            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
            >

              {companies.map((company) => (

                <option
                  key={company.id}
                  value={company.id}
                >
                  {company.name} - {company.industry}
                </option>

              ))}

            </select>

            <p className="mt-2 text-xs text-gray-500">
              Selected workspace: {selectedCompany?.name}
            </p>

          </section>


          {/* Platform Selection */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="mb-1 font-semibold">
              2. Select Platforms
            </h2>

            <p className="mb-4 text-sm text-gray-500">
              Choose where you want to publish this content.
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

              {socialPlatforms.map((platform) => {

                const Icon =
                  platformIcons[platform.id];

                const isSelected =
                  selectedPlatforms.includes(platform.id);

                return (

                  <button
                    type="button"
                    key={platform.id}
                    onClick={() =>
                      togglePlatform(platform.id)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <Icon size={23} />

                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="accent-green-600"
                      />

                    </div>

                    <p className="mt-3 text-sm font-semibold">
                      {platform.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {platform.description}
                    </p>

                  </button>

                );

              })}

            </div>

            <p className="mt-3 text-xs text-gray-500">
              {selectedPlatforms.length} platforms selected
            </p>

          </section>


          {/* Caption Editor */}

          <section className="rounded-xl border bg-white p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="font-semibold">
                  3. Write Your Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create your main caption.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "AI content generation will be connected in the next phase."
                  )
                }
                className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700"
              >
                <Sparkles size={16} />
                AI Generate
              </button>

            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something interesting about your company or product..."
              rows={7}
              maxLength={5000}
              className="w-full resize-y rounded-lg border p-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">

              <span>
                Main caption
              </span>

              <span>
                {caption.length}/5000
              </span>

            </div>


            {/* Hashtags */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium">
                Hashtags
              </label>

              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#Marketing #Business"
                className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

          </section>


          {/* Platform-specific captions */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="font-semibold">
              4. Customize For Each Platform
            </h2>

            <p className="mb-4 mt-1 text-sm text-gray-500">
              Optionally write different captions for each platform.
              Empty custom captions use your main caption.
            </p>

            <div className="flex flex-wrap gap-2">

              {selectedPlatforms.map((platform) => {

                const Icon = platformIcons[platform];

                return (

                  <button
                    type="button"
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      activePlatform === platform
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-gray-200"
                    }`}
                  >

                    <Icon size={16} />

                    {platform}

                  </button>

                );

              })}

            </div>

            {selectedPlatforms.includes(activePlatform) && (

              <div className="mt-4">

                <label className="mb-2 block text-sm font-medium">
                  {activePlatformName} Caption
                </label>

                <textarea
                  rows={4}
                  value={customCaptions[activePlatform] ?? ""}
                  onChange={(e) =>
                    updateCustomCaption(
                      activePlatform,
                      e.target.value
                    )
                  }
                  placeholder={`Custom caption for ${activePlatformName}. Leave empty to use the main caption.`}
                  className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

            )}

          </section>


          {/* Media Upload */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="mb-4 font-semibold">
              5. Upload Media
            </h2>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 transition hover:border-green-600 hover:bg-green-50">

              <ImagePlus
                size={35}
                className="text-green-700"
              />

              <p className="mt-3 text-sm font-medium">
                Click to upload an image or video
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WEBP or MP4. Maximum 50 MB.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                className="hidden"
                onChange={handleMediaUpload}
              />

            </label>

            {media && (

              <div className="mt-4 flex items-center justify-between rounded-lg border p-3">

                <div className="flex items-center gap-3">

                  <ImagePlus size={20} />

                  <div>
                    <p className="text-sm font-medium">
                      {media.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(media.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setMedia(null)}
                  className="text-red-500"
                >
                  <X size={19} />
                </button>

              </div>

            )}

          </section>

        </div>

                {/* RIGHT: PREVIEW AND PUBLISHING */}

        <div className="space-y-6">

          {/* Live Preview */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="mb-4 font-semibold">
              Live Preview
            </h2>

            {/* Preview Platform Selector */}

            <div className="mb-4 flex flex-wrap gap-2">

              {selectedPlatforms.map((platform) => {

                const Icon = platformIcons[platform];

                return (

                  <button
                    type="button"
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`rounded-lg border p-2 ${
                      activePlatform === platform
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200"
                    }`}
                    title={platform}
                  >
                    <Icon size={19} />
                  </button>

                );

              })}

            </div>

            {/* Social Post Preview */}

            <div className="overflow-hidden rounded-xl border">

              {/* Account Header */}

              <div className="flex items-center gap-3 p-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                  {selectedCompany?.initials}
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {selectedCompany?.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {activePlatformName}
                  </p>
                </div>

              </div>

              {/* Media Preview */}

              {previewUrl && (

                <div className="bg-gray-100">

                  {media?.type.startsWith("image/") ? (

                    <img
                      src={previewUrl}
                      alt="Post preview"
                      className="max-h-80 w-full object-contain"
                    />

                  ) : (

                    <video
                      src={previewUrl}
                      controls
                      className="max-h-80 w-full"
                    />

                  )}

                </div>

              )}

              {!previewUrl && (

                <div className="flex h-48 flex-col items-center justify-center bg-gray-50 text-gray-400">

                  <ImagePlus size={35} />

                  <p className="mt-2 text-xs">
                    Media preview will appear here
                  </p>

                </div>

              )}

              {/* Caption Preview */}

              <div className="space-y-3 p-4">

                <p className="whitespace-pre-wrap text-sm">
                  {currentCaption ||
                    "Your caption will appear here..."}
                </p>

                <p className="whitespace-pre-wrap text-sm text-blue-600">
                  {hashtags}
                </p>

              </div>

            </div>

          </section>


          {/* Publishing Options */}

          <section className="rounded-xl border bg-white p-5">

            <h2 className="mb-4 font-semibold">
              Publishing Options
            </h2>

            {/* Publish Now */}

            <button
              type="button"
              onClick={() => setPublishMode("now")}
              className={`mb-3 flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                publishMode === "now"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200"
              }`}
            >

              <Send size={19} />

              <div>
                <p className="text-sm font-semibold">
                  Publish Now
                </p>

                <p className="text-xs text-gray-500">
                  Prepare immediate publishing
                </p>
              </div>

            </button>


            {/* Schedule */}

            <button
              type="button"
              onClick={() => setPublishMode("schedule")}
              className={`mb-3 flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                publishMode === "schedule"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200"
              }`}
            >

              <CalendarDays size={19} />

              <div>
                <p className="text-sm font-semibold">
                  Schedule Post
                </p>

                <p className="text-xs text-gray-500">
                  Choose a future publishing date
                </p>
              </div>

            </button>


            {/* Draft */}

            <button
              type="button"
              onClick={() => setPublishMode("draft")}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                publishMode === "draft"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200"
              }`}
            >

              <Save size={19} />

              <div>
                <p className="text-sm font-semibold">
                  Save as Draft
                </p>

                <p className="text-xs text-gray-500">
                  Save content without publishing
                </p>
              </div>

            </button>


            {/* Date and Time */}

            {publishMode === "schedule" && (

              <div className="mt-5 space-y-3">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Publishing Date
                  </label>

                  <input
                    type="date"
                    value={scheduledDate}
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) =>
                      setScheduledDate(e.target.value)
                    }
                    className="w-full rounded-lg border p-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Publishing Time
                  </label>

                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) =>
                      setScheduledTime(e.target.value)
                    }
                    className="w-full rounded-lg border p-3 text-sm"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Time is currently interpreted in your browser's local timezone.
                </p>

              </div>

            )}


            {/* Selected Platforms Summary */}

            <div className="mt-5 border-t pt-4">

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Selected platforms
                </span>

                <span className="font-semibold">
                  {selectedPlatforms.length}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">

                {selectedPlatforms.map((platform) => (

                  <span
                    key={platform}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize"
                  >
                    {platform}
                  </span>

                ))}

              </div>

            </div>


            {/* Submit Button */}

            <button
              type="button"
              onClick={() => handleSubmit(publishMode)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
            >

              {publishMode === "now" && (
                <>
                  <Send size={17} />
                  Publish Now
                </>
              )}

              {publishMode === "schedule" && (
                <>
                  <Clock3 size={17} />
                  Schedule Post
                </>
              )}

              {publishMode === "draft" && (
                <>
                  <Save size={17} />
                  Save Draft
                </>
              )}

            </button>


            {/* Feedback Message */}

            {message && (

              <div
                role="status"
                className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                {message}
              </div>

            )}

          </section>

        </div>

      </div>

    </div>

  );

}