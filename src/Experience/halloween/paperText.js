import * as THREE from "three";
import { useMemo } from "react";
import { HALLOWEEN_TEXT } from "./texts";
import { NIGHT_TINT } from "./materials";

/*
 * Draws the Halloween copy (texts.js) onto canvases in the same hand-made
 * style as the original paper cutouts, and maps them onto existing meshes.
 */

const FONT_FAMILY = "Spooky Hand";
const FONT_URL = "/fonts/NothingYouCouldDo-Regular.ttf";
const INK = "#2a2420";
const PX_PER_UNIT = 430;
const MAX_SIDE = 1100;
const RAINBOW = ["#d8433a", "#3f7fd1", "#3a9c5b", "#8e44ad", "#e67e22", "#c2185b"];

/* ------------------------------------------------------------ font (suspends) */

let fontPromise = null;
let fontReady = false;
const ensureFont = () => {
  if (fontReady) return;
  if (!fontPromise) {
    const face = new FontFace(FONT_FAMILY, `url(${FONT_URL})`);
    fontPromise = face
      .load()
      .then((loaded) => document.fonts.add(loaded))
      .catch(() => {}) // fall back to the browser's cursive font
      .finally(() => (fontReady = true));
  }
  throw fontPromise; // let <Suspense> wait for the handwriting
};

const fontString = (px) => `${px}px "${FONT_FAMILY}", "Comic Sans MS", cursive`;

/* ------------------------------------------------------------ tiny helpers */

const seeded = (seedString) => {
  let s = 0;
  for (const c of seedString) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

// hand-drawn closed shape through the given points (smoothed, jittered)
const wobblyPath = (ctx, pts, rnd, jitter) => {
  const p = pts.map(([x, y]) => [x + (rnd() - 0.5) * jitter, y + (rnd() - 0.5) * jitter]);
  ctx.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(p[p.length - 1], p[0]);
  ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < p.length; i++) {
    const next = p[(i + 1) % p.length];
    m = mid(p[i], next);
    ctx.quadraticCurveTo(p[i][0], p[i][1], m[0], m[1]);
  }
  ctx.closePath();
};

// rounded rectangle as a point list (so it can wobble)
const roundRectPoints = (x, y, w, h, r, steps = 5) => {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return pts;
};

const withShadow = (ctx, H, fn) => {
  ctx.save();
  // soft paper shadow, kept small so it never reaches the canvas edge
  ctx.shadowColor = "rgba(20, 12, 30, 0.28)";
  ctx.shadowBlur = H * 0.022;
  ctx.shadowOffsetX = H * 0.008;
  ctx.shadowOffsetY = H * 0.014;
  fn();
  ctx.restore();
};

const notebookLines = (ctx, x, y, w, h, gap, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, gap * 0.06);
  for (let ly = y + gap; ly < y + h; ly += gap) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }
  ctx.restore();
};

const write = (ctx, text, x, y, px, color, { rainbow = false, align = "left", maxWidth } = {}) => {
  let size = px;
  ctx.font = fontString(size);
  if (maxWidth) {
    while (ctx.measureText(text).width > maxWidth && size > 8) {
      size *= 0.94;
      ctx.font = fontString(size);
    }
  }
  const width = ctx.measureText(text).width;
  let cx = align === "center" ? x - width / 2 : x;
  ctx.lineWidth = Math.max(1, size * 0.03); // the pen is a bit thicker than the font
  ctx.lineJoin = "round";
  if (!rainbow) {
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.fillText(text, cx, y);
    ctx.strokeText(text, cx, y);
    return { width, size };
  }
  [...text].forEach((ch, i) => {
    ctx.fillStyle = ctx.strokeStyle = RAINBOW[i % RAINBOW.length];
    ctx.fillText(ch, cx, y);
    ctx.strokeText(ch, cx, y);
    cx += ctx.measureText(ch).width;
  });
  return { width, size };
};

const wrap = (ctx, text, px, maxWidth) => {
  ctx.font = fontString(px);
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
};

/* ------------------------------------------------------------ doodles */

