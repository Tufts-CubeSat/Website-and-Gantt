import { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Github, FolderOpen } from "lucide-react";

const pageMetadata = pagesData.resources;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

// Document data structure
// To add a new document, extract the ID from the Google Docs sharing URL
// Example: https://docs.google.com/document/d/DOCUMENT_ID/edit?usp=sharing
interface Document {
  id: string;
  title: string;
  sharingUrl: string;
}

const documents: Document[] = [
  {
    id: "19sunrQngHn-3hClAje-QJVo_s2o1qocdpB2osCBrR7E",
    title: "CubeSat Master Document",
    sharingUrl: "https://docs.google.com/document/d/19sunrQngHn-3hClAje-QJVo_s2o1qocdpB2osCBrR7E/edit?usp=sharing",
  },
  // Add more documents here by adding objects to this array
  // {
  //   id: "DOCUMENT_ID_HERE",
  //   title: "Document Title",
  //   sharingUrl: "https://docs.google.com/document/d/DOCUMENT_ID/edit?usp=sharing",
  // },
];

function getEmbedUrl(docId: string): string {
  return `https://docs.google.com/document/d/${docId}/preview`;
}

export default function Resources() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-6">{pageMetadata.title}</h1>
      <p className="mb-8 text-gray-700">{pageMetadata.description}</p>

      {/* Quick Links Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="https://github.com/Tufts-CubeSat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Github className="h-5 w-5" />
            <span>GitHub Repository</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="https://drive.google.com/drive/folders/1W8zvQTd-4lAUdb0c64lyteoIUhKKbm-r?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FolderOpen className="h-5 w-5" />
            <span>Google Drive</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Embedded Documents Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Documents</h2>
        
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-col">
                <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
                  <iframe
                    src={getEmbedUrl(doc.id)}
                    className="w-full flex-1"
                    style={{ minHeight: "400px" }}
                    title={doc.title}
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
                <div className="mt-2">
                  <Link
                    href={doc.sharingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                  >
                    Open in Google Docs
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">
            No documents available
          </div>
        )}
      </section>
    </main>
  );
}
