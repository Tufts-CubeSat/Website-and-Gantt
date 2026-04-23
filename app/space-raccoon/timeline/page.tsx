import type { Metadata } from "next";
import { pagesData } from "@/lib/pages-data";
import { TimelineShell } from "@/components/timeline/timeline-shell";
import "@svar-ui/react-gantt/all.css";

const pageMetadata = pagesData["space-raccoon-timeline"];

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

export default function TimelinePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-4 text-3xl font-semibold">{pageMetadata.title}</h1>
      <p className="mb-6 text-gray-600">{pageMetadata.description}</p>
      <TimelineShell />
    </main>
  );
}
