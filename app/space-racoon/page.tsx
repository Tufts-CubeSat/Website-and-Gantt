import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const pageMetadata = pagesData["space-racoon"];

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

export default function SpaceRacoon() {
  return (
    <main className="min-h-screen p-8">
      {/* Header with logo */}
      <div className="flex items-center gap-4 mb-8">
        <Image
          src="/android-chrome-512x512.png"
          alt="SPACE RACOON Logo"
          width={64}
          height={64}
          className="rounded-lg"
        />
        <h1 className="text-3xl font-semibold">{pageMetadata.title}</h1>
      </div>

      {/* Main content with image on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Proposal</h2>
            <p className="text-gray-700 mb-4">
              <strong>14 month mission timeline</strong>
            </p>
            <p className="text-gray-700">
              The initiative aims to build and launch a satellite to detect, classify, and assess the risk of collisions with space debris in Low Earth Orbit using onboard computer vision and machine learning within a compact 2U satellite. As part of this effort, SPACE RACCOON will provide open-source, high-fidelity data on debris location and size to support safer orbital operations and future mission planning.
            </p>
          </section>

          {/* The Payload Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">THE PAYLOAD</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>GoPro camera and any necessary boards</li>
              <li>Input: Power, "take photo" command</li>
              <li>Output: Photo</li>
              <li>Be able to have a script running that requests images during certain times in the orbit</li>
              <li>We have scheduled times during orbit when we know we want to take photos (when are the ideal times and locations to capture images of space debris) and then during those times, we take a photo every 30 seconds and store it</li>
              <li>How many photos can we take – how much memory?</li>
              <li>Can we take photos and run algorithms at the same time?</li>
            </ul>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">Notes on the payload:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Send pictures to memory or flight computer, run image processing program</li>
                <li>Downlink photos identified as containing space debris</li>
              </ul>
            </div>
          </section>

          {/* Project Timeline Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">PROJECT TIMELINE</h2>
            <p className="text-gray-700 mb-2">
              2-3 years, specifics on{" "}
              <Link
                href="/space-racoon/timeline"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Gantt Chart
              </Link>
            </p>
          </section>
        </div>

        {/* Right column - Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Image
              src="/CubeSat Onhape.png"
              alt="CubeSat Onshape Design"
              width={512}
              height={512}
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
