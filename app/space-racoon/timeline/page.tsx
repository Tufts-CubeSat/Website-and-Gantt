"use client";

import { useEffect, useRef, useState } from "react";

export default function Timeline() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gstcRef = useRef<HTMLDivElement>(null);
  const gstcInstance = useRef<any>(null);

  useEffect(() => {
    // Load CSS first
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/gantt-schedule-timeline-calendar/dist/style.css";
    document.head.appendChild(link);

    // Load GSTC script
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/gantt-schedule-timeline-calendar/dist/gstc.wasm.umd.min.js";
    script.async = true;

    script.onload = () => {
      console.log("GSTC script loaded");
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError("Failed to load GSTC library");
    };

    document.body.appendChild(script);

    return () => {
      if (gstcInstance.current) {
        try {
          gstcInstance.current.destroy();
          gstcInstance.current = null;
        } catch (err) {
          console.error("Error destroying GSTC:", err);
        }
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !gstcRef.current || gstcInstance.current) return;

    const initGantt = () => {
      try {
        // @ts-ignore
        if (!window.GSTC) {
          setError("GSTC not available");
          return;
        }

        // @ts-ignore
        const GSTC = window.GSTC.default || window.GSTC;

        if (!GSTC || !GSTC.api) {
          setError("GSTC.api is not available");
          return;
        }

        const GSTCID = GSTC.api.GSTCID;

        // Helper function to create sub-item rows and items
        const createSubItems = (parentId: string, parentLabel: string, parentStart: number, parentEnd: number, index: number) => {
          const subRows: any = {};
          const subItems: any = {};
          const duration = parentEnd - parentStart;
          const segmentDuration = duration / 3;

          for (let i = 1; i <= 3; i++) {
            const subId = `${parentId}_sub${i}`;
            const subRowId = GSTCID(subId);
            const subStart = parentStart + (i - 1) * segmentDuration;
            const subEnd = parentStart + i * segmentDuration;

            subRows[subRowId] = {
              id: subRowId,
              parentId: GSTCID(parentId),
              label: `${parentLabel} - Sub-task ${i}`,
            };

            subItems[subRowId] = {
              id: subRowId,
              rowId: subRowId,
              label: `${parentLabel} - Sub-task ${i}`,
              time: {
                start: subStart,
                end: subEnd,
              },
            };
          }

          return { subRows, subItems };
        };

        // Row data - Main tasks (no parent row)
        const rows: any = {
          [GSTCID("2")]: {
            id: GSTCID("2"),
            label: "Design Phase",
          },
          [GSTCID("3")]: {
            id: GSTCID("3"),
            label: "Hardware Development",
          },
          [GSTCID("4")]: {
            id: GSTCID("4"),
            label: "Software Development",
          },
          [GSTCID("5")]: {
            id: GSTCID("5"),
            label: "Testing & Integration",
          },
          [GSTCID("6")]: {
            id: GSTCID("6"),
            label: "Launch Preparation",
          },
        };

        // Column configuration
        const columns = {
          [GSTCID("label")]: {
            id: GSTCID("label"),
            data: "label",
            width: 250,
            expander: true,
            header: {
              content: "Task Name",
            },
          },
        };

        // Items (gantt bars) - Main tasks
        const items: any = {
          [GSTCID("2")]: {
            id: GSTCID("2"),
            rowId: GSTCID("2"),
            label: "Design Phase",
            time: {
              start: GSTC.api.date("2025-12-01").valueOf(),
              end: GSTC.api.date("2026-05-31").valueOf(),
            },
          },
          [GSTCID("3")]: {
            id: GSTCID("3"),
            rowId: GSTCID("3"),
            label: "Hardware Development",
            time: {
              start: GSTC.api.date("2026-03-01").valueOf(),
              end: GSTC.api.date("2026-10-31").valueOf(),
            },
          },
          [GSTCID("4")]: {
            id: GSTCID("4"),
            rowId: GSTCID("4"),
            label: "Software Development",
            time: {
              start: GSTC.api.date("2026-06-01").valueOf(),
              end: GSTC.api.date("2027-02-28").valueOf(),
            },
          },
          [GSTCID("5")]: {
            id: GSTCID("5"),
            rowId: GSTCID("5"),
            label: "Testing & Integration",
            time: {
              start: GSTC.api.date("2027-01-01").valueOf(),
              end: GSTC.api.date("2027-08-31").valueOf(),
            },
          },
          [GSTCID("6")]: {
            id: GSTCID("6"),
            rowId: GSTCID("6"),
            label: "Launch Preparation",
            time: {
              start: GSTC.api.date("2027-09-01").valueOf(),
              end: GSTC.api.date("2028-12-31").valueOf(),
            },
          },
        };

        // Add sub-items for each main task (rows 2-6)
        const mainTaskIds = ["2", "3", "4", "5", "6"];
        const mainTaskData = [
          { start: GSTC.api.date("2025-12-01").valueOf(), end: GSTC.api.date("2026-05-31").valueOf() },
          { start: GSTC.api.date("2026-03-01").valueOf(), end: GSTC.api.date("2026-10-31").valueOf() },
          { start: GSTC.api.date("2026-06-01").valueOf(), end: GSTC.api.date("2027-02-28").valueOf() },
          { start: GSTC.api.date("2027-01-01").valueOf(), end: GSTC.api.date("2027-08-31").valueOf() },
          { start: GSTC.api.date("2027-09-01").valueOf(), end: GSTC.api.date("2028-12-31").valueOf() },
        ];

        mainTaskIds.forEach((taskId, idx) => {
          const parentRow = rows[GSTCID(taskId)];
          const { subRows, subItems } = createSubItems(
            taskId,
            parentRow.label,
            mainTaskData[idx].start,
            mainTaskData[idx].end,
            idx
          );
          Object.assign(rows, subRows);
          Object.assign(items, subItems);
        });

        // Get license key from environment variable
        const licenseKey = process.env.NEXT_PUBLIC_GSTC_LICENSE_KEY;
        
        if (!licenseKey) {
          setError("GSTC license key not found. Please set NEXT_PUBLIC_GSTC_LICENSE_KEY in your .env.local file.");
          return;
        }

        // Get today's date for autoscroll
        const today = GSTC.api.date().startOf("day").valueOf();
        const projectStart = GSTC.api.date("2025-12-01").valueOf();
        const projectEnd = GSTC.api.date("2028-12-31").valueOf();
        const todayInRange = today >= projectStart && today <= projectEnd;
        // Use today if in range, otherwise use project start
        const scrollToDate = todayInRange ? today : projectStart;

        // Configuration
        const config = {
          licenseKey: licenseKey,
          list: {
            columns: {
              data: columns,
            },
            rows: rows,
          },
          chart: {
            time: {
              from: projectStart,
              to: projectEnd,
            },
            items: items,
            currentDate: todayInRange ? today : projectStart,
            scales: [
              { unit: "year", step: 1, format: "yyyy" },
              { unit: "month", step: 1, format: "MMMM" },
              { unit: "week", step: 1, format: "w" },
            ],
          },
          scroll: {
            left: scrollToDate,
          },
        };

        console.log("Initializing GSTC...");

        // Initialize GSTC
        const state = GSTC.api.stateFromConfig(config);
        gstcInstance.current = GSTC({
          element: gstcRef.current,
          state: state,
        });

        // Scroll to today using state API
        if (gstcInstance.current && gstcInstance.current.state) {
          setTimeout(() => {
            try {
              // Update scroll position via state
              gstcInstance.current.state.update("config.scroll.left", scrollToDate);
            } catch (err) {
              console.warn("Could not scroll to today:", err);
            }
          }, 200);
        }

        console.log("GSTC initialized successfully");
      } catch (err) {
        console.error("Error initializing GSTC:", err);
        setError(`Failed to initialize: ${err}`);
      }
    };

    const timer = setTimeout(initGantt, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoaded]);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-4">Timeline</h1>
      <p className="text-gray-600 mb-6">
        Project timeline and milestones for the SPACE RACOON CubeSat mission.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {!isLoaded && !error ? (
        <div className="h-96 flex items-center justify-center text-gray-500">
          Loading timeline library...
        </div>
      ) : (
        <div
          ref={gstcRef}
          className="w-full"
          style={{ height: "600px" }}
        />
      )}
    </main>
  );
}