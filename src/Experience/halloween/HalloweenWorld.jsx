import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useCutout,
  preloadCutouts,
  makeGlowMaterial,
  GLOW_RENDER_ORDER,
  NIGHT_TINT,
} from "./materials";
import {
  PUMPKINS,
  TOMBSTONES,
  BATS,
  SPIDERS,
  GHOSTS,
  MOON,
  BUNTING,
  SIGN,
  CANDIES,
  CUTOUT_NAMES,
  ABOUT_SIGN,
} from "./config";
import { useTreats } from "./store";
import { useHalloweenNote } from "./paperText";

const plane = new THREE.PlaneGeometry(1, 1);
const WHITE = new THREE.Color("#ffffff");
const GHOST_TINT = new THREE.Color("#e9e6ff");

const setCursor = (c) => (document.body.style.cursor = c);
// decorations react to hover, but only treats get the "clickable" cursor
const hoverHandlers = (flag) => ({
  onPointerEnter: () => (flag.current = true),
  onPointerLeave: () => (flag.current = false),
});
const tmpScale = new THREE.Vector3();

const damp = (current, target, lambda, delta) =>
  THREE.MathUtils.damp(current, target, lambda, delta);

/* ------------------------------------------------------------ helpers */

// Plain standing cutout. `y` is where it stands, `h` is its height.
function Cutout({ name, x, y, z, h, rot = 0, tint }) {
  const { material, aspect } = useCutout(name, { tint });
  return (
    <group position={[x, y + h / 2, z]} rotation={[0, 0, rot]}>
      <mesh geometry={plane} material={material} scale={[h * aspect, h, 1]} />
    </group>
  );
}

function Glow({ color, size, opacity = 0.6, position = [0, 0, 0.02], flicker = 0, glowRef }) {
  const material = useMemo(() => makeGlowMaterial(color, opacity), [color, opacity]);
  const ref = useRef();
  const seed = useMemo(() => Math.random() * 100, []);
  useFrame((state) => {
    if (!flicker || !ref.current) return;
    const t = state.clock.elapsedTime + seed;
    const n = Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1) * 0.3 + Math.sin(t * 2.1) * 0.2;
    material.opacity = opacity * (1 - flicker * 0.5 + n * flicker * 0.5);
    ref.current.scale.setScalar(size * (1 + n * flicker * 0.06));
  });
  return (
    <mesh
      ref={(m) => {
        ref.current = m;
        if (glowRef) glowRef.current = m;
      }}
      geometry={plane}
      material={material}
      position={position}
      scale={size}
      renderOrder={GLOW_RENDER_ORDER}
      raycast={() => null}
    />
  );
}

/* ------------------------------------------------------------ pumpkins */

function Pumpkin({ name, x, y, z, h, rot }) {
  const { material, aspect } = useCutout(name, { tint: WHITE });
  const meshRef = useRef();
  const hovered = useRef(false);
  const bounce = useRef(0);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    bounce.current = damp(bounce.current, hovered.current ? 1 : 0, 6, delta);
    const squash = 1 + Math.sin(state.clock.elapsedTime * 14) * 0.07 * bounce.current;
    meshRef.current.scale.set(h * aspect * (2 - squash), h * squash, 1);
    meshRef.current.position.y = (squash - 1) * h * 0.5 + bounce.current * 0.04;
  });
  return (
    <group position={[x, y + h / 2, z]} rotation={[0, 0, rot]}>
      <mesh ref={meshRef} geometry={plane} material={material} scale={[h * aspect, h, 1]} {...hoverHandlers(hovered)} />
      <Glow color="#ff9a2e" size={h * 3.2} opacity={0.55} flicker={1} position={[0, -h * 0.05, 0.03]} />
    </group>
  );
}

/* ------------------------------------------------------------ bats */

