import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import { getLastUpdated } from "@/lib/utils";
import Link from "next/link";
import { Mail, MapPin, Github } from "lucide-react";

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
      <h1 className="text-3xl font-semibold mb-6">{pageMetadata.title}</h1>
      
      {/* Contact Section - Horizontal */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-start gap-6 md:gap-8">
          <div className="flex items-start gap-2">
            <Mail className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Email</p>
              <a 
                href="mailto:William.Goldman@tufts.edu" 
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
              >
                William.Goldman@tufts.edu
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Location</p>
              <p className="text-gray-700 text-sm">
                Halligan Hall, Tufts University<br />
                161 College Ave, Medford, MA 02155
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Github className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">GitHub</p>
              <Link 
                href="https://github.com/Tufts-CubeSat" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
              >
                Tufts-CubeSat
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="prose max-w-none mb-8">
        <p className="mb-4">
          The Tufts CubeSat team is currently working on the "SPACE RACCOON" mission, a 14-month initiative focused on improving orbital safety through the development of a 2U satellite. This project is <strong>Tufts's first ever CubeSat mission</strong>. Our project's primary objective is to detect, classify, and assess the risk of space debris in Low Earth Orbit (LEO) using onboard computer vision and machine learning.
        </p>
        
        <p className="mb-4 font-semibold">Key pillars of our 2025–2026 development cycle include:</p>
        
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            Off-the-Shelf Payload Engineering: Using modified GoPro camera hardware integrated with custom ML software to identify and analyze debris streaks.
          </li>
          <li>
            Open-Source Contribution: A commitment to keeping our code open-source to benefit the broader aerospace community and future mission planning.
          </li>
          <li>
            Technical Goals: Our team is simultaneously managing various subsystems, including Raspberry Pi-based processing, radio frequency (RF) program uploading, power distribution, and radiation-proof battery systems.
          </li>
          <li>
            Milestones: For 2026, we are moving toward a full integration of Onshape mechanical designs and custom PCB payload boards for our payload.
          </li>
        </ul>
      </div>

      {/* Last Updated Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm">Last updated: {lastUpdated}</p>
      </div>
    </main>
  );
}
