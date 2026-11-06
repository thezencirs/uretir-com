import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { GalaxyPlanet, PlanetKind } from "./galaxy-data";

const NOISE = /* glsl */ `
float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
`;

const STAR_VERT = /* glsl */ `
uniform float uTime; uniform float uPixelRatio; uniform float uScale;
attribute float aSize; attribute float aSeed;
varying vec3 vColor; varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vTw = 0.78 + 0.22 * sin(uTime * (0.5 + aSeed * 1.8) + aSeed * 60.0);
  float dist = max(-mv.z, 0.5);
  gl_PointSize = clamp(aSize * uScale * uPixelRatio / dist, 0.9 * uPixelRatio, 8.0 * uPixelRatio);
  vColor = color;
}
`;

const STAR_FRAG = /* glsl */ `
uniform float uAlpha;
varying vec3 vColor; varying float vTw;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  float a = smoothstep(0.5, 0.0, d); a *= a;
  gl_FragColor = vec4(vColor * vTw, a * uAlpha);
}
`;

const HAZE_VERT = /* glsl */ `
varying vec2 vP;
void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const HAZE_FRAG = /* glsl */ `
uniform float uTime; uniform float uHaze;
varying vec2 vP;
${NOISE}
float arms(float r, float th){
  float s = 0.0;
  float phase = log(max(r, 0.5)) / 0.32;
  for (int i = 0; i < 4; i++) {
    float off = float(i) * 1.5707963;
    float d = mod(th - phase - off + 3.14159265, 6.2831853) - 3.14159265;
    float w = 0.30 + 0.12 * (r / 40.0);
    float amp = (i == 0 || i == 2) ? 1.0 : 0.55;
    s += amp * exp(-d * d / (w * w));
  }
  return s;
}
void main(){
  float r = length(vP);
  float th = atan(vP.y, vP.x);
  float fall = exp(-r / 13.0) * smoothstep(40.0, 24.0, r);
  float a = arms(r, th);
  float n = fbm(vec3(vP * 0.16, uTime * 0.008));
  float dens = fall * (0.22 + 1.25 * a) * (0.5 + 0.95 * n);
  float lane = smoothstep(0.55, 0.88, fbm(vec3(vP * 0.33 + 7.0, 3.0))) * clamp(a, 0.0, 1.0) * 0.65;
  dens *= (1.0 - lane);
  float core = exp(-r * r / (2.0 * 3.0 * 3.0)) * 1.55 + exp(-r * r / (2.0 * 9.0 * 9.0)) * 0.32;
  vec3 coreCol = vec3(1.0, 0.80, 0.52);
  vec3 armCol = mix(vec3(0.50, 0.64, 1.0), vec3(0.78, 0.86, 1.0), n);
  vec3 hii = vec3(1.0, 0.42, 0.68);
  vec3 col = armCol * dens * 0.50 + coreCol * core + hii * pow(clamp(a * n * fall, 0.0, 1.0), 3.0) * 0.55;
  gl_FragColor = vec4(col * uHaze, 1.0);
}
`;

const PLANET_VERT = /* glsl */ `
varying vec3 vObj; varying vec3 vNormalW; varying vec3 vWorld;
void main(){
  vObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const PLANET_FRAG = /* glsl */ `
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uColC; uniform vec3 uAtmo;
uniform float uStyle; uniform float uSeed; uniform float uHover; uniform float uTime; uniform vec3 uLight;
varying vec3 vObj; varying vec3 vNormalW; varying vec3 vWorld;
${NOISE}
void main(){
  vec3 p = normalize(vObj);
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uLight - vWorld);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 albedo; float spec = 0.0; vec3 emit = vec3(0.0); float cloud = 0.0;
  vec3 q = p * 2.3 + uSeed;
  if (uStyle < 0.5) {
    float h = fbm(q);
    float land = smoothstep(0.58, 0.62, h);
    albedo = mix(mix(uColA, uColB, smoothstep(0.2, 0.58, h)), mix(uColC * 0.55, uColC, noise(q * 6.0)), land);
    spec = (1.0 - land) * 0.7;
    cloud = smoothstep(0.52, 0.78, fbm(p * 3.6 + uSeed * 1.7 + vec3(uTime * 0.01, 0.0, 0.0)));
  } else if (uStyle < 1.5) {
    float h = fbm(q);
    float land = smoothstep(0.47, 0.52, h);
    vec3 landCol = mix(uColB, uColC, smoothstep(0.52, 0.78, h));
    float polar = smoothstep(0.78, 0.97, abs(p.y));
    albedo = mix(uColA, landCol, land);
    albedo = mix(albedo, vec3(0.93, 0.96, 1.0), polar);
    spec = (1.0 - land) * 0.5;
    cloud = smoothstep(0.55, 0.8, fbm(p * 3.2 + uSeed * 2.3 + vec3(uTime * 0.012, 0.0, 0.0))) * 0.9;
  } else if (uStyle < 2.5) {
    float warp = fbm(vec3(p.x * 2.0, p.y * 3.0, p.z * 2.0) + uSeed) * 2.6;
    float bands = sin(p.y * 15.0 + warp * 3.2 + uSeed) * 0.5 + 0.5;
    float fine = fbm(vec3(p.x * 1.2, p.y * 24.0, p.z * 1.2) + uSeed);
    albedo = mix(mix(uColA, uColB, bands), uColC, smoothstep(0.55, 0.95, fine * 0.7 + bands * 0.4));
  } else if (uStyle < 3.5) {
    float r1 = 1.0 - abs(fbm(q * 1.6) * 2.0 - 1.0);
    float crack = smoothstep(0.80, 0.97, r1);
    albedo = mix(uColA, uColA * 2.4 + vec3(0.04), fbm(q * 3.0));
    emit = uColC * crack * 1.35 + uColB * crack * 0.55;
  } else {
    float h = fbm(q * 1.3);
    float crater = smoothstep(0.62, 0.7, fbm(q * 4.0));
    albedo = mix(mix(uColA, uColB, h), uColC, smoothstep(0.55, 0.9, h) * 0.6);
    albedo *= 1.0 - crater * 0.28;
    albedo += uColC * smoothstep(0.82, 0.97, abs(p.y)) * 0.5;
  }
  float ndl = dot(N, L);
  float lit = smoothstep(-0.10, 0.85, ndl);
  vec3 base = mix(albedo, vec3(1.0), cloud * 0.78);
  vec3 col = base * (0.07 + 1.18 * lit + 0.40 * max(dot(N, V), 0.0) * (1.0 - lit));
  vec3 H = normalize(L + V);
  col += vec3(1.0, 0.95, 0.85) * pow(max(dot(N, H), 0.0), 55.0) * spec * 0.55 * (1.0 - cloud) * step(0.0, ndl);
  col += emit * (0.6 + 0.4 * (1.0 - lit));
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += uAtmo * fres * (0.10 + 0.78 * lit) * (0.8 + uHover * 0.9);
  col += uAtmo * uHover * 0.10;
  gl_FragColor = vec4(col, 1.0);
}
`;

const ATMO_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vNW; varying vec3 vW;
void main(){
  vN = normalize(normalMatrix * normal);
  vNW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const ATMO_FRAG = /* glsl */ `
uniform vec3 uAtmo; uniform float uHover; uniform vec3 uLight;
varying vec3 vN; varying vec3 vNW; varying vec3 vW;
void main(){
  float intensity = pow(max(0.66 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.4);
  vec3 L = normalize(uLight - vW);
  float lit = clamp(dot(normalize(vNW), L) * 0.55 + 0.55, 0.0, 1.0);
  gl_FragColor = vec4(uAtmo, 1.0) * intensity * (0.5 + 1.1 * lit) * (1.0 + uHover * 1.2);
}
`;

const RING_VERT = /* glsl */ `
varying vec2 vXY;
void main(){ vXY = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const RING_FRAG = /* glsl */ `
uniform float uInner; uniform float uOuter;
varying vec2 vXY;
${NOISE}
void main(){
  float t = (length(vXY) - uInner) / (uOuter - uInner);
  float a = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.86, t);
  float bands = 0.35 + 0.65 * noise(vec3(t * 46.0, 1.0, 2.0));
  float gap = 1.0 - (1.0 - smoothstep(0.0, 0.035, abs(t - 0.58))) * 0.92;
  vec3 col = mix(vec3(0.86, 0.72, 0.46), vec3(0.62, 0.50, 0.32), noise(vec3(t * 22.0, 4.0, 1.0)));
  gl_FragColor = vec4(col * (0.55 + 0.6 * bands), a * bands * gap * 0.82);
}
`;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

const GALAXY_RADIUS = 40;

function buildGalaxyGeometry(count: number) {
  const rand = mulberry32(20261102);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const core = new Color(1.0, 0.82, 0.58);
  const mid = new Color(0.92, 0.94, 1.0);
  const outer = new Color(0.58, 0.72, 1.0);
  const hii = new Color(1.0, 0.46, 0.72);
  const tmp = new Color();

  for (let i = 0; i < count; i++) {
    const roll = rand();
    let x: number, y: number, z: number;
    let size = 0.5 + Math.pow(rand(), 3) * 1.5;
    let brightness = 0.7 + rand() * 0.3;
    if (roll < 0.17) {
      const r = Math.abs(gauss(rand)) * 3.1;
      const th = rand() * Math.PI * 2;
      x = Math.cos(th) * r * 1.55;
      z = Math.sin(th) * r * 0.95;
      y = gauss(rand) * 1.35;
      tmp.copy(core);
      brightness *= 0.85;
    } else if (roll < 0.25) {
      const r = 6 + Math.abs(gauss(rand)) * 14;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.cos(ph) * 0.6;
      z = r * Math.sin(ph) * Math.sin(th);
      tmp.copy(core).lerp(mid, 0.5);
      brightness *= 0.45;
      size *= 0.8;
    } else {
      const r = Math.min(-Math.log(1 - rand() * 0.97) * 11, GALAXY_RADIUS - 1);
      const inArm = rand() < 0.74;
      const armIdx = Math.floor(rand() * 4);
      const spread = 0.26 + 0.24 * (r / GALAXY_RADIUS);
      const phase = Math.log(Math.max(r, 0.5)) / 0.32;
      const offset = gauss(rand) * spread;
      const th = inArm ? phase + (armIdx * Math.PI) / 2 + offset : rand() * Math.PI * 2;
      x = Math.cos(th) * r;
      z = -Math.sin(th) * r;
      y = gauss(rand) * (0.28 + 0.75 * Math.exp(-r / 6));
      const t = r / GALAXY_RADIUS;
      tmp.copy(core).lerp(mid, Math.min(1, t * 3.0)).lerp(outer, Math.max(0, Math.min(1, (t - 0.3) / 0.6)));
      if (inArm) {
        brightness *= 1.1;
        if (offset < -0.1 * spread && offset > -0.75 * spread && rand() < 0.55) { brightness *= 0.32; size *= 0.6; }
        if (rand() < 0.035) { tmp.lerp(hii, 0.85); size *= 1.7; brightness = 1; }
      } else {
        brightness *= 0.55;
      }
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    colors[i * 3] = tmp.r * brightness;
    colors[i * 3 + 1] = tmp.g * brightness;
    colors[i * 3 + 2] = tmp.b * brightness;
    sizes[i] = size;
    seeds[i] = rand();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geometry;
}

function glowTexture(inner: string, mid: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.18, mid);
    g.addColorStop(0.5, "rgba(255,170,90,0.10)");
    g.addColorStop(1, "rgba(255,150,70,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

const STYLE: Record<PlanetKind, number> = { ocean: 0, terra: 1, gas: 2, violet: 2, lava: 3, desert: 4, rose: 4, ice: 4 };

export type PlanetScreen = { id: string; x: number; y: number; r: number; show: boolean };

export type GalaxySceneOptions = {
  canvas: HTMLCanvasElement;
  planets: GalaxyPlanet[];
  quality: "high" | "low";
  reducedMotion: boolean;
  onFrame: (info: { progress: number; planets: PlanetScreen[] }) => void;
  onHover: (id: string | null) => void;
};

export type GalaxyScene = {
  setTarget: (value: number) => void;
  snapTo: (value: number) => void;
  setPointer: (x: number, y: number, inside: boolean) => void;
  setHover: (id: string | null) => void;
  pickAt: () => string | null;
  travelTo: (id: string, done: () => void) => void;
  resize: () => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
};

export function createGalaxyScene(options: GalaxySceneOptions): GalaxyScene {
  const { canvas, planets, quality, reducedMotion, onFrame, onHover } = options;
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.75 : 1.25);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x02030a, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 2000);

  // The planetary system sits at the origin; the galaxy is offset so that the system lies inside one of its arms.
  const systemOffset = new Vector3(15.5, 0, 8);
  const galaxyCenter = systemOffset.clone().multiplyScalar(-1);
  const galaxy = new Group();
  galaxy.position.copy(galaxyCenter);
  scene.add(galaxy);

  const starCount = quality === "high" ? 100000 : 38000;
  const starGeometry = buildGalaxyGeometry(starCount);
  const starMaterial = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uScale: { value: 190 }, uAlpha: { value: quality === "high" ? 0.62 : 0.8 } },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
  });
  galaxy.add(new Points(starGeometry, starMaterial));

  const hazeMaterial = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uHaze: { value: 1 } },
    vertexShader: HAZE_VERT,
    fragmentShader: HAZE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
  const haze = new Mesh(new PlaneGeometry(GALAXY_RADIUS * 2.1, GALAXY_RADIUS * 2.1, 1, 1), hazeMaterial);
  haze.rotation.x = -Math.PI / 2;
  haze.position.y = -0.05;
  galaxy.add(haze);

  // Distant background stars, independent from galaxy geometry.
  const bgCount = quality === "high" ? 4200 : 1800;
  const bgPos = new Float32Array(bgCount * 3);
  const bgCol = new Float32Array(bgCount * 3);
  const bgRand = mulberry32(77);
  for (let i = 0; i < bgCount; i++) {
    const u = bgRand() * 2 - 1, th = bgRand() * Math.PI * 2, rr = 700 + bgRand() * 200;
    const s = Math.sqrt(1 - u * u);
    bgPos[i * 3] = rr * s * Math.cos(th);
    bgPos[i * 3 + 1] = rr * u;
    bgPos[i * 3 + 2] = rr * s * Math.sin(th);
    const warm = bgRand();
    const b = 0.35 + Math.pow(bgRand(), 4) * 0.65;
    bgCol[i * 3] = b * (0.82 + warm * 0.18);
    bgCol[i * 3 + 1] = b * (0.86 + warm * 0.06);
    bgCol[i * 3 + 2] = b;
  }
  const bgGeometry = new BufferGeometry();
  bgGeometry.setAttribute("position", new BufferAttribute(bgPos, 3));
  bgGeometry.setAttribute("color", new BufferAttribute(bgCol, 3));
  const bgMaterial = new PointsMaterial({ size: 1.35, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  const background = new Points(bgGeometry, bgMaterial);
  scene.add(background);

  // System: star + orbit lines + planets.
  const system = new Group();
  scene.add(system);
  const sunTexture = glowTexture("rgba(255,255,245,1)", "rgba(255,226,150,0.75)");
  const sunCore = new Sprite(new SpriteMaterial({ map: sunTexture, blending: AdditiveBlending, depthWrite: false, transparent: true }));
  sunCore.scale.set(4.4, 4.4, 1);
  const sunCorona = new Sprite(new SpriteMaterial({ map: sunTexture, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.38 }));
  sunCorona.scale.set(12, 12, 1);
  system.add(sunCorona, sunCore);

  const lightPos = new Vector3(0, 0, 0);
  const ringRadii = [5.6, 8.8, 12.0];
  const ringTurns = [1.6, 1.25, 1];
  const orbitLines: LineLoop[] = [];
  const orbitMaterial = new LineBasicMaterial({ color: 0x9fb8d8, transparent: true, opacity: 0, depthWrite: false });
  ringRadii.forEach((radius) => {
    const pts: number[] = [];
    for (let i = 0; i < 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius * 0.92);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
    const line = new LineLoop(g, orbitMaterial);
    system.add(line);
    orbitLines.push(line);
  });

  type PlanetRuntime = {
    data: GalaxyPlanet;
    group: Group;
    body: Mesh;
    hit: Mesh;
    uniforms: { uHover: { value: number }; uTime: { value: number } };
    atmoUniforms: { uHover: { value: number } };
    hover: number;
    angle: number;
  };
  const runtimes: PlanetRuntime[] = planets.map((data, index) => {
    const group = new Group();
    const uniforms = {
      uColA: { value: new Color(data.colors[0]) },
      uColB: { value: new Color(data.colors[1]) },
      uColC: { value: new Color(data.colors[2]) },
      uAtmo: { value: new Color(data.atmosphere) },
      uStyle: { value: STYLE[data.kind] },
      uSeed: { value: 3.1 + index * 7.7 },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uLight: { value: lightPos },
    };
    const body = new Mesh(new SphereGeometry(data.radius, 72, 48), new ShaderMaterial({ uniforms, vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG }));
    body.rotation.z = 0.25 + (index % 3) * 0.12;
    group.add(body);
    const atmoUniforms = { uAtmo: uniforms.uAtmo, uHover: uniforms.uHover, uLight: uniforms.uLight };
    const atmosphere = new Mesh(new SphereGeometry(data.radius * 1.16, 48, 32), new ShaderMaterial({
      uniforms: atmoUniforms, vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, side: BackSide, blending: AdditiveBlending, transparent: true, depthWrite: false,
    }));
    group.add(atmosphere);
    if (data.ringed) {
      const inner = data.radius * 1.45, outer = data.radius * 2.45;
      const ring = new Mesh(new RingGeometry(inner, outer, 128, 1), new ShaderMaterial({
        uniforms: { uInner: { value: inner }, uOuter: { value: outer } }, vertexShader: RING_VERT, fragmentShader: RING_FRAG, transparent: true, side: DoubleSide, depthWrite: false,
      }));
      ring.rotation.x = Math.PI / 2 - 0.42;
      ring.rotation.y = 0.18;
      group.add(ring);
    }
    const hit = new Mesh(new SphereGeometry(data.radius * 1.35, 12, 8), new MeshBasicMaterial({ visible: false }));
    hit.userData.id = data.id;
    group.add(hit);
    system.add(group);
    return { data, group, body, hit, uniforms: uniforms as PlanetRuntime["uniforms"], atmoUniforms, hover: 0, angle: data.phase };
  });

  const raycaster = new Raycaster();
  const pointer = new Vector2(2, 2);
  let pointerInside = false;
  let hoverId: string | null = null;
  let forcedHover: string | null = null;
  let orbitDamp = 1;

  let target = 0, current = 0, active = true, disposed = false, frame = 0, last = performance.now(), time = 0, intro = 0, idle = 0, lastProgress = 0;
  let travel: { id: string; t: number; done: () => void } | null = null;
  let width = 1, height = 1, aspect = 1;
  const parallax = new Vector2();
  const camPos = new Vector3(), camLook = new Vector3(), tmpA = new Vector3(), tmpB = new Vector3(), projA = new Vector3(), projB = new Vector3();

  function layout() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    starMaterial.uniforms.uScale.value = 190 * Math.min(1.25, Math.max(0.8, height / 760));
  }

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const smoother = (v: number) => { const t = clamp01(v); return t * t * t * (t * (t * 6 - 15) + 10); };

  function planetWorld(rt: PlanetRuntime, out: Vector3) { return rt.group.getWorldPosition(out); }

  function update(dt: number) {
    const move = reducedMotion ? 0 : 1;
    time += dt * move;
    current += (target - current) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4.2));
    if (Math.abs(target - current) < 0.0004) current = target;
    intro = reducedMotion ? 1 : Math.min(1, intro + dt / 2.4);
    const k = smoother(intro);

    const portrait = aspect < 0.95;
    const ringScale = portrait ? 0.62 : Math.min(1, Math.max(0.52, aspect / 1.4));
    const zStretch = portrait ? Math.min(2.0, Math.max(0.92, 0.95 / aspect)) : 0.92;
    const baseDist = portrait ? 31.2 : 31.9;
    const viewMul = Math.max(1, ((12 * ringScale + 2.2) / (0.384 * aspect)) / baseDist);
    const planetScale = portrait ? 1 : Math.min(1, Math.max(0.6, ringScale * 1.25));

    // The camera stays on the planetary system; the Milky Way remains visible behind it.
    // A short entrance glides in from slightly farther away.
    (portrait ? camPos.set(0, 24, 20) : camPos.set(0, 17, 27)).multiplyScalar(viewMul * (1 + 0.45 * (1 - k)));
    camPos.y += 6 * (1 - k);
    camLook.set(0, 0, 0);

    // Gentle pointer parallax keeps the scene alive.
    parallax.x += (((pointerInside ? pointer.x : 0) - parallax.x) * (1 - Math.exp(-dt * 2.5)));
    parallax.y += (((pointerInside ? pointer.y : 0) - parallax.y) * (1 - Math.exp(-dt * 2.5)));
    camPos.x += parallax.x * 1.6 * move;
    camPos.y += parallax.y * 0.9 * move;

    if (travel) {
      travel.t = Math.min(1, travel.t + dt / 1.05);
      const rt = runtimes.find((item) => item.data.id === travel!.id);
      if (rt) {
        const tk = smoother(travel.t);
        planetWorld(rt, tmpA);
        tmpB.copy(camPos).sub(tmpA).normalize().multiplyScalar(rt.data.radius * planetScale * 2.1).add(tmpA);
        camPos.lerp(tmpB, tk);
        camLook.lerp(tmpA, tk);
      }
      if (travel.t >= 1) { const done = travel.done; travel = null; done(); }
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    starMaterial.uniforms.uTime.value = time;
    hazeMaterial.uniforms.uTime.value = time;
    hazeMaterial.uniforms.uHaze.value = 0.24;
    background.position.copy(camera.position);

    const appear = smooth(0.15, 0.85, intro);
    orbitMaterial.opacity = 0.16 * appear;
    sunCore.material.opacity = appear;
    sunCorona.material.opacity = 0.38 * appear;

    // Hovering a planet slows the idle drift so it is easy to click.
    const dampTarget = (hoverId || forcedHover) ? 0.1 : 1;
    orbitDamp += (dampTarget - orbitDamp) * (1 - Math.exp(-dt * 4));
    idle += dt * 0.012 * orbitDamp * move;
    orbitLines.forEach((line) => line.scale.set(ringScale, 1, (ringScale * zStretch) / 0.92));

    runtimes.forEach((rt, index) => {
      const ring = rt.data.ring;
      // The wheel drives the orbit: at progress 1 the outer ring has completed exactly one revolution.
      rt.angle = rt.data.phase + current * Math.PI * 2 * ringTurns[ring] + idle * ringTurns[ring];
      const a = ringRadii[ring] * ringScale;
      rt.group.position.set(Math.cos(rt.angle) * a, Math.sin(rt.angle * 2 + index) * 0.22, Math.sin(rt.angle) * a * zStretch);
      const reveal = smooth(0.25 + index * 0.05, 0.85 + index * 0.02, intro);
      rt.group.scale.setScalar(Math.max(0.0001, planetScale * reveal));
      rt.body.rotation.y += dt * 0.12 * move + (current - lastProgress) * 3;
      const wanted = (hoverId === rt.data.id || forcedHover === rt.data.id) ? 1 : 0;
      rt.hover += (wanted - rt.hover) * (1 - Math.exp(-dt * 9));
      rt.uniforms.uHover.value = rt.hover;
      rt.uniforms.uTime.value = time;
    });
    lastProgress = current;

    // Hover picking against generous invisible spheres.
    if (pointerInside && appear > 0.9 && !travel) {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(runtimes.map((rt) => rt.hit), false);
      const id = hits.length ? (hits[0].object.userData.id as string) : null;
      if (id !== hoverId) { hoverId = id; hoverChanged(id); }
    } else if (hoverId !== null && !pointerInside) { hoverId = null; hoverChanged(null); }

    camera.updateMatrixWorld();
    const screens: PlanetScreen[] = runtimes.map((rt) => {
      planetWorld(rt, tmpA);
      projA.copy(tmpA).project(camera);
      const x = (projA.x * 0.5 + 0.5) * width;
      const y = (-projA.y * 0.5 + 0.5) * height;
      projB.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(rt.data.radius * planetScale).add(tmpA).project(camera);
      const r = Math.abs((projB.x * 0.5 + 0.5) * width - x);
      return { id: rt.data.id, x, y, r, show: appear > 0.8 && projA.z < 1 && !travel };
    });
    onFrame({ progress: current, planets: screens });
  }

  function hoverChanged(id: string | null) { onHover(id); }

  function loop(now: number) {
    if (disposed) return;
    frame = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    renderer.render(scene, camera);
    if (active) frame = requestAnimationFrame(loop);
  }

  layout();
  frame = requestAnimationFrame((now) => { last = now; loop(now); });

  return {
    setTarget(value) { target = value; if (!active) { active = true; last = performance.now(); if (!frame) frame = requestAnimationFrame(loop); } },
    snapTo(value) { target = current = lastProgress = value; },
    setPointer(x, y, inside) { pointer.set(x, y); pointerInside = inside; },
    setHover(id) { forcedHover = id; },
    pickAt() { return hoverId; },
    travelTo(id, done) {
      const rt = runtimes.find((item) => item.data.id === id);
      if (!rt || travel) { done(); return; }
      travel = { id, t: 0, done };
      hoverId = id;
    },
    resize: layout,
    setActive(value) {
      if (value === active) return;
      active = value;
      if (value && !frame && !disposed) { last = performance.now(); frame = requestAnimationFrame(loop); }
      if (!value && frame) { cancelAnimationFrame(frame); frame = 0; }
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      scene.traverse((object) => {
        const mesh = object as Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as { dispose?: () => void } | { dispose?: () => void }[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose?.()); else material?.dispose?.();
      });
      sunTexture.dispose();
      renderer.dispose();
    },
  };
}
