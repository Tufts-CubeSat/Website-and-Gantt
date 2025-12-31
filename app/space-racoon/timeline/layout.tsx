import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";

const pageMetadata = pagesData["space-racoon-timeline"];

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

