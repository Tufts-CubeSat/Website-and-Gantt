import type { Metadata } from "next";
import Image from "next/image";
import { Download, ExternalLink } from "lucide-react";
import { pagesData } from "@/lib/pages-data";

const pageMetadata = pagesData.sponsors;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

const PACKET_URL = "/Tufts_CubeSat_Sponsorship_Packet_26-27.pdf";

const sponsors = [{ name: "Tufts University", tier: "Platinum", logo: "/Tufts_University_logo.png" }];

/** Gift designation for the M.E. department; used on both the check memo and the online form. */
const DESIGNATION = "Tufts SEDS CubeSat";

const donationMethods = [
  {
    title: "Check",
    steps: [
      <>Write a check payable to &ldquo;Trustees of Tufts College.&rdquo;</>,
      <>Under the memo line, write &ldquo;Donation: {DESIGNATION}.&rdquo;</>,
      <>
        Send the check to the M.E. Senior Department Administrator:
        <address className="mt-1 not-italic text-[var(--home-muted)]">
          Courtney O&apos;Hara, Mechanical Engineering
          <br />
          Robinson Hall, Room 150
          <br />
          200 College Ave, Medford, MA 02155, United States
          <br />
          <a href="mailto:courtney.ohara@tufts.edu" className="text-[var(--home-signal)] hover:underline">
            courtney.ohara@tufts.edu
          </a>{" "}
          · <a href="tel:+16176274785" className="text-[var(--home-signal)] hover:underline">617-627-4785</a>
        </address>
      </>,
      <>The Mechanical Engineering department forwards the check to Advancement, where the donation is processed and reserved for the project.</>,
    ],
  },
  {
    title: "Give online",
    intro: "Tufts' secure giving form accepts credit cards, PayPal, and Venmo.",
    steps: [
      <>
        Visit{" "}
        <a href="https://give.tufts.edu" target="_blank" rel="noopener noreferrer" className="text-[var(--home-signal)] hover:underline">
          give.tufts.edu
        </a>
        , scroll to the bottom, and click &ldquo;Make a Gift.&rdquo;
      </>,
      <>On the form, select &ldquo;Arts, Sciences &amp; Engineering,&rdquo; then &ldquo;Other.&rdquo;</>,
      <>When asked to specify, type &ldquo;Mechanical Engineering: {DESIGNATION}.&rdquo;</>,
      <>The Mechanical Engineering department receives the payment directly, and the donation is processed and reserved for the project.</>,
    ],
  },
];

export default function SponsorsPage() {
  return (
    <main className="home-landing min-h-screen bg-[var(--home-ink)] px-6 py-10 text-[var(--home-fog)] md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--home-text)]">{pageMetadata.title}</h1>
        <p className="mb-10 max-w-2xl text-[var(--home-muted)]">
          SPACE RACCOON is funded by sponsors who believe in hands-on student space research. Thank you for supporting
          Tufts&apos; first satellite.
        </p>

        <section className="mb-14">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--home-text)]">Current sponsors</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <li key={sponsor.name} className="home-panel-surface p-4">
                <div className="relative mb-3 h-24 rounded-md bg-white">
                  <Image src={sponsor.logo} alt={`${sponsor.name} logo`} fill sizes="320px" className="object-contain p-3" />
                </div>
                <p className="font-semibold text-[var(--home-text)]">{sponsor.name}</p>
                <p className="text-sm text-[var(--home-muted)]">{sponsor.tier} sponsor</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-semibold text-[var(--home-text)]">2026–27 sponsorship packet</h2>
            <div className="flex gap-4 text-sm">
              <a href={PACKET_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[var(--home-signal)] hover:underline">
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open
              </a>
              <a href={PACKET_URL} download className="inline-flex items-center gap-1.5 text-[var(--home-signal)] hover:underline">
                <Download className="h-4 w-4" aria-hidden />
                Download
              </a>
            </div>
          </div>
          <div className="home-panel-surface overflow-hidden">
            <iframe src={PACKET_URL} title="Tufts CubeSat 2026–27 sponsorship packet" className="h-[80vh] min-h-[480px] w-full" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-[var(--home-text)]">How to donate</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {donationMethods.map((method) => (
              <div key={method.title} className="home-panel-surface p-6">
                <h3 className="mb-3 text-xl font-semibold text-[var(--home-text)]">{method.title}</h3>
                {method.intro && <p className="mb-4 text-sm text-[var(--home-muted)]">{method.intro}</p>}
                <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--home-text)] marker:text-[var(--home-muted)]">
                  {method.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
