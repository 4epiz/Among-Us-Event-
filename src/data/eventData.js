/*
 * Central event configuration.
 * Replace the `null` values with real details when they are confirmed.
 * Anything left as `null` renders as "To be announced" — nothing is invented.
 */

export const TBA = "To be announced";

export const event = {
  name: "Zero Trust",
  tagline: "An Among Us community event",
  description:
    "A community-run Among Us event for crews who like to talk things through, catch slips, and vote with conviction.",

  // Links — set these to your real destinations.
  // Where the final "Register for the Event" button goes. Leave null until signups open;
  // the header and hero buttons always scroll to the registration section.
  registrationUrl: null, // e.g. "https://forms.gle/..." or a Luma / Discord signup link
  communityUrl: null, // e.g. "https://discord.gg/your-invite"
  communityLabel: "Discord",

  // Exact start, used by the countdown. ISO 8601 with offset, e.g. "2026-11-22T19:00:00+05:30".
  // While null, the countdown shows a "date not announced" state.
  startsAt: null,

  details: {
    date: null, // e.g. "Saturday, 22 November 2026"
    startTime: null, // e.g. "7:00 PM"
    timeZone: null, // e.g. "IST (UTC+05:30)"
    venue: null, // e.g. "Online — private lobbies on Asia servers"
    slots: null, // e.g. "60 players · 6 lobbies"
    // "open" | "closed" | "soon"
    registrationStatus: "soon",
  },
};

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "roles", label: "Roles" },
  { id: "meeting", label: "Play" },
  { id: "details", label: "Details" },
  { id: "schedule", label: "Schedule" },
  { id: "faq", label: "FAQ" },
];

export const backgrounds = [
  {
    src: "/1792072994516_background_image_1.png",
    label: "Crew in open space",
    layout: "cover",
    position: "50% 62%",
    mobilePosition: "54% 70%",
    scrim: 0.55,
    scrimMobile: 0.6,
  },
  {
    src: "/1792072994516_background_image_2.png",
    label: "Red crewmate",
    layout: "portrait",
    position: "50% 40%",
    mobilePosition: "50% 38%",
    scrim: 0.25,
    scrimMobile: 0.55,
  },
  {
    src: "/1792072994515_background_image_3.png",
    label: "Ship interior",
    layout: "cover",
    position: "55% 50%",
    mobilePosition: "40% 50%",
    scrim: 0.6,
    scrimMobile: 0.62,
  },
];

export const steps = [
  {
    title: "Assemble your crew",
    body: "Register solo or with friends. We balance lobbies so every table has a fair mix of players.",
  },
  {
    title: "Complete the tasks",
    body: "Crewmates work through tasks around the map. Every finished task brings the ship closer to safety.",
  },
  {
    title: "Find the impostor",
    body: "Watch who goes where, check alibis, and call a meeting the moment something doesn't add up.",
  },
  {
    title: "Survive the meeting",
    body: "Make your case, listen to theirs, and vote. One wrong call can hand the impostor the game.",
  },
];

export const schedule = [
  {
    time: null,
    title: "Registration and lobby setup",
    body: "Check in, confirm your in-game name, and get your lobby code.",
  },
  {
    time: null,
    title: "Crew briefing",
    body: "Rules, map rotation, voting etiquette, and how disconnects are handled.",
  },
  {
    time: null,
    title: "Main matches",
    body: "Rotating rounds across lobbies. Your best results carry forward.",
  },
  {
    time: null,
    title: "Final round",
    body: "The top players from each lobby meet in a single deciding match.",
  },
  {
    time: null,
    title: "Results and closing",
    body: "Standings, highlights from the night, and a thank-you to every crew.",
  },
];

export const tickerItems = [
  "Where?",
  "Emergency meeting",
  "I was in Electrical",
  "Skip the vote",
  "Self report?",
  "Trust no one",
  "Vote them out",
  "Watch the vents",
  "Who's sus?",
];

