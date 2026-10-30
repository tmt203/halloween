// World placements for the Halloween layer.
// x ranges of the original scenes:  meadow -24 → -3 | ocean -3 → 8 |
// desert 8 → 15 | haunted house 15 → 25.  Back wall sits at z = -2.75.
// Everything here lives inside the looping world group, so keep x in -24 → 25.

// `y` is the bottom of the cutout (what it stands on), `h` its height.
export const PUMPKINS = [
  { name: "pumpkin_classic", x: -16.6, y: 0.52, z: -2.05, h: 0.55, rot: 0.05 },
  { name: "pumpkin_sleepy", x: -12.3, y: 0.5, z: -1.9, h: 0.4, rot: -0.08 },
  { name: "pumpkin_silly", x: -7.0, y: 0.5, z: -1.2, h: 0.48, rot: 0.06 },
  { name: "pumpkin_classic", x: 9.0, y: 2.1, z: -2.0, h: 0.45, rot: -0.05 },
  { name: "pumpkin_silly", x: 17.35, y: 2.1, z: -1.6, h: 0.42, rot: 0.04 },
  { name: "pumpkin_sleepy", x: 21.6, y: 2.1, z: -1.0, h: 0.36, rot: -0.06 },
];

export const TOMBSTONES = [
  { name: "tomb_burnout", x: 15.9, y: 2.12, z: -2.3, h: 0.95, rot: -0.04 },
  { name: "tomb_crunch", x: 22.5, y: 2.12, z: -2.25, h: 0.9, rot: 0.06 },
  { name: "tomb_toxic", x: 23.7, y: 2.12, z: -1.7, h: 1.0, rot: -0.03 },
];

// flying bats: lissajous loop around `home`
export const BATS = [
  { home: [-15.5, 5.0, -1.8], radius: [2.2, 0.35], speed: 0.45, phase: 0, size: 0.42 },
  { home: [-8.5, 4.6, -1.5], radius: [1.6, 0.3], speed: 0.6, phase: 2, size: 0.34 },
  { home: [1.5, 5.6, -1.6], radius: [2.4, 0.4], speed: 0.38, phase: 4, size: 0.4 },
  { home: [12.5, 5.6, -2.0], radius: [1.8, 0.35], speed: 0.5, phase: 1, size: 0.36 },
  { home: [20.0, 6.0, -1.8], radius: [2.4, 0.45], speed: 0.42, phase: 3, size: 0.46 },
  { home: [19.0, 5.3, -1.3], radius: [1.4, 0.3], speed: 0.7, phase: 5, size: 0.28 },
];

// spiders dangling from the top of the page
export const SPIDERS = [
  { x: -9.6, top: 6.2, length: 2.2, z: -2.2, size: 0.38, phase: 0 },
  { x: 10.4, top: 6.6, length: 1.7, z: -2.4, size: 0.34, phase: 1.7 },
  { x: 24.0, top: 6.6, length: 2.4, z: -2.3, size: 0.4, phase: 3.1 },
];

export const GHOSTS = [
  { x: 0.4, y: 2.9, z: -1.2, h: 0.75, phase: 0 },
  { x: 14.6, y: 4.4, z: -2.0, h: 0.6, phase: 2.2 },
];

export const MOON = { x: 5.418, y: 5.164, z: -2.3, h: 2.5 };

export const BUNTING = {
  from: [-13.4, 4.95, -2.1],
  to: [-6.2, 4.95, -2.1],
  sag: 0.5,
  flagHeight: 0.46,
};

// new sticky note stuck over the painted "About me" sign (text in texts.js)
export const ABOUT_SIGN = { x: -15.86, y: 3.66, z: -2.7, w: 1.62, h: 1.58, rot: 0.07 };

export const SIGN = { name: "sign_treats", x: 23.15, y: 3.2, z: -2.5, h: 0.55, rot: 0.05 };

// 13 hidden treats for the mini-game
export const CANDIES = [
  { id: "c1", name: "candy_pink", x: -18.4, y: 0.75, z: 0.2, h: 0.22 },
  { id: "c2", name: "candy_corn", x: -13.9, y: 3.75, z: -2.4, h: 0.26 },
  { id: "c3", name: "lollipop", x: -10.4, y: 0.82, z: -0.6, h: 0.34 },
  { id: "c4", name: "candy_teal", x: -4.8, y: 3.55, z: -2.0, h: 0.2 },
  { id: "c5", name: "candy_purple", x: -0.9, y: 1.85, z: -0.9, h: 0.22 },
  { id: "c6", name: "candy_corn", x: 3.2, y: 3.0, z: -2.0, h: 0.24 },
  { id: "c7", name: "lollipop", x: 6.9, y: 2.2, z: -1.0, h: 0.32 },
  { id: "c8", name: "candy_pink", x: 10.0, y: 2.45, z: -1.8, h: 0.2 },
  { id: "c9", name: "candy_teal", x: 13.6, y: 4.3, z: -2.4, h: 0.2 },
  { id: "c10", name: "candy_corn", x: 14.9, y: 2.4, z: -0.9, h: 0.24 },
  { id: "c11", name: "candy_purple", x: 19.45, y: 5.05, z: -2.3, h: 0.22 },
  { id: "c12", name: "lollipop", x: 21.2, y: 2.45, z: -0.6, h: 0.3 },
  { id: "c13", name: "candy_pink", x: 24.2, y: 3.4, z: -2.3, h: 0.2 },
];

export const CUTOUT_NAMES = [
  "pumpkin_classic",
  "pumpkin_silly",
  "pumpkin_sleepy",
  "tomb_burnout",
  "tomb_crunch",
  "tomb_toxic",
  "bat_body",
  "bat_wing",
  "spider",
  "ghost",
  "moon",
  "flags",
  "sign_treats",
  "candy_pink",
  "candy_teal",
  "candy_purple",
  "candy_corn",
  "lollipop",
  "witch_hat",
];