const doodleGhost = (ctx, cx, cy, r) => {
  ctx.save();
  ctx.fillStyle = "#fbfaf6";
  ctx.strokeStyle = INK;
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, cy + r * 0.6);
  ctx.lineTo(cx - r * 0.6, cy - r * 0.1);
  ctx.arc(cx, cy - r * 0.1, r * 0.6, Math.PI, 0);
  ctx.lineTo(cx + r * 0.6, cy + r * 0.6);
  for (let i = 0; i < 3; i++) {
    const x0 = cx + r * 0.6 - (i * r * 1.2) / 3;
    ctx.quadraticCurveTo(x0 - r * 0.1, cy + r * 0.35, x0 - r * 0.2, cy + r * 0.6);
    ctx.quadraticCurveTo(x0 - r * 0.3, cy + r * 0.85, x0 - r * 0.4, cy + r * 0.6);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.12, r * 0.09, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.2, cy - r * 0.12, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const doodlePumpkin = (ctx, cx, cy, r) => {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = r * 0.12;
  ctx.fillStyle = "#6e8a3a";
  ctx.fillRect(cx - r * 0.08, cy - r * 0.75, r * 0.16, r * 0.3);
  ctx.strokeRect(cx - r * 0.08, cy - r * 0.75, r * 0.16, r * 0.3);
  ctx.fillStyle = "#f2892b";
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.75, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd84a";
  const tri = (x) => {
    ctx.beginPath();
    ctx.moveTo(x - r * 0.15, cy - r * 0.02);
    ctx.lineTo(x, cy - r * 0.25);
    ctx.lineTo(x + r * 0.15, cy - r * 0.02);
    ctx.closePath();
    ctx.fill();
  };
  tri(cx - r * 0.28);
  tri(cx + r * 0.28);
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.2, r * 0.35, r * 0.12, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();
};

/* ------------------------------------------------------------ paper styles */

// returns the content box {x, y, w, h} text should be written into
const drawPaper = (ctx, W, H, spec, rnd) => {
  const u = Math.min(W, H);
  switch (spec.style) {
    case "sticky": {
      const m = u * 0.085;
      withShadow(ctx, H, () => {
        ctx.fillStyle = spec.paper;
        wobblyPath(ctx, roundRectPoints(m, m, W - 2 * m, H - 2 * m, u * 0.03, 2), rnd, u * 0.02);
        ctx.fill();
      });
      notebookLines(ctx, m, m, W - 2 * m, H - 2 * m, H * 0.075, "rgba(255,255,255,0.18)");
      // little "look at me" rays, like the original notes
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = u * 0.012;
      ctx.lineCap = "round";
      const cx = W / 2;
      const cy = H / 2;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3 + rnd() * 0.2;
        const r0 = 0.88;
        const r1 = 0.96 + rnd() * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0 * (W / 2 - m), cy + Math.sin(a) * r0 * (H / 2 - m));
        ctx.lineTo(cx + Math.cos(a) * r1 * (W / 2 - m), cy + Math.sin(a) * r1 * (H / 2 - m));
        ctx.stroke();
      }
      ctx.restore();
      return { x: m * 2.4, y: m * 2, w: W - m * 4.8, h: H - m * 4, align: "center", valign: "middle" };
    }
    case "card":
    case "greyCard": {
      const m = u * 0.06;
      const grey = spec.style === "greyCard";
      withShadow(ctx, H, () => {
        ctx.fillStyle = grey ? "#bdb9b3" : "#fbfaf6";
        wobblyPath(ctx, roundRectPoints(m, m, W - 2 * m, H - 2 * m, u * (grey ? 0.03 : 0.12)), rnd, u * 0.015);
        ctx.fill();
      });
      ctx.save();
      wobblyPath(ctx, roundRectPoints(m, m, W - 2 * m, H - 2 * m, u * (grey ? 0.03 : 0.12)), rnd, u * 0.015);
      ctx.clip();
      notebookLines(ctx, m, m, W - 2 * m, H - 2 * m, H * 0.07, grey ? "rgba(255,255,255,0.25)" : "rgba(70,110,190,0.18)");
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = u * 0.014;
      wobblyPath(ctx, roundRectPoints(m, m, W - 2 * m, H - 2 * m, u * (grey ? 0.03 : 0.12)), rnd, u * 0.015);
      ctx.stroke();
      ctx.restore();
      const pad = m * 1.9;
      return { x: pad, y: pad * 0.9, w: W - pad * 2, h: H - pad * 1.8, align: "left", valign: "top" };
    }
    case "blob": {
      const cx = W / 2;
      const cy = H / 2;
      const pts = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.8 + rnd() * 0.18;
        pts.push([cx + Math.cos(a) * (W * 0.43) * r, cy + Math.sin(a) * (H * 0.42) * r]);
      }
      withShadow(ctx, H, () => {
        ctx.fillStyle = "#2f2b36";
        wobblyPath(ctx, pts, rnd, 0);
        ctx.fill();
      });
      return { x: W * 0.16, y: H * 0.18, w: W * 0.68, h: H * 0.64, align: "center", valign: "middle" };
    }
    default: {
      // "wall": ink straight on the notebook page. `pad` = [top, right, bottom, left]
      const [t, r, b, l] = spec.pad || [0.04, 0.04, 0.04, 0.04];
      return { x: W * l, y: H * t, w: W * (1 - l - r), h: H * (1 - t - b), align: "left", valign: "middle" };
    }
  }
};