// Facts about the game itself (not the event).
export const gameFacts = [
  { value: 15, label: "players can share one lobby" },
  { value: 5, label: "official maps to learn" },
  { value: 9, label: "roles across two teams" },
  { value: 1, label: "bad vote can end the game" },
];

export const roles = [
  {
    team: "crew",
    name: "Crewmate",
    ability: "Finish tasks, report bodies, and call meetings.",
    detail:
      "The backbone of every round. Crewmates win by completing every task or by voting out all impostors.",
    tip: "Move in pairs early. Being seen is the best alibi you'll ever have.",
  },
  {
    team: "crew",
    name: "Engineer",
    ability: "Can hop into vents, just like an impostor.",
    detail:
      "Engineers can enter vents to cross the map quickly, which makes them fast responders and easy suspects.",
    tip: "Tell the crew early that you can vent, before someone sees you do it.",
  },
  {
    team: "crew",
    name: "Scientist",
    ability: "Checks vitals from anywhere on the map.",
    detail:
      "Scientists carry a portable vitals monitor that shows who is alive, dead, or disconnected, on a limited battery.",
    tip: "Check vitals right after the lights come back. Timing narrows down the killer.",
  },
  {
    team: "crew",
    name: "Tracker",
    ability: "Tags one player and follows them on the map.",
    detail: "Trackers attach a tracker to another player and can see their location for a short time.",
    tip: "Track whoever was last seen near a body. Their route tells the story.",
  },
  {
    team: "crew",
    name: "Noisemaker",
    ability: "Sends out an alert when they are killed.",
    detail:
      "When a Noisemaker dies, nearby players get an alert pointing at the body, so the kill doesn't stay hidden.",
    tip: "Stay close to others. Your death is the crew's best clue.",
  },
  {
    team: "crew",
    name: "Guardian Angel",
    ability: "A ghost who can shield living crewmates.",
    detail: "After dying, a Guardian Angel can protect one living player from a single kill attempt.",
    tip: "Guard whoever is about to be alone with the most suspicious player.",
  },
  {
    team: "impostor",
    name: "Impostor",
    ability: "Kills, vents, and sabotages the ship.",
    detail:
      "Impostors blend in, fake tasks, and win by thinning out the crew or letting a critical sabotage run out.",
    tip: "Fake tasks in rooms people actually walk through. An empty alibi is a weak one.",
  },
  {
    team: "impostor",
    name: "Shapeshifter",
    ability: "Takes the appearance of another player.",
    detail:
      "Shapeshifters can briefly look like someone else, which makes witness reports unreliable.",
    tip: "Shift into someone with a strong alibi, then let the crew argue.",
  },
  {
    team: "impostor",
    name: "Phantom",
    ability: "Turns invisible for a short time.",
    detail: "Phantoms can vanish from sight, then reappear somewhere nobody expected them.",
    tip: "Disappear on your way out of a room, not on your way in.",
  },
];

export const maps = [
  {
    name: "The Skeld",
    setting: "A spaceship",
    body: "The classic map. Tight corridors, a central cafeteria, cameras in Security and no vitals, so good memory wins meetings.",
    sabotage: "Reactor meltdown and O2 depletion",
  },
  {
    name: "MIRA HQ",
    setting: "A headquarters in the sky",
    body: "Compact and highly connected. Most vents link to each other, so kills can happen far from where the impostor was last seen.",
    sabotage: "Reactor meltdown and comms",
  },
  {
    name: "Polus",
    setting: "A research base on a snowy planet",
    body: "Wide outdoor paths, plenty of doors to lock, and a vitals monitor that shows who's still alive.",
    sabotage: "Seismic stabilisers",
  },
  {
    name: "The Airship",
    setting: "A massive flying ship",
    body: "The largest map. Players choose where they spawn, then move between rooms by ladders, platforms and long hallways.",
    sabotage: "Crash course",
  },
  {
    name: "The Fungle",
    setting: "A jungle island",
    body: "Ziplines, a lookout tower, and dense paths where it's easy to lose track of who went where.",
    sabotage: "Mushroom mixup and reactor",
  },
];

