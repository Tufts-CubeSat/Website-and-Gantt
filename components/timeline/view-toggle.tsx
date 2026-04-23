"use client";

import type { TimelineViewMode } from
  "@/app/space-raccoon/timeline/timeline-data";

interface ViewToggleProps {
  mode: TimelineViewMode;
  onModeChange: (mode: TimelineViewMode) => void;
}

const baseButton =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors";

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
      <button
        type="button"
        className={`${baseButton} ${
          mode === "calendar"
            ? "bg-black text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => onModeChange("calendar")}
      >
        Calendar
      </button>
      <button
        type="button"
        className={`${baseButton} ${
          mode === "timeline"
            ? "bg-black text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => onModeChange("timeline")}
      >
        Timeline
      </button>
    </div>
  );
}
