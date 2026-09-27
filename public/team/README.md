# Team photos

Drop a member's portrait here and it will show up on `/team` automatically at the next build. If there's no photo, the card shows the person's initials.

- **File name:** the member's `slug` from `lib/team-data.ts`, for example `natalie-germanov.jpg`.
- **Formats:** `.jpg`, `.jpeg`, `.png`, or `.webp`.
- **Shape:** portrait, 4:5 aspect ratio, about 800×1000 px, with the face in the upper third. Please keep files under ~200 KB.
- **Consent:** only add a photo the member has provided or approved for the site.

To resize a large photo, you can use `sharp`, which is already installed:

```bash
node -e "require('sharp')('in.jpg').resize(800,1000,{fit:'cover',position:'top'}).jpeg({quality:82}).toFile('public/team/first-last.jpg')"
```