const drawSpec = (ctx, W, H, key, spec) => {
  const rnd = seeded(key);
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  const box = drawPaper(ctx, W, H, spec, rnd);

  // icon on job cards: text starts to its right for the header lines
  let iconSpace = 0;
  if (spec.icon) {
    const r = H * 0.1;
    const cx = box.x + r * 0.9;
    const cy = box.y + r * 1.0;
    (spec.icon === "ghost" ? doodleGhost : doodlePumpkin)(ctx, cx, cy, r);
    iconSpace = r * 2.1;
  }

  // measure the block so it can be centred
  const items = [];
  (spec.lines || []).forEach((l, i) => {
    const px = l.size * H;
    items.push({ kind: "line", ...l, px, gap: (l.gapBefore || 0) * H, icon: spec.icon && i < 3 });
  });
  if (spec.paragraph) {
    const p = spec.paragraph;
    const px = p.size * H;
    wrap(ctx, p.text, px, box.w).forEach((t, i) =>
      items.push({ kind: "line", text: t, px, color: p.color, gap: i === 0 && spec.lines ? H * 0.04 : 0 })
    );
  }
  const lineHeight = (it) => it.px * 1.18 + it.gap;
  const total = items.reduce((s, it) => s + lineHeight(it), 0);
  let y = box.valign === "middle" ? box.y + (box.h - total) / 2 : box.y;

  items.forEach((it) => {
    y += it.gap + it.px;
    const indent = (it.indent || 0) * box.w + (it.icon ? iconSpace : 0);
    const x = box.align === "center" ? box.x + box.w / 2 : box.x + indent;
    const { width, size } = write(ctx, it.text, x, y, it.px, it.color || INK, {
      rainbow: it.rainbow,
      align: box.align,
      maxWidth: box.w - indent,
    });
    if (it.underline) {
      const x0 = box.align === "center" ? x - width / 2 : x;
      ctx.save();
      ctx.strokeStyle = it.underline;
      ctx.lineWidth = size * 0.12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y + size * 0.22);
      ctx.quadraticCurveTo(x0 + width / 2, y + size * 0.36, x0 + width, y + size * 0.18);
      ctx.stroke();
      ctx.restore();
    }
    y += it.px * 0.18;
  });
};

/* ------------------------------------------------------------ textures */

const planeSize = (geometry) => {
  geometry.computeBoundingBox();
  const s = geometry.boundingBox.getSize(new THREE.Vector3());
  // the gltf planes lie in local XZ, three's PlaneGeometry in XY
  return { width: s.x, height: Math.max(s.y, s.z) };
};

// solve the 3x3 system M·x = r (Cramer's rule)
const solve3 = (m, r) => {
  const det = (a) =>
    a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
    a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
    a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  const d = det(m);
  return [0, 1, 2].map((c) => det(m.map((row, i) => row.map((v, j) => (j === c ? r[i] : v)))) / d);
};

/**
 * The gltf planes point into a shared texture atlas, sometimes rotated or
 * flipped. Fit the affine map uv -> (s, t) where (s, t) is the position on
 * the paper (0..1, top-left origin), and use it as the texture matrix so a
 * fresh canvas lands upright on the mesh.
 */
const uvToPaperMatrix = (geometry) => {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const vertical = max.z - min.z > max.y - min.y ? "z" : "y";
  const w = max.x - min.x;
  const h = vertical === "z" ? max.z - min.z : max.y - min.y;

  // normal equations for s = a·u + b·v + c and t = d·u + e·v + f
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const bs = [0, 0, 0];
  const bt = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const sCoord = (pos.getX(i) - min.x) / w;
    // local +z points down the page once the plane is stood up; +y points up
    const tCoord = vertical === "z" ? (pos.getZ(i) - min.z) / h : (max.y - pos.getY(i)) / h;
    const row = [u, v, 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) A[r][c] += row[r] * row[c];
      bs[r] += row[r] * sCoord;
      bt[r] += row[r] * tCoord;
    }
  }
  const [a, b, c] = solve3(A, bs);
  const [d, e, f] = solve3(A, bt);
  return new THREE.Matrix3().set(a, b, c, d, e, f, 0, 0, 1);
};

const makeTexture = (key, width, height) => {
  const spec = HALLOWEEN_TEXT[key];
  const scale = Math.min(PX_PER_UNIT, MAX_SIDE / Math.max(width, height));
  const W = Math.round(width * scale);
  const H = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  drawSpec(canvas.getContext("2d"), W, H, key, spec);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const makeMaterial = (texture) =>
  new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.03,
    side: THREE.DoubleSide,
    color: NIGHT_TINT,
  });

/**
 * Material that draws texts.js[key] over the whole UV area of an existing
 * gltf plane (whose UVs point into a shared texture atlas).
 */
export const useHalloweenText = (key, geometry) => {
  ensureFont();
  return useMemo(() => {
    const { width, height } = planeSize(geometry);
    const texture = makeTexture(key, width, height);
    texture.flipY = false; // canvas top = t 0
    texture.matrixAutoUpdate = false;
    texture.matrix.copy(uvToPaperMatrix(geometry));
    return makeMaterial(texture);
  }, [key, geometry]);
};

/** A brand-new note (plain plane) for text that was painted into the wall. */
export const useHalloweenNote = (key, width, height) => {
  ensureFont();
  return useMemo(() => makeMaterial(makeTexture(key, width, height)), [key, width, height]);
};