function Bat({ home, radius, speed, phase, size }) {
  const body = useCutout("bat_body");
  const wing = useCutout("bat_wing");
  const group = useRef();
  const left = useRef();
  const right = useRef();

  const wingH = size * 0.62;
  const wingW = wingH * wing.aspect;

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (!group.current) return;
    group.current.position.set(
      home[0] + Math.sin(t) * radius[0],
      home[1] + Math.sin(t * 2) * radius[1] + Math.sin(t * 9) * 0.03,
      home[2]
    );
    group.current.rotation.z = Math.cos(t) * 0.15;
    const flap = Math.sin(state.clock.elapsedTime * (10 + speed * 4) + phase);
    right.current.rotation.z = flap * 0.55;
    right.current.rotation.y = flap * 0.35;
    left.current.rotation.z = -flap * 0.55;
    left.current.rotation.y = -flap * 0.35;
  });

  return (
    <group ref={group}>
      <mesh geometry={plane} material={body.material} scale={[size * body.aspect, size, 1]} position={[0, 0, 0.01]} />
      {/* hinge at the body's sides; wing art has its root on the left edge */}
      <group ref={right} position={[size * 0.22, size * 0.12, 0]}>
        <mesh geometry={plane} material={wing.material} scale={[wingW, wingH, 1]} position={[wingW / 2 - wingW * 0.04, wingH * 0.05, 0]} />
      </group>
      <group ref={left} position={[-size * 0.22, size * 0.12, 0]} scale={[-1, 1, 1]}>
        <mesh geometry={plane} material={wing.material} scale={[wingW, wingH, 1]} position={[wingW / 2 - wingW * 0.04, wingH * 0.05, 0]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------ spiders */

const threadMaterial = new THREE.MeshBasicMaterial({ color: "#3a3550" });

function Spider({ x, top, length, z, size, phase }) {
  const { material, aspect } = useCutout("spider");
  const spider = useRef();
  const thread = useRef();
  const hovered = useRef(false);
  const len = useRef(length);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + phase;
    // shy spiders scurry up when you shine a light / hover on them
    const target = hovered.current ? length * 0.25 : length + Math.sin(t * 0.8) * 0.35;
    len.current = damp(len.current, target, hovered.current ? 6 : 1.5, delta);
    const y = top - len.current;
    spider.current.position.set(x + Math.sin(t * 1.3) * 0.03, y, z);
    spider.current.rotation.z = Math.sin(t * 1.3) * 0.12;
    thread.current.scale.set(0.012, len.current + size * 0.2, 1);
    thread.current.position.set(x, top - len.current / 2 + size * 0.1, z - 0.01);
  });

  return (
    <>
      <mesh ref={thread} geometry={plane} material={threadMaterial} raycast={() => null} />
      <mesh
        ref={spider}
        geometry={plane}
        material={material}
        scale={[size * aspect, size, 1]}
        {...hoverHandlers(hovered)}
      />
    </>
  );
}

/* ------------------------------------------------------------ ghosts */

function Ghost({ x, y, z, h, phase }) {
  const { material, aspect } = useCutout("ghost", { tint: GHOST_TINT });
  const ref = useRef();
  const hovered = useRef(false);
  const shy = useRef(0);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * 0.7 + phase;
    shy.current = damp(shy.current, hovered.current ? 1 : 0, 3, delta);
    ref.current.position.set(
      x + Math.sin(t) * 0.5 + shy.current * 0.6,
      y + Math.sin(t * 2.1) * 0.18 + shy.current * 0.4,
      z
    );
    ref.current.rotation.z = Math.sin(t * 1.6) * 0.12;
    material.opacity = 0.92 - shy.current * 0.6;
  });
  return (
    <mesh
      ref={ref}
      geometry={plane}
      material={material}
      scale={[h * aspect, h, 1]}
      {...hoverHandlers(hovered)}
    />
  );
}

/* ------------------------------------------------------------ moon */

function Moon() {
  const { material, aspect } = useCutout("moon", { tint: WHITE });
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });
  return (
    <group position={[MOON.x, MOON.y, MOON.z]}>
      <Glow color="#fff1b8" size={MOON.h * 2.4} opacity={0.35} position={[0, 0, -0.02]} />
      <mesh ref={ref} geometry={plane} material={material} scale={[MOON.h * aspect, MOON.h, 1]} />
    </group>
  );
}

/* ------------------------------------------------------------ bunting */

