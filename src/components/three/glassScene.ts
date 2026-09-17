import * as THREE from "three";
import { bell, computeLayout, TAU, type CardPose } from "./glassLayout";
import {
  blueGlossMaterial,
  darkGlassMaterial,
  thickCardGeometry,
  thinCardGeometry,
} from "./glassMaterials";
import { backgroundTexture, domeTexture, radialTexture } from "./glassTextures";

export interface GlassSceneOptions {
  /** Render a single locked-up frame instead of animating — reduced-motion fallback. */
  still?: boolean;
  /** 스튜디오 배경 텍스처 없이 투명 캔버스로 그린다 (무배경 3D 마크). */
  transparent?: boolean;
  /** 마크를 캔버스 가운데에 놓는다 (`anchor: 0.5` 와 같다). */
  centered?: boolean;
  /** 마크의 가로 위치 — 캔버스 폭의 비율(0 왼쪽 … 1 오른쪽). 비율이 달라져도 화면상 같은 자리에 온다. */
  anchor?: number;
}

/** three's WebGLRenderer gained this knob late; treat it as optional. */
type TransmissionAwareRenderer = THREE.WebGLRenderer & {
  transmissionResolutionScale?: number;
};

/** Seconds one full loop takes. */
const PERIOD = 11.0;
/** Phase where the cards sit gathered in the lock-up pose — the still frame. */
const STILL_PHASE = 0.15;
/** 히어로 기본 가로 위치 — 폭의 70% 지점 (원본 1.6 비율 화면에서 마크가 놓이던 자리). */
const HERO_ANCHOR = 0.7;
/** 카메라가 바라보는 월드 x — 화면 가로 중앙이 여기에 온다. */
const LOOK_X = 0.4;
const CAMERA_Z = 12.2;
const FOV = 26;

/**
 * Live "glass squares" logo scene — ported 1:1 from the source embed and wrapped
 * so React can mount it onto a <canvas> and tear it down cleanly. Being WebGL it
 * renders at the display's own resolution, so it stays crisp at any screen size
 * (unlike a fixed-resolution video).
 *
 * Returns a dispose function; call it on unmount.
 */
