export type TimelineViewMode = "calendar" | "timeline";

export interface TimelineTask {
  id: number;
  title: string;
  start: string;
  end: string;
  group: string;
  progress: number;
  parentId?: number;
}

export interface TimelineMilestone {
  id: number;
  title: string;
  date: string;
  group: string;
}

export interface TimelineCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  group: string;
  allDay?: boolean;
}

export const timelineTasks: TimelineTask[] = [
  {
    id: 1,
    title: "Mission Requirements",
    start: "2026-01-12",
    end: "2026-02-20",
    group: "Systems",
    progress: 100,
  },
  {
    id: 2,
    title: "Payload Hardware Design",
    start: "2026-02-23",
    end: "2026-05-08",
    group: "Payload",
    progress: 70,
  },
  {
    id: 3,
    title: "Flight Software Core",
    start: "2026-03-02",
    end: "2026-06-12",
    group: "Software",
    progress: 55,
  },
  {
    id: 4,
    title: "Power Board Integration",
    start: "2026-05-11",
    end: "2026-07-03",
    group: "Electrical",
    progress: 20,
  },
  {
    id: 5,
    title: "Environmental Testing",
    start: "2026-07-06",
    end: "2026-09-04",
    group: "Testing",
    progress: 0,
  },
  {
    id: 6,
    title: "Launch Readiness Review",
    start: "2026-09-14",
    end: "2026-10-02",
    group: "Program",
    progress: 0,
  },
];

export const timelineMilestones: TimelineMilestone[] = [
  {
    id: 101,
    title: "PDR Complete",
    date: "2026-03-20",
    group: "Program",
  },
  {
    id: 102,
    title: "CDR Complete",
    date: "2026-06-26",
    group: "Program",
  },
  {
    id: 103,
    title: "TVAC Exit",
    date: "2026-08-28",
    group: "Testing",
  },
];

export function getTimelineGroups(
  tasks: TimelineTask[],
  milestones: TimelineMilestone[]
): string[] {
  const groups = new Set<string>();

  tasks.forEach((task) => groups.add(task.group));
  milestones.forEach((milestone) => groups.add(milestone.group));

  return Array.from(groups).sort((a, b) => a.localeCompare(b));
}

export function toCalendarEvents(
  tasks: TimelineTask[] = timelineTasks,
  milestones: TimelineMilestone[] = timelineMilestones
): TimelineCalendarEvent[] {
  const taskEvents = tasks.map((task) => ({
    id: `task-${task.id}`,
    title: `${task.group}: ${task.title}`,
    start: task.start,
    end: addOneDay(task.end),
    group: task.group,
  }));
  const milestoneEvents = milestones.map((milestone) => ({
    id: `milestone-${milestone.id}`,
    title: `${milestone.group}: ${milestone.title}`,
    start: milestone.date,
    end: addOneDay(milestone.date),
    group: milestone.group,
    allDay: true,
  }));

  return [...taskEvents, ...milestoneEvents];
}

function addOneDay(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
