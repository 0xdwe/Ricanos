# Ricanos Context

## Domain terms

- **Event** — a padel tournament/community session. Has format, pairing mode, courts, score target, roster, rounds, matches, lifecycle, and public dashboard.
- **Roster** — players or teams participating in an event.
- **Reusable player** — player identity stored across events for future reuse and stats.
- **Fixed team** — two reusable players registered as one competitive team for a fixed-team event.
- **Round** — group of matches generated for the same sequence number.
- **Match** — one court assignment between two sides, each side containing either two players or one fixed team depending on pairing mode.
- **Leaderboard** — ranked standings derived from match history.
- **Public dashboard** — view-only event page shared by public slug, showing leaderboard first, matches, and player filtering.
- **Admin event read model** — hydrated event view data prepared for admin/public UI, including display names and leaderboard-ready rows. It keeps joins and ID-to-name mapping out of pages.
