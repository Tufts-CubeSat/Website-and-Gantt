import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import { getLastUpdated } from "@/lib/utils";

const pageMetadata = pagesData.home;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

export default function Home() {
  const lastUpdated = getLastUpdated();
  
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-4">{pageMetadata.title}</h1>
      <p className="text-gray-600 text-sm mb-4">Last updated: {lastUpdated}</p>
      <p>{pageMetadata.description}</p>
    </main>
  );
}