function Bunting() {
  const { texture, aspect: atlasAspect } = useCutout("flags");
  const letters = 14;
  const cols = 7;
  const rows = 2;
  const flagAspect = (atlasAspect * rows) / cols;
  const h = BUNTING.flagHeight;
  const w = h * flagAspect;

  const { tube, flags } = useMemo(() => {
    const [x0, y0, z0] = BUNTING.from;
    const [x1, y1, z1] = BUNTING.to;
    const mid = new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2 - BUNTING.sag, (z0 + z1) / 2 + 0.2);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(x0, y0, z0),
      mid,
      new THREE.Vector3(x1, y1, z1)
    );
    const tube = new THREE.TubeGeometry(curve, 40, 0.012, 4, false);

    // "HAPPY HALLOWEEN" with a gap between the words
    const slots = [];
    const total = letters + 1;
    for (let i = 0, letter = 0; i < total; i++) {
      if (i === 5) continue; // the space
      const u = 0.04 + (i / (total - 1)) * 0.92;
      slots.push({ u, letter: letter++ });
    }
    const flags = slots.map(({ u, letter }) => {
      const tex = texture.clone();
      tex.repeat.set(1 / cols, 1 / rows);
      tex.offset.set((letter % cols) / cols, 1 - (Math.floor(letter / cols) + 1) / rows);
      tex.needsUpdate = true;
      const material = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.04,
        side: THREE.DoubleSide,
        color: NIGHT_TINT,
      });
      return { point: curve.getPoint(u), material, phase: letter * 0.7 };
    });
    return { tube, flags };
  }, [texture]);

  const refs = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.z = Math.sin(t * 1.4 + flags[i].phase) * 0.08;
      g.rotation.x = Math.sin(t * 1.1 + flags[i].phase) * 0.15;
    });
  });

  return (
    <group>
      <mesh geometry={tube} material={threadMaterial} raycast={() => null} />
      {flags.map((f, i) => (
        <group key={i} position={f.point} ref={(g) => (refs.current[i] = g)}>
          <mesh geometry={plane} material={f.material} scale={[w, h, 1]} position={[0, -h * 0.357, 0.01]} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ candies */

function Candy({ id, name, x, y, z, h }) {
  const { material, aspect } = useCutout(name, { tint: WHITE });
  const collected = useTreats((s) => !!s.collected[id]);
  const collect = useTreats((s) => s.collect);
  const group = useRef();
  const sparkle = useRef();
  const hovered = useRef(false);
  const pop = useRef(0);
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime + seed;
    if (collected) {
      pop.current = Math.min(1, pop.current + delta * 1.6);
      const p = pop.current;
      group.current.position.y = y + h / 2 + p * 0.9;
      const s = p < 0.25 ? 1 + p * 2 : Math.max(0, 1.5 * (1 - (p - 0.25) / 0.75));
      group.current.scale.setScalar(s);
      group.current.rotation.z += delta * 10;
      if (p >= 1) group.current.visible = false;
      return;
    }
    if (pop.current > 0) {
      // treats were hidden again ("Hide them again")
      pop.current = 0;
      group.current.visible = true;
      group.current.rotation.z = 0;
    }
    const hover = hovered.current ? 1 : 0;
    group.current.position.y = y + h / 2 + Math.sin(t * 2) * 0.03 + hover * 0.05;
    group.current.rotation.z = Math.sin(t * 1.5) * 0.15;
    const s = 1 + hover * 0.25;
    group.current.scale.lerp(tmpScale.setScalar(s), 0.2);
    // a faint twinkle so treats can be spotted with the flashlight
    sparkle.current.material.opacity = 0.25 + Math.max(0, Math.sin(t * 2.6)) * 0.35;
  });

  return (
    <group ref={group} position={[x, y + h / 2, z]}>
      <Glow color="#ffe6a0" size={h * 3} opacity={0.45} glowRef={sparkle} />
      <mesh
        geometry={plane}
        material={material}
        scale={[h * aspect * 1.15, h * 1.15, 1]}
        onPointerEnter={() => {
          if (collected) return;
          hovered.current = true;
          setCursor("pointer");
        }}
        onPointerLeave={() => {
          hovered.current = false;
          setCursor("auto");
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (collected) return;
          hovered.current = false;
          setCursor("auto");
          collect(id);
        }}
      />
    </group>
  );
}

/* ------------------------------------------------------------ notes */

// covers the "About me" note that is painted into scene 1's wall texture
function AboutSign() {
  const { x, y, z, w, h, rot } = ABOUT_SIGN;
  const material = useHalloweenNote("aboutSign", w, h);
  return <mesh geometry={plane} material={material} position={[x, y, z]} rotation={[0, 0, rot]} scale={[w, h, 1]} />;
}

/* ------------------------------------------------------------ world */

export default function HalloweenWorld() {
  return (
    <group>
      <AboutSign />
      <Moon />
      <Bunting />
      <Cutout {...SIGN} />
      {PUMPKINS.map((p, i) => (
        <Pumpkin key={i} {...p} />
      ))}
      {TOMBSTONES.map((t, i) => (
        <Cutout key={i} {...t} />
      ))}
      {GHOSTS.map((g, i) => (
        <Ghost key={i} {...g} />
      ))}
      {SPIDERS.map((s, i) => (
        <Spider key={i} {...s} />
      ))}
      {BATS.map((b, i) => (
        <Bat key={i} {...b} />
      ))}
      {CANDIES.map((c) => (
        <Candy key={c.id} {...c} />
      ))}
    </group>
  );
}

preloadCutouts(CUTOUT_NAMES);
