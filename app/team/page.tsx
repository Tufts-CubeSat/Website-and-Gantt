dimport { pagesData } from "@/lib/pages-data";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

const pageMetadata = pagesData.team;

export const metadata: Metadata = {
  title: pageMetadata.title,
  description: pageMetadata.description,
  keywords: pageMetadata.keywords,
};

// Helper function to create email from name
function getEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@tufts.edu`;
}

// Team data structure
const teamData = {
  projectLead: {
    name: "William Goldman",
    role: "Project Lead",
  },
  subteamLeads: [
    { name: "Natalie", lastName: "Germanov", role: "Structures Lead", subteam: "Structures" },
    { name: "Jacky", lastName: "Zhao", role: "Power Lead", subteam: "Powers" },
    { name: "Ryan", lastName: "Cooley", role: "Comms Lead", subteam: "Comms" },
    { name: "Kyle", lastName: "Wigdor", role: "Software Lead", subteam: "Software" },
  ],
  subteams: {
    Structures: ["Allie Staiger"] as string[],
    Power: [] as string[],
    Comms: [] as string[],
    Software: ["Shepard Rodgers"] as string[],
    Operations: ["Maggie Olson", "Ava"] as string[],
  },
};

export default function Team() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-6">{pageMetadata.title}</h1>
      
      {/* Project Lead */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Project Lead</h2>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-lg">{teamData.projectLead.name}</p>
            <p className="text-gray-600">{teamData.projectLead.role}</p>
          </div>
          <a
            href={`mailto:${getEmail("William", "Goldman")}`}
            className="ml-auto text-blue-600 hover:text-blue-800"
            title={`Email ${teamData.projectLead.name}`}
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Subteam Leads */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Subteam Leads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamData.subteamLeads.map((lead) => (
            <div
              key={lead.subteam}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-gray-600 text-sm">{lead.role}</p>
              </div>
              {lead.lastName && (
                <a
                  href={`mailto:${getEmail(lead.name, lead.lastName)}`}
                  className="text-blue-600 hover:text-blue-800"
                  title={`Email ${lead.name} ${lead.lastName}`}
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team Members by Subteam */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
        <div className="space-y-6">
          {Object.entries(teamData.subteams).map(([subteam, members]) => {
            const lead = teamData.subteamLeads.find((l) => l.subteam === subteam);
            return (
              <div key={subteam} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {subteam}
                </h3>
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {members.map((member) => {
                      const [firstName, ...lastNameParts] = member.split(" ");
                      const lastName = lastNameParts.join(" ");
                      return (
                        <div
                          key={member}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{member}</span>
                          <a
                            href={`mailto:${getEmail(firstName, lastName)}`}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                            title={`Email ${member}`}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No subteam members yet
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