export function createGlassScene(
  canvas: HTMLCanvasElement,
  options?: GlassSceneOptions
): () => void {
  const still = !!options?.still;
  const transparent = !!options?.transparent;
  const anchor = options?.centered ? 0.5 : (options?.anchor ?? HERO_ANCHOR);

  const renderer: TransmissionAwareRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: transparent,
    preserveDrawingBuffer: false,
  });
  if (transparent) renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.5;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  if (!transparent) scene.background = backgroundTexture();

  /** Bakes the reflection environment: a gradient dome plus five light strips. */
  function buildEnv(ry: number, rz?: number): void {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const es = new THREE.Scene();
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(18, 48, 32),
      new THREE.MeshBasicMaterial({ map: domeTexture(), side: THREE.BackSide })
    );
    dome.material.color.setScalar(2.6);
    dome.rotation.y = ry;
    dome.rotation.z = rz === undefined ? -0.3 : rz; // tilt -> 45° sweep boundary like the source
    es.add(dome);

    const strip = (
      w: number,
      h: number,
      s: number,
      pos: readonly [number, number, number],
      rot: readonly [number, number, number]
    ): void => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
      );
      m.material.color.setScalar(s);
      m.position.set(pos[0], pos[1], pos[2]);
      m.rotation.set(rot[0], rot[1], rot[2]);
      es.add(m);
    };
    strip(10, 3, 7.0, [0, 9, 1], [Math.PI / 2, 0, 0.2]); // ceiling strip -> top rim light
    strip(10, 2, 1.5, [0, -8, 3], [-Math.PI / 2, 0, 0]); // floor bounce -> lower bevels
    strip(2, 12, 2.0, [11, 1, 0], [0, -Math.PI / 2, 0]); // right strip (dark right edges)
    strip(2, 12, 7.5, [-11, 1, -1], [0, Math.PI / 2, 0]); // left chrome strip (bright edge light)
    strip(0.8, 9, 7.0, [6.5, 4, 8], [0, Math.PI, -0.15]); // sharp vertical glint

    scene.environment = pmrem.fromScene(es, 0.02).texture;
    pmrem.dispose();
  }
  buildEnv(2.5, 0.6);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0.6, CAMERA_Z);

  const darkGlass = darkGlassMaterial();
  const blueGloss = blueGlossMaterial();
  const thinGeo = thinCardGeometry();
  const thickGeo = thickCardGeometry();

  const darkCard = new THREE.Mesh(thinGeo, darkGlass);
  darkCard.name = "glassBack";
  const clearCard = new THREE.Mesh(thinGeo, darkGlass);
  clearCard.name = "glassFront";
  const blueCard = new THREE.Mesh(thickGeo, blueGloss);
  blueCard.name = "blueGloss";

  const spinner = new THREE.Group();
  spinner.add(darkCard, clearCard, blueCard);

  const pivot = new THREE.Group();
  pivot.add(spinner);
  pivot.rotation.z = 0.12; // slight roll -> diagonal lock-up like the source
  pivot.position.set(0, -0.05, 0); // x 는 resize 에서 anchor 로 계산
  scene.add(pivot);

  /** z=0 평면에서 카메라에 보이는 월드 폭 → anchor 비율을 월드 x 로. */
  const anchorToWorldX = (aspect: number): number => {
    const visibleH = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    // 세로로 긴 화면에서는 마크가 잘리지 않게 가운데 쪽으로 당긴다
    const pull = aspect < 1.2 ? Math.max(0, (aspect - 0.6) / 0.6) : 1;
    const a = 0.5 + (anchor - 0.5) * pull;
    return LOOK_X + (a - 0.5) * visibleH * aspect;
  };

  // ---- Lights ----
  const key = new THREE.DirectionalLight(0xffffff, 0.25);
  key.position.set(-4, 6, 6);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 0.15);
  rim.position.set(6, 2, -4);
  const fill = new THREE.DirectionalLight(0xffffff, 0.15);
  fill.position.set(3, -2, 5);
  scene.add(key, rim, fill);

  // ---- Ambient glow ----
  // No floor plane and no contact shadow: a ground plane draws a hard horizon
  // across the middle of the hero, leaving the lower half flat black. The
  // backdrop texture carries the whole frame instead, and this additive glow
  // sits behind the mark as a soft blue bloom.
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3.5),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(34,96,230,0.26)", "rgba(34,96,230,0)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(3.4, 3.0, 1); // wide + soft so it reads as ambient bloom
  glow.position.set(0, -0.9, -4.0); // behind the cards, facing the camera (x follows the pivot)
  if (!transparent) scene.add(glow);

  // ---- Resize + framing (sized to the canvas box, not the whole window) ----
  function resize(): void {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.lookAt(LOOK_X, -0.15, 0);
    const px = anchorToWorldX(camera.aspect);
    pivot.position.x = px;
    glow.position.x = px + 0.1;
  }

  /** Poses everything for one point on the loop and renders a frame. */
  function applyPhase(p: number): void {
    const L = computeLayout(p);
    spinner.rotation.y = L.yaw;
    const posed: Array<[THREE.Mesh, CardPose]> = [
      [darkCard, L.dark],
      [clearCard, L.clear],
      [blueCard, L.blue],
    ];
    for (const [mesh, cd] of posed) {
      mesh.position.set(cd.x, cd.y, cd.z);
      mesh.rotation.set(cd.rx, cd.ry, cd.rz);
    }
    const pop = bell(0.123, 0.018, p); // impact accent when cards lock
    pivot.scale.setScalar(0.8);
    pivot.position.y = -0.05 + 0.05 * Math.sin(TAU * p); // gentle float (nudged down)
    pivot.rotation.z = 0.12 + 0.018 * Math.sin(TAU * 2 * p + 1.2); // gentle rock
    pivot.rotation.x = 0.05 * L.w * Math.sin(L.psi); // weave sway
    renderer.toneMappingExposure = 1.05 + 0.1 * pop;
    camera.position.set(0, 0.6 + 0.15 * L.w, CAMERA_Z - 1.15 * L.w); // push in during the transform
    camera.lookAt(LOOK_X, -0.15, 0);
    glow.material.color.setScalar(1 + 0.5 * L.w); // glow breathes with the weave
    renderer.render(scene, camera);
  }

  // ---- Lifecycle ----
  let rafId = 0;
  let paused = false;
  let disposed = false;
  let elapsed = 0;
  let last = performance.now();

  function tick(): void {
    if (disposed) return;
    rafId = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (paused) return; // keep time current but skip the (expensive) render
    elapsed += dt;
    applyPhase((elapsed % PERIOD) / PERIOD);
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (still) applyPhase(STILL_PHASE); // keep the frozen frame correct on resize
  });
  ro.observe(canvas);
  resize();
  requestAnimationFrame(() => {
    resize(); // guard against a 0×0 first layout
    if (still) applyPhase(STILL_PHASE);
  });

  // Reduced motion: draw the locked-up pose once and never animate.
  if (still) {
    applyPhase(STILL_PHASE);
    return function disposeStill() {
      disposed = true;
      ro.disconnect();
      renderer.dispose();
    };
  }

  const onVis = () => {
    if (!disposed) paused = document.hidden;
  };
  document.addEventListener("visibilitychange", onVis);
  // Stop rendering while the hero is scrolled out of view.
  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!document.hidden && entry) paused = !entry.isIntersecting;
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  tick();

  return function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry?.dispose();
      const material: THREE.Material | THREE.Material[] = obj.material;
      for (const m of Array.isArray(material) ? material : [material]) {
        // Materials own their maps; drop those before the material itself.
        for (const value of Object.values(m as unknown as Record<string, unknown>)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        m.dispose();
      }
    });
    if (scene.background instanceof THREE.Texture) scene.background.dispose();
    scene.environment?.dispose();
    // NOTE: only renderer.dispose() — never forceContextLoss() here. A remount
    // (React StrictMode in dev, HMR, route changes) reuses the same <canvas>, and
    // a force-lost context makes the next getContext() return null → three then
    // reads null.precision and throws on the second WebGLRenderer construction.
    renderer.dispose();
  };
}
