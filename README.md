# Website-and-Gantt

The Tufts CubeSat Team website: team overview, subteams, the SPACE RACCOON mission, and the project timeline. It's built with Next.js 16, React 19, Tailwind CSS 4, and GSAP (for the scroll animations), and deploys on Vercel at https://tufts-cubesat.vercel.app.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # production build, also type-checks
```

## Where things live

| What | File |
| --- | --- |
| Roster, subteams, meeting times, milestones, alumni | [lib/team-data.ts](lib/team-data.ts) |
| Member photos | [public/team/](public/team/) (see [its README](public/team/README.md)) |
| Page titles, descriptions, search keywords | [lib/pages-data.ts](lib/pages-data.ts) |
| Sidebar navigation | [components/navigation.tsx](components/navigation.tsx) |
| Homepage sections | [components/home/](components/home/) |
| Gantt / calendar data | [app/space-raccoon/timeline/timeline-data.ts](app/space-raccoon/timeline/timeline-data.ts) |
| Colors and theme tokens | [app/globals.css](app/globals.css) (`--home-*` variables, light and dark) |

Most content updates only touch `lib/team-data.ts`. The homepage, `/team`, and `/subteams` all read from it.

## Common updates

### Add or change a team member

Add an entry to `members` in [lib/team-data.ts](lib/team-data.ts):

```ts
{
  name: "Will Goldman",
  slug: "william-goldman",          // also the photo filename
  roles: ["Project Lead", "Software Lead"],
  subteams: ["software"],
  lead: "project",                  // "project" | "subteam" | omit for members
  linkedin: "https://www.linkedin.com/in/…",
  website: "https://github.com/…",  // any site: personal page, GitHub, portfolio
},
```

- **Email** is generated as `first.last@tufts.edu`. If someone's address is different, add it to `emailOverrides`.
- **Links:** `linkedin` and `website` are optional, and each shows as an icon link on the member's `/team` card when set. A `github.com` URL is labeled "GitHub"; any other URL is labeled "Website". Only add links the member has given you.
- **Leaving the team:** remove the member and add their name to `alumni`.

### Add a member photo

Save a portrait as `public/team/<slug>.jpg` (`.jpeg`, `.png`, or `.webp` also work). It's 4:5, about 800×1000 px, and under ~200 KB. It shows up on the next build, and until then the card shows the person's initials. Only use photos the member has provided or approved. [public/team/README.md](public/team/README.md) has a one-line resize command.

### Update a subteam

Each entry in `subteams` has a tagline, what the subteam does, semester goals, future goals, what you'll learn, and a meeting time and place. Some fields are optional:

- `about`: intro paragraphs
- `whyJoin`: reasons to join
- `isNew`: shows a "New" badge

Any empty list is hidden automatically. Leave out `meeting` and the page shows "Meeting time coming soon".

### Meeting times

- **All-team meeting:** `allTeamMeeting` in [lib/team-data.ts](lib/team-data.ts).
- **`/team` banner:** it computes the next meeting date with `getNextMeeting(weekday, cutoffHour)` in [app/team/page.tsx](app/team/page.tsx), where weekday 0 = Sunday and the cutoff is the hour in Boston time. If the all-team day changes, update both places.
- **Build-time date:** the site is statically generated, so the banner date is fixed when the site builds. It needs a redeploy (or a scheduled rebuild) to stay current.

## Homepage animations

The scroll effects use GSAP ScrollTrigger (see [components/home/use-gsap.ts](components/home/use-gsap.ts)). Each section is self-contained:

- **[mission-story.tsx](components/home/mission-story.tsx):** a pinned seven-stage mission walkthrough.
  - Stage text is in the `stages` array.
  - The scene is an SVG, and each stage's animation is a labeled block in the timeline.
  - The Launch stage plays while the section scrolls into place; the other stages play while it's pinned.
- **[exploded-cubesat.tsx](components/home/exploded-cubesat.tsx):** "Scroll to open the CubeSat".
  - `layers` is listed **bottom to top**. Reorder the array to reorder the stack.
  - Each layer declares its `height` (board plus tallest part, in mm). The closed stack (`COMPACT_Z`) is packed from those heights, so any order fits inside the 2U chassis, and each layer rises straight to its open position (`EXPLODED_Z`). If you add or resize a component, update that layer's `height`.
  - The markup is drawn in the open state, and GSAP animates *from* the closed stack.
- **[roadmap.tsx](components/home/roadmap.tsx):** reads `milestones` from team-data.
- **[subteam-grid.tsx](components/home/subteam-grid.tsx) and [employer-marquee.tsx](components/home/employer-marquee.tsx):** read `subteams` and `employers` from team-data.

Accessibility rules the animations must follow:

- **Reduced motion:** every animation is wrapped in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. With reduced motion on, the pages render a static layout, so keep any new animation behind the same check.
- **Colors:** use the `--home-*` CSS variables rather than hard-coded colors, so light and dark mode both work.
- **Pin offset:** pinned sections start at `top top+=64` so they clear the fixed 4rem header.

## Open items

- **Weather Balloon subteam:**
  - It needs a meeting time and members. Look for `TODO(weather-balloon)` in [lib/team-data.ts](lib/team-data.ts).
  - A photo of Earth's curvature from a balloon flight would be a good addition to its `/subteams` section. It hasn't been added yet.
- **Member photos:** only Will Goldman's is in so far. Everyone else shows initials until they send a photo.
- **LinkedIn and website links:** none have been added yet. Collect them from members and add them to `lib/team-data.ts`.
- **Gantt chart:** update it.
- **SEDS website:** add a link (check back in with Claire).
- **Other teams:** offer more open-source resources for them.
