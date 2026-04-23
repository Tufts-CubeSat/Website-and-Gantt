"use client";

interface SubsystemFilterProps {
  groups: string[];
  selectedGroups: string[];
  onToggleGroup: (group: string) => void;
  onReset: () => void;
}

export function SubsystemFilter({
  groups,
  selectedGroups,
  onToggleGroup,
  onReset,
}: SubsystemFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Subsystems:</span>
      {groups.map((group) => {
        const active = selectedGroups.includes(group);

        return (
          <button
            key={group}
            type="button"
            onClick={() => onToggleGroup(group)}
            className={`rounded-full border px-3 py-1 text-xs ${
              active
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {group}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-blue-700 underline underline-offset-2"
      >
        Reset
      </button>
    </div>
  );
}