// The Emergency Meeting mini-game.
export const meeting = {
  location: "Electrical",
  victim: { name: "Orange", color: "#F5A040" },
  impostor: "Green",
  suspects: [
    {
      name: "Red",
      color: "#F45858",
      statement: "I did my scan in MedBay. Yellow watched me do it.",
    },
    {
      name: "Blue",
      color: "#67C9F5",
      statement: "I was in Navigation the whole time, on my own.",
    },
    {
      name: "Green",
      color: "#8DD982",
      statement: "I walked through Electrical on my way from Storage. Nobody was in there.",
    },
    {
      name: "Yellow",
      color: "#FFD166",
      statement: "Red's scan is real. After that I went to Admin with Purple.",
    },
    {
      name: "Purple",
      color: "#B8A5F5",
      statement: "Yellow and I were at the Admin table. It showed two people in Electrical.",
    },
  ],
  explanation:
    "Admin showed two people in Electrical: Orange and the killer. Green admitted walking through Electrical, then claimed it was empty. Orange was in there either way, so Green's story can't be true.",
};

export const prepTasks = [
  "Register for the event",
  "Install or update Among Us",
  "Set your in-game name to match your registration",
  "Join the community server",
  "Read the lobby rules below",
  "Test your voice setup",
];

export const rules = [
  {
    title: "Play it straight",
    body: "No mods, cheats, or third-party tools. Anything that shows more than the game does is out.",
  },
  {
    title: "Dead means quiet",
    body: "Once you're out, stop sharing information with living players, in voice or in text, until the round ends.",
  },
  {
    title: "Accuse, don't attack",
    body: "Push hard in meetings, but keep it about the game. Personal insults get you removed from the lobby.",
  },
  {
    title: "Be on time",
    body: "Lobbies start at the listed time. Late players may lose their seat to someone on the waitlist.",
  },
  {
    title: "Disconnects",
    body: "Rejoin as fast as you can and tell your host. The host decides whether the round restarts.",
  },
  {
    title: "The host has the final word",
    body: "Hosts settle disputes, settings, and rule calls. Raise concerns calmly after the round.",
  },
];

export const faqs = [
  {
    q: "What is this event?",
    a: "A community-organised Among Us night. Players are grouped into lobbies and play a series of rounds under shared rules, finishing with a final match.",
  },
  {
    q: "Do I need to own Among Us?",
    a: "Yes. You need your own copy of Among Us on any supported platform, signed in with an account that can join private lobbies.",
  },
  {
    q: "Can I register with friends?",
    a: "Yes. Each person registers individually and can note who they'd like to play with. We'll try to keep groups together where lobby balance allows.",
  },
  {
    q: "How do I join the lobby?",
    a: "Lobby codes are shared with registered players shortly before the start, through the channel listed in your confirmation.",
  },
  {
    q: "Is there an entry fee?",
    a: "Entry details will be confirmed on this page before registration opens. Nothing is charged through this website.",
  },
  {
    q: "Which platforms can I play on?",
    a: "Among Us supports cross-play, so PC, mobile and console players can share a lobby as long as they're on the same game version and server region.",
  },
  {
    q: "Do I need voice chat?",
    a: "Meetings move faster with voice. The voice setup for each lobby will be shared in the crew briefing.",
  },
  {
    q: "Which roles and maps will be used?",
    a: "Lobby settings, roles and the map rotation are confirmed in the crew briefing so everyone plays under the same rules.",
  },
  {
    q: "Can I watch without playing?",
    a: "Spectator access depends on how the night is hosted. Check this page or the community server closer to the date.",
  },
  {
    q: "What happens if I miss my slot?",
    a: "Let the organisers know as early as you can. If a spot opens in a later round, we'll do our best to place you, but late arrivals can't be guaranteed a seat.",
  },
];
