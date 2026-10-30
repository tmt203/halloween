import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DARKNESS_RENDER_ORDER } from "./materials";

// A big dark sheet hung right in front of the camera with a soft hole in
// the middle. The hole follows the mouse / finger like a flashlight.
const DISTANCE = 1; // in front of the camera
const COVER = 2.4; // sheet size relative to the viewport, so the hole can reach every corner
const NIGHT = "18, 10, 40"; // deep purple night
const MAX_ALPHA = 0.86;

const makeDarknessTexture = (aspect) => {
  const long = 1024;
  const w = aspect >= 1 ? long : Math.round(long * aspect);
  const h = aspect >= 1 ? Math.round(long / aspect) : long;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // viewport size measured in canvas pixels
  const viewMin = Math.min(w, h) / COVER;
  const portrait = aspect < 1;
  const inner = viewMin * (portrait ? 0.34 : 0.26);
  const outer = viewMin * (portrait ? 0.95 : 0.8);

  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, outer);
  g.addColorStop(0, `rgba(${NIGHT},0)`);
  g.addColorStop(inner / outer, `rgba(${NIGHT},0.04)`);
  g.addColorStop(0.62, `rgba(${NIGHT},${MAX_ALPHA * 0.62})`);
  g.addColorStop(1, `rgba(${NIGHT},${MAX_ALPHA})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export default function Flashlight() {
  const { size, camera } = useThree();
  const sheet = useRef();
  const target = useRef(new THREE.Vector2(0, 0.05)); // NDC
  const current = useRef(new THREE.Vector2(0, 0.05));

  const aspect = size.width / size.height;
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: makeDarknessTexture(aspect),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [aspect]
  );

  useEffect(() => () => material.map.dispose(), [material]);

  useEffect(() => {
    const onMove = (e) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (!sheet.current) return;
    const vh = 2 * DISTANCE * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const vw = vh * camera.aspect;

    // a little lag + wobble makes it feel hand-held
    const k = 1 - Math.pow(0.0015, delta);
    current.current.lerp(target.current, k);
    const t = state.clock.elapsedTime;
    const wobbleX = Math.sin(t * 1.3) * 0.008 + Math.sin(t * 3.1) * 0.004;
    const wobbleY = Math.cos(t * 1.7) * 0.008;

    sheet.current.scale.set(vw * COVER, vh * COVER, 1);
    sheet.current.position.set(
      (current.current.x * vw) / 2 + wobbleX * vw,
      (current.current.y * vh) / 2 + wobbleY * vh,
      -DISTANCE
    );
  });

  return (
    <mesh
      ref={sheet}
      material={material}
      renderOrder={DARKNESS_RENDER_ORDER}
      raycast={() => null}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
