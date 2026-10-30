import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";

// Night tint multiplied into every paper material so the whole notebook
// feels like it's after dark. The flashlight (Flashlight.jsx) does the rest.
export const NIGHT_TINT = new THREE.Color("#b3a9e2");

export const halloweenUrl = (name) => `/halloween/${name}.webp`;

/**
 * Loads a hand-drawn cutout texture and returns a material plus the
 * texture's aspect ratio (width / height) so planes keep their proportions.
 */
export const useCutout = (name, { tint = NIGHT_TINT, opacity = 1 } = {}) => {
  const texture = useLoader(THREE.TextureLoader, halloweenUrl(name));

  return useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.04,
      opacity,
      side: THREE.DoubleSide,
      color: tint,
    });
    const aspect = texture.image.width / texture.image.height;
    return { material, aspect, texture };
  }, [texture, tint, opacity]);
};

export const preloadCutouts = (names) =>
  names.forEach((n) => useLoader.preload(THREE.TextureLoader, halloweenUrl(n)));

// ------------------------------------------------------------------ glow
// Soft radial sprite used for jack-o'-lantern light, moon halo and the
// sparkle that gives away hidden candy in the dark.
let glowTexture;
export const getGlowTexture = () => {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
};

export const makeGlowMaterial = (color, opacity = 0.6) =>
  new THREE.MeshBasicMaterial({
    map: getGlowTexture(),
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

// Glows are drawn after the darkness layer so they actually light up the night.
export const DARKNESS_RENDER_ORDER = 100;
export const GLOW_RENDER_ORDER = 101;
