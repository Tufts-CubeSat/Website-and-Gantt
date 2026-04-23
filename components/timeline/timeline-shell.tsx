"use client";

import { useMemo, useState } from "react";
import { CalendarView } from "@/components/timeline/calendar-view";
import { GanttView } from "@/components/timeline/gantt-view";
import { SubsystemFilter } from "@/components/timeline/subsystem-filter";
import { ViewToggle } from "@/components/timeline/view-toggle";
import {
  getTimelineGroups,
  timelineMilestones,
  timelineTasks,
  toCalendarEvents,
  type TimelineViewMode,
} from "@/app/space-raccoon/timeline/timeline-data";

export function TimelineShell() {
  const [mode, setMode] = useState<TimelineViewMode>("calendar");
  const groups = useMemo(
    () => getTimelineGroups(timelineTasks, timelineMilestones),
    []
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(groups);

  const filteredTasks = useMemo(
    () => timelineTasks.filter((task) => selectedGroups.includes(task.group)),
    [selectedGroups]
  );
  const filteredMilestones = useMemo(
    () =>
      timelineMilestones.filter((milestone) =>
        selectedGroups.includes(milestone.group)
      ),
    [selectedGroups]
  );
  const events = useMemo(
    () => toCalendarEvents(filteredTasks, filteredMilestones),
    [filteredMilestones, filteredTasks]
  );

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) => {
      if (prev.includes(group)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== group);
      }
      return [...prev, group];
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewToggle mode={mode} onModeChange={setMode} />
        <p className="text-sm text-gray-600">Read-only schedule.</p>
      </div>
      <SubsystemFilter
        groups={groups}
        selectedGroups={selectedGroups}
        onToggleGroup={toggleGroup}
        onReset={() => setSelectedGroups(groups)}
      />
      {mode === "calendar" ? (
        <CalendarView events={events} />
      ) : (
        <GanttView tasks={filteredTasks} milestones={filteredMilestones} />
      )}
    </section>
  );
}
