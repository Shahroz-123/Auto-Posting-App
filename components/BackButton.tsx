"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  href = "/",
  label = "Back to Dashboard",
  className = "",
}: BackButtonProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition hover:border-green-300 hover:bg-green-50/70 hover:text-green-800"
      >
        <ArrowLeft
          size={16}
          className="text-gray-500 transition-transform group-hover:-translate-x-1 group-hover:text-green-700"
        />
        <span>{label}</span>
      </Link>
    </div>
  );
}

