import type { Metadata } from "next";
import { HomeLanding } from "@/components/home-landing";
import { getLastUpdated } from "@/lib/utils";

const siteName = "Tufts CubeSat Team";
const description =
  "Tufts University's first CubeSat mission. The Tufts CubeSat Team is building SPACE RACCOON, a 2U satellite that detects, classifies, and assesses space debris risk in Low Earth Orbit using onboard computer vision and machine learning.";

export const metadata: Metadata = {
  title: {
    absolute: siteName,
  },
  description,
  keywords: [
    "Tufts CubeSat Team",
    "SPACE RACCOON",
    "CubeSat",
    "space debris",
    "Tufts University",
    "Low Earth Orbit",
  ],
  openGraph: {
    title: siteName,
    description,
    siteName,
    url: "/",
  },
};

export default function Home() {
  const lastUpdated = getLastUpdated();

  return <HomeLanding lastUpdated={lastUpdated} />;
}
