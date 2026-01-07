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

        // Row data
        const rows = {
          [GSTCID("1")]: {
            id: GSTCID("1"),
            label: "SPACE RACOON Project",
          },
          [GSTCID("2")]: {
            id: GSTCID("2"),
            parentId: GSTCID("1"),
            label: "Design Phase",
          },
          [GSTCID("3")]: {
            id: GSTCID("3"),
            parentId: GSTCID("1"),
            label: "Hardware Development",
          },
          [GSTCID("4")]: {
            id: GSTCID("4"),
            parentId: GSTCID("1"),
            label: "Software Development",
          },
          [GSTCID("5")]: {
            id: GSTCID("5"),
            parentId: GSTCID("1"),
            label: "Testing & Integration",
          },
          [GSTCID("6")]: {
            id: GSTCID("6"),
            parentId: GSTCID("1"),
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

        // Items (gantt bars) - Updated dates: December 2025 to December 2028
        const items = {
          [GSTCID("1")]: {
            id: GSTCID("1"),
            rowId: GSTCID("1"),
            label: "SPACE RACOON Project",
            time: {
              start: GSTC.api.date("2025-12-01").valueOf(),
              end: GSTC.api.date("2028-12-31").valueOf(),
            },
          },
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

        // Get license key from environment variable
        const licenseKey = process.env.NEXT_PUBLIC_GSTC_LICENSE_KEY;
        
        if (!licenseKey) {
          setError("GSTC license key not found. Please set NEXT_PUBLIC_GSTC_LICENSE_KEY in your .env.local file.");
          return;
        }

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
              from: GSTC.api.date("2025-12-01").startOf("day").valueOf(),
              to: GSTC.api.date("2028-12-31").endOf("day").valueOf(),
            },
            items: items,
          },
        };

        console.log("Initializing GSTC...");

        // Initialize GSTC
        gstcInstance.current = GSTC({
          element: gstcRef.current,
          state: GSTC.api.stateFromConfig(config),
        });

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