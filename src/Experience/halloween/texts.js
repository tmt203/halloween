// ✏️ All the Halloween copy lives here. Edit freely: the paper pieces are
// redrawn from these strings when the page loads (handwriting font:
// Nothing You Could Do, OFL, /public/fonts).
//
// Sizes are a fraction of the piece's height. `color` is any CSS color.
// `style` picks the paper the text is written on (see paperText.js).
// Each piece swaps the texture of an existing mesh, so hover animations,
// positions and the cutout shape stay exactly as in the original scene.

const INK = "#2a2420";

export const HALLOWEEN_TEXT = {
  // scene 1 – handwriting on the wall next to Mr. Panda's bike
  intro: {
    style: "wall",
    lines: [
      { text: "Welcome to my", size: 0.19 },
      { text: "haunted notebook!!", size: 0.19 },
      { text: "- Mr. Panda", size: 0.16, indent: 0.4 },
      { text: "p.s. I love trick-or-treating!!", size: 0.115, gapBefore: 0.08 },
    ],
  },

  // scene 1 – small paragraph under "Who goes there?"
  about: {
    style: "wall",
    pad: [0.06, 0.03, 0.12, 0.13], // the wall hides this piece's edges a little
    paragraph: {
      text:
        "I'm a panda ghost hunter searching for the scariest monster of all. " +
        "Spoiler: it's not ghosts. It's humans being mean to each other! " +
        "Not chill and cute like us pandas. More spooky research is needed.",
      size: 0.078,
      color: INK,
    },
  },

  // scene 1 – the sticky note that used to say "About me" (painted on the
  // wall in the original, so this one is a new note stuck on top of it)
  aboutSign: {
    style: "sticky",
    paper: "#c3b2ee",
    lines: [
      { text: "Who goes", size: 0.21, rainbow: true },
      { text: "there?", size: 0.23, rainbow: true },
    ],
  },

  // scene 3 – orange sticky note above the job cards
  workSign: {
    style: "sticky",
    paper: "#f2a25c",
    lines: [
      { text: "Spooky", size: 0.2, rainbow: true },
      { text: "Work History", size: 0.17, rainbow: true },
    ],
  },

  firstJob: {
    style: "card",
    icon: "ghost",
    lines: [
      { text: "Junior Ghost Hunter", size: 0.1 },
      { text: "Panda Corp", size: 0.085 },
      { text: "Sep 2021 - Jan 2025", size: 0.085, gapBefore: 0.02 },
    ],
    paragraph: {
      text: "- Hunted haunted offices to see if toxic bosses are real monsters or just myths.",
      size: 0.074,
    },
  },

  secondJob: {
    style: "card",
    icon: "pumpkin",
    lines: [
      { text: "Senior Monster Researcher", size: 0.092 },
      { text: "Panda Inc", size: 0.085 },
      { text: "Jan 2025 - Current", size: 0.085, gapBefore: 0.02 },
    ],
    paragraph: {
      text: "- Investigating why some humans love to spook each other.",
      size: 0.074,
    },
  },

  // scene 4 – dark blob title + two papers
  // ("Reach out anytime!! I won't ghost you!" is kept: it's painted into the
  // wall texture as well, and it's already perfectly spooky)
  featured: {
    style: "blob",
    lines: [
      { text: "Featured", size: 0.24, color: "#efe9ff" },
      { text: "Frights", size: 0.24, color: "#efe9ff", underline: "#d8433a" },
    ],
  },

  firstPaper: {
    style: "greyCard",
    lines: [
      { text: "Crunch Time: The Real", size: 0.11 },
      { text: "Zombie Apocalypse", size: 0.11 },
      { text: "Publication #13", size: 0.1, gapBefore: 0.05 },
      { text: "Haunted Arts Foundation", size: 0.1 },
      { text: "- Best spooky paper award", size: 0.1 },
    ],
  },

  secondPaper: {
    style: "greyCard",
    lines: [
      { text: "Toxic bosses are", size: 0.1 },
      { text: "scarier than ghosts", size: 0.1 },
      { text: "Publication #666", size: 0.09, gapBefore: 0.04 },
      { text: "PPI Spooky Medical Journal", size: 0.09 },
      { text: "- 1,000,000 screams", size: 0.09 },
      { text: "- 5x pumpkin awards", size: 0.09 },
    ],
  },
};
