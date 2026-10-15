# Zero Trust — Among Us community event site

Vite + React + Framer Motion + Lucide React.

## Run

```bash
npm install
npm run dev     # needs the server running for /register and /admin (see ../README.md)
npm run build
```

## Editing event content

All event content lives in `src/data/eventData.js`:

- `event.details` — date, start time, time zone, venue/server, slots, registration status (`"open" | "soon" | "closed"`). Anything left `null` shows as "To be announced".
- `event.registrationUrl` — where the registration panel's button goes. Defaults to `/register`, the built-in form. The button is disabled unless `registrationStatus` is `"open"`. The nav and hero buttons always go to `/register`. To stop accepting registrations, also set `REGISTRATION_OPEN=false` on the server.
- `event.communityUrl` — Discord/community link. Shown in the FAQ intro and footer only when set.
- `event.startsAt` — ISO date-time with offset (e.g. `"2026-11-22T19:00:00+05:30"`) that drives the live countdown. While `null`, the countdown shows a "date not announced" state.
- `schedule[].time` — `null` shows "TBA".
- `roles`, `maps`, `rules`, `prepTasks`, `tickerItems`, `gameFacts` — content for those sections.
- `meeting` — the Emergency Meeting puzzle: suspects, their statements, the impostor and the explanation. Change these to write your own puzzle.
- `backgrounds` — the three hero scenes in order, with per-scene focal points (`position`, `mobilePosition`) and text-contrast scrim strength (`scrim`, `scrimMobile`).

## Notes

- Background art lives in `public/` under its original filenames. `ai-prompt/` holds local design references only and is git-ignored.
- Motion respects `prefers-reduced-motion`: the hero starts paused, zoom is disabled, and section reveals are skipped.
- The hero background can be paused or switched with the scene controls at the bottom right.

## Interactive pieces

- **Ejection intro** (`src/components/EjectIntro.jsx`) — doubles as the loading screen. A crewmate cut from the supplied portrait art (`public/intro-crewmate.png`) tumbles across space along the welcome line, and "Welcome to Zero Trust." is uncovered right behind it as it passes. It flies right to left; set `DIRECTION` to `1` in the file to fly left to right instead. It waits for the hero images and fonts, gives up waiting after 9s, and can be skipped with the Skip button. Edit `headline` and `subline` at the top of the file to change the text.
- **Emergency Meeting** — a playable deduction puzzle with vote counting and an ejection screen.
- **Before you board** — a pre-event checklist; progress is saved in the visitor's browser.
- **Sabotage the lights** — the footer button darkens the page except for a circle around the pointer. Escape, the Fix button, or a 20-second timer restores it.
