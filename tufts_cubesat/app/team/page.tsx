import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";

const pageMetadata = pagesData.team;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

export default function Team() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-4">{pageMetadata.title}</h1>
      <p>{pageMetadata.description}</p>
    </main>
  );
}
