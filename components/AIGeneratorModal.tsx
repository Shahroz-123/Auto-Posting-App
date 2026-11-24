"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  Copy,
  RefreshCw,
  Wand2,
  Loader2,
  MessageCircle,
  Camera,
  Globe,
  BriefcaseBusiness,
  Video,
} from "lucide-react";

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  industry: string;
  onApply: (data: {
    caption: string;
    hashtags: string;
    customCaptions?: Record<string, string>;
  }) => void;
}

export default function AIGeneratorModal({
  isOpen,
  onClose,
  companyName,
  industry,
  onApply,
}: AIGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("engaging");
  const [targetPlatform, setTargetPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    caption: string;
    hashtags: string;
    customCaptions?: Record<string, string>;
    source?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          companyName,
          industry,
          platform: targetPlatform,
          tone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply({
        caption: result.caption,
        hashtags: result.hashtags,
        customCaptions: result.customCaptions,
      });
      onClose();
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`${result.caption}\n\n${result.hashtags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gradient-to-r from-purple-50 via-white to-green-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                AI Content & Hashtag Generator
              </h2>
              <p className="text-xs text-gray-500">
                Crafting for <span className="font-semibold text-gray-800">{companyName}</span> ({industry})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Prompt / Topic */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              What is this post about? (Product launch, announcement, special offer...)
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`e.g. Announcing our 25% winter discount on all ${industry.toLowerCase()} packages with free consultation.`}
              rows={3}
              className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          {/* Tone & Platform Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-purple-600 bg-white"
              >
                <option value="engaging">Engaging & Community-Focused</option>
                <option value="promotional">Promotional & High-Converting</option>
                <option value="story">Storytelling & Inspiring</option>
                <option value="professional">Professional & Authoritative</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Primary Platform
              </label>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-purple-600 bg-white"
              >
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp Business</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Crafting Viral Content with AI...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generate Captions & Hashtags</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {result && (
            <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-purple-600" />
                  Generated Result ({result.source || "AI"}):
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                >
                  <Copy size={12} />
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              <div className="rounded-lg bg-white p-3 text-xs text-gray-800 leading-relaxed border border-purple-100 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                {result.caption}
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-500 mb-1">
                  Recommended Hashtags:
                </p>
                <div className="rounded-lg bg-white p-2.5 text-xs text-green-700 font-medium border border-purple-100 font-mono">
                  {result.hashtags}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          {result && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-green-700 px-5 py-2 text-xs font-bold text-white hover:bg-green-800 shadow-xs transition"
            >
              <CheckCircle2 size={15} />
              <span>Apply to Post Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

