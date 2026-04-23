"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";

interface CalendarViewProps {
  events: EventInput[];
}

export function CalendarView({ events }: CalendarViewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        editable={false}
        selectable={false}
        eventStartEditable={false}
        eventDurationEditable={false}
        height="auto"
      />
    </div>
  );
}
