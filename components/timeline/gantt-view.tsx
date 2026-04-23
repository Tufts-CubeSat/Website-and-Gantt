"use client";

import { Gantt } from "@svar-ui/react-gantt";
import type {
  TimelineMilestone,
  TimelineTask,
} from "@/app/space-raccoon/timeline/timeline-data";

interface GanttViewProps {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
}

interface GanttTask {
  id: number;
  text: string;
  start: Date;
  end: Date;
  progress: number;
  type: "task" | "milestone";
  parent?: number;
}

const defaultScales = [
  { unit: "month", step: 1, format: "%F %Y" },
  { unit: "week", step: 1, format: "Week %W" },
];

export function GanttView({ tasks, milestones }: GanttViewProps) {
  const ganttTasks: GanttTask[] = [
    ...tasks.map((task) => ({
      id: task.id,
      text: `${task.group}: ${task.title}`,
      start: new Date(`${task.start}T12:00:00`),
      end: new Date(`${task.end}T12:00:00`),
      progress: task.progress,
      type: "task" as const,
      parent: task.parentId,
    })),
    ...milestones.map((milestone) => ({
      id: milestone.id,
      text: `${milestone.group}: ${milestone.title}`,
      start: new Date(`${milestone.date}T12:00:00`),
      end: new Date(`${milestone.date}T12:00:00`),
      progress: 100,
      type: "milestone" as const,
    })),
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <Gantt
        tasks={ganttTasks}
        links={[]}
        scales={defaultScales}
        readonly={true}
        zoom={false}
      />
    </div>
  );
}
