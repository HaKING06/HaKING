/**
 * HaKING 3D Virtual Museum — Three.js r128 interactive gallery tour.
 * Streams Steam screenshots onto framed museum bays inside a marble-and-obsidian
 * exhibition hall with CC0 sculpture/chandelier GLTF models and PBR textures.
 */

const VENDOR_ADDONS = [
  'assets/vendor/GLTFLoader.js?v=2.5.2-20261115',
  'assets/vendor/Reflector.js?v=2.5.2-20261115',
  'assets/vendor/RoomEnvironment.js?v=2.5.2-20261115'
];

const WING_SIZE = 15;
const FLOOR_HALF_W = 7.2;
const FLOOR_HALF_L = 13.8;
const WALL_HEIGHT = 6.2;
const PLAYER_EYE_Y = 1.68;
const PLAYER_BOUND_X = 5.75;
const PLAYER_BOUND_L = 12.45;
const AUTO_DWELL_SECONDS = 3.2;

let addonsPromise = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-museum-addon="${src}"]`);
    if (existing?.dataset.loaded === 'true') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.museumAddon = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.append(script);
  });
}

async function ensureThreeAndAddons() {
  for (let i = 0; !window.THREE && i < 80; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const T = window.THREE;
  if (!T) throw new Error('Three.js unavailable');
  if (T.GLTFLoader && T.Reflector && T.RoomEnvironment) return T;

  if (!addonsPromise) {
    addonsPromise = VENDOR_ADDONS.reduce(
      (chain, src) => chain.then(() => loadScriptOnce(src)),
      Promise.resolve()
    ).catch(err => {
      addonsPromise = null;
      throw err;
    });
  }
  await addonsPromise;
  return window.THREE;
}

function steamGalleryUrl(item, highRes = false) {
  const base = String(item?.original || item?.image || '').split('?')[0];
  if (!base.startsWith('https://')) return '';
  return highRes
    ? `${base}?imw=1280&imh=720&ima=fit&impolicy=Letterbox&letterbox=false`
    : `${base}?imw=640&imh=360&ima=fit&impolicy=Letterbox&letterbox=false`;
}

function buildCuratedWings(items) {
  const favorites = items.filter(x => x.favorite);
  const rest = items.filter(x => !x.favorite);
  const ordered = [...favorites, ...rest];
  const wings = [];
  for (let i = 0; i < ordered.length; i += WING_SIZE) {
    wings.push(ordered.slice(i, i + WING_SIZE));
  }
  return wings;
}

/**
 * Spatial coordinates for the 15 architectural bays:
 * North Hero Triptych (3), West Nave (5), East Nave (5), South Portal Flanks (2).
 */
function buildExhibitSlots() {
  const slots = [
    { x: 0, y: 2.58, z: -13.66, rotY: 0, width: 3.55, hero: true },
    { x: -4.2, y: 2.38, z: -13.66, rotY: 0, width: 2.65, hero: true },
    { x: 4.2, y: 2.38, z: -13.66, rotY: 0, width: 2.65, hero: true }
  ];

  const bayZs = [-9.6, -4.8, 0, 4.8, 9.6];
  for (const z of bayZs) {
    slots.push({ x: -7.06, y: 2.38, z, rotY: Math.PI / 2, width: 2.75, hero: false });
  }
  for (const z of [...bayZs].reverse()) {
    slots.push({ x: 7.06, y: 2.38, z, rotY: -Math.PI / 2, width: 2.75, hero: false });
  }
  slots.push(
    { x: 4.25, y: 2.38, z: 13.66, rotY: Math.PI, width: 2.55, hero: false },
    { x: -4.25, y: 2.38, z: 13.66, rotY: Math.PI, width: 2.55, hero: false }
  );
  return slots;
}

function makeFallbackArtTexture(T, title, numberLabel) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 288);
  grad.addColorStop(0, '#13151d');
  grad.addColorStop(1, '#231c15');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 288);
  ctx.strokeStyle = 'rgba(243, 189, 99, 0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 476, 252);
  ctx.fillStyle = '#f3bd63';
  ctx.font = '600 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`EXHIBIT ${numberLabel}`, 256, 128);
  ctx.fillStyle = '#ece6db';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(String(title || 'HaKING').slice(0, 34), 256, 166);
  const tex = new T.CanvasTexture(canvas);
  tex.encoding = T.sRGBEncoding;
  return tex;
}

function makePlaqueTexture(T, numberLabel, title, isFavorite) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 112;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#181512';
  ctx.fillRect(0, 0, 512, 112);
  ctx.strokeStyle = '#c89b4b';
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, 500, 100);
  ctx.fillStyle = '#f3bd63';
  ctx.font = '700 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${isFavorite ? '★ ' : ''}№ ${numberLabel}`, 256, 40);
  ctx.fillStyle = '#f3ede1';
  ctx.font = '600 24px system-ui, sans-serif';
  const cleanTitle = String(title || 'HaKING').trim();
  const shortTitle = cleanTitle.length > 32 ? `${cleanTitle.slice(0, 31)}…` : cleanTitle;
  ctx.fillText(shortTitle, 256, 78);
  const tex = new T.CanvasTexture(canvas);
  tex.encoding = T.sRGBEncoding;
  return tex;
}

function makeLightConeTexture(T) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(255, 224, 166, 0.34)');
  grad.addColorStop(0.55, 'rgba(255, 214, 145, 0.10)');
  grad.addColorStop(1, 'rgba(255, 214, 145, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(46, 0);
  ctx.lineTo(82, 0);
  ctx.lineTo(126, 256);
  ctx.lineTo(2, 256);
  ctx.closePath();
  ctx.fill();
  const tex = new T.CanvasTexture(canvas);
  tex.encoding = T.sRGBEncoding;
  return tex;
}

export async function openMuseum3D(options = {}) {
  const overlay = document.getElementById('museum-3d-overlay');
  const stage = document.getElementById('museum-3d-stage');
  if (!overlay || !stage) return;

  const {
    items = [],
    getCopy = () => ({}),
    onInspect = () => { },
    returnFocusTo = null
  } = options;

  const loadingEl = document.getElementById('museum-3d-loading');
  const loadingBar = document.getElementById('museum-3d-progress');
  const errorEl = document.getElementById('museum-3d-error');
  const wingLabelEl = document.getElementById('museum-3d-wing-label');
  const artLabelEl = document.getElementById('museum-3d-art-label');
  const targetPill = document.getElementById('museum-3d-target');
  const targetTitle = document.getElementById('museum-3d-target-title');
  const autoTourBtn = document.getElementById('museum-3d-autotour');
  const fpsBtn = document.getElementById('museum-3d-fps-btn');
  const closeBtn = document.getElementById('museum-3d-close');
  const wingPrevBtn = document.getElementById('museum-3d-wing-prev');
  const wingNextBtn = document.getElementById('museum-3d-wing-next');
  const artPrevBtn = document.getElementById('museum-3d-prev-art');
  const artNextBtn = document.getElementById('museum-3d-next-art');
  const inspectBtn = document.getElementById('museum-3d-inspect-art');

  const sponsorModal = document.getElementById('first-time-modal');
  if (sponsorModal && !sponsorModal.hidden) {
    sponsorModal.classList.remove('is-open');
    sponsorModal.hidden = true;
  }
  const detectTouchProfile = () => (
    window.matchMedia('(hover: none), (pointer: coarse)').matches ||
    (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) ||
    window.innerWidth <= 768
  );
  const isTouchProfile = detectTouchProfile();
  overlay.dataset.inputMode = isTouchProfile ? 'touch' : 'desktop';
  const fovForAspect = (w, h) => ((w / Math.max(1, h)) < 0.85 ? 72 : 60);
  const maxAniso = isTouchProfile ? 2 : 8;

  overlay.hidden = false;
  document.documentElement.classList.add('museum-3d-active');
  loadingEl.hidden = false;
  errorEl.hidden = true;
  if (loadingBar) loadingBar.style.width = '18%';
  closeBtn?.focus({ preventScroll: true });

  const c = getCopy();
  const wings = buildCuratedWings(items.length ? items : [{ id: '0', game: 'HaKING Archive', favorite: true }]);
  let wingIndex = 0;

  let T;
  try {
    T = await ensureThreeAndAddons();
  } catch {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    return;
  }
  if (loadingBar) loadingBar.style.width = '42%';

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch {
    loadingEl.hidden = true;
    errorEl.hidden = false;
    return;
  }

  const disposableTextures = [];
  const disposableGeos = [];
  const disposableMats = [];
  const artTextures = [];

  const trackGeo = g => { disposableGeos.push(g); return g; };
  const trackMat = m => { disposableMats.push(m); return m; };
  const trackTex = t => { disposableTextures.push(t); return t; };
  const col = hex => new T.Color(hex).convertSRGBToLinear();

  const stageW = stage.clientWidth || window.innerWidth;
  const stageH = Math.max(1, stage.clientHeight || window.innerHeight);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouchProfile ? 1.5 : 2));
  renderer.setSize(stageW, stageH);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const canvas = renderer.domElement;
  canvas.className = 'museum-3d-canvas';
  canvas.tabIndex = 0;
  stage.replaceChildren(canvas);

  const scene = new T.Scene();
  scene.background = new T.Color(0x0b0c10);
  scene.fog = new T.FogExp2(0x0b0c10, 0.017);

  let pmremRT = null;
  try {
    const pmrem = new T.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const roomEnv = new T.RoomEnvironment();
    pmremRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = pmremRT.texture;
    roomEnv.traverse(node => {
      node.geometry?.dispose?.();
      node.material?.dispose?.();
    });
    pmrem.dispose();
  } catch {
    // Software WebGL contexts without float extensions degrade cleanly to direct lights.
  }

  const camera = new T.PerspectiveCamera(fovForAspect(stageW, stageH), stageW / stageH, 0.1, 80);
  const player = {
    x: 0,
    y: PLAYER_EYE_Y,
    z: 10.6,
    yaw: 0,
    pitch: -0.02
  };
  camera.rotation.order = 'YXZ';

  const texLoader = new T.TextureLoader();
  const remoteTexLoader = new T.TextureLoader();
  remoteTexLoader.setCrossOrigin('anonymous');

  function loadLocalPbr(folder, prefix, rx, ry) {
    const setup = (url, srgb) => {
      const tex = texLoader.load(url);
      tex.wrapS = T.RepeatWrapping;
      tex.wrapT = T.RepeatWrapping;
      tex.repeat.set(rx, ry);
      if (srgb) tex.encoding = T.sRGBEncoding;
      tex.anisotropy = Math.min(maxAniso, renderer.capabilities.getMaxAnisotropy());
      return trackTex(tex);
    };
    return {
      map: setup(`${folder}/${prefix}_diff.jpg`, true),
      roughnessMap: setup(`${folder}/${prefix}_rough.jpg`, false),
      normalMap: setup(`${folder}/${prefix}_nor.jpg`, false)
    };
  }

  const marbleMaps = loadLocalPbr('assets/museum/textures/marble', 'marble', 7, 11);
  const plinthMarbleMaps = loadLocalPbr('assets/museum/textures/marble', 'marble', 1, 1);
  const plasterMaps = loadLocalPbr('assets/museum/textures/plaster', 'plaster', 6, 2);
  const woodMaps = loadLocalPbr('assets/museum/textures/wood', 'wood', 3, 1.5);
  const lightConeTex = trackTex(makeLightConeTexture(T));

  const wallMat = trackMat(new T.MeshStandardMaterial({
    color: col('#222631'),
    map: plasterMaps.map,
    roughnessMap: plasterMaps.roughnessMap,
    normalMap: plasterMaps.normalMap,
    normalScale: new T.Vector2(0.55, 0.55),
    roughness: 0.92,
    metalness: 0.04
  }));
  const marbleLightMat = trackMat(new T.MeshStandardMaterial({
    color: col('#dfd8cc'),
    map: plinthMarbleMaps.map,
    roughnessMap: plinthMarbleMaps.roughnessMap,
    normalMap: plinthMarbleMaps.normalMap,
    roughness: 0.25,
    metalness: 0.06
  }));
  const marbleDarkMat = trackMat(new T.MeshStandardMaterial({
    color: col('#12141b'),
    roughnessMap: marbleMaps.roughnessMap,
    normalMap: marbleMaps.normalMap,
    normalScale: new T.Vector2(0.45, 0.45),
    roughness: 0.62,
    metalness: 0.04,
    envMapIntensity: 0.28
  }));
  const walnutMat = trackMat(new T.MeshStandardMaterial({
    color: col('#6e4e35'),
    map: woodMaps.map,
    roughnessMap: woodMaps.roughnessMap,
    normalMap: woodMaps.normalMap,
    roughness: 0.55,
    metalness: 0.05
  }));
  const brassMat = trackMat(new T.MeshStandardMaterial({
    color: col('#d6a856'),
    roughness: 0.25,
    metalness: 0.88
  }));
  const darkMetalMat = trackMat(new T.MeshStandardMaterial({
    color: col('#14161b'),
    roughness: 0.42,
    metalness: 0.72
  }));
  const velvetMat = trackMat(new T.MeshStandardMaterial({
    color: col('#6f1620'),
    roughness: 0.92,
    metalness: 0.02
  }));
  const matBoardMat = trackMat(new T.MeshStandardMaterial({
    color: col('#16161b'),
    roughness: 0.92,
    metalness: 0.03
  }));

  // Floor: honed perimeter marble + center live Reflector with marble-vein glaze
  const baseFloor = new T.Mesh(trackGeo(new T.PlaneGeometry(FLOOR_HALF_W * 2, FLOOR_HALF_L * 2)), marbleDarkMat);
  baseFloor.rotation.x = -Math.PI / 2;
  baseFloor.receiveShadow = true;
  scene.add(baseFloor);

  let floorReflector = null;
  try {
    const reflRes = isTouchProfile ? 256 : 1024;
    floorReflector = new T.Reflector(trackGeo(new T.PlaneGeometry(6.6, 21.8)), {
      clipBias: 0.003,
      textureWidth: reflRes,
      textureHeight: reflRes,
      color: 0x38342f
    });
    floorReflector.position.y = 0.002;
    floorReflector.rotation.x = -Math.PI / 2;
    scene.add(floorReflector);
  } catch {
    floorReflector = null;
  }

  const centerMarbleOverlayMat = trackMat(new T.MeshStandardMaterial({
    color: col('#cfc8bc'),
    map: marbleMaps.map,
    roughnessMap: marbleMaps.roughnessMap,
    normalMap: marbleMaps.normalMap,
    transparent: true,
    opacity: floorReflector ? 0.5 : 0.92,
    roughness: 0.18,
    metalness: 0.1
  }));
  const centerAisle = new T.Mesh(trackGeo(new T.PlaneGeometry(6.6, 21.8)), centerMarbleOverlayMat);
  centerAisle.rotation.x = -Math.PI / 2;
  centerAisle.position.y = 0.005;
  centerAisle.receiveShadow = true;
  scene.add(centerAisle);

  // Brass floor inlay perimeter strips around center atrium
  for (const [bw, bd, bx, bz] of [
    [6.72, 0.08, 0, -10.94],
    [6.72, 0.08, 0, 10.94],
    [0.08, 21.96, -3.34, 0],
    [0.08, 21.96, 3.34, 0]
  ]) {
    const strip = new T.Mesh(trackGeo(new T.BoxGeometry(bw, 0.01, bd)), brassMat);
    strip.position.set(bx, 0.006, bz);
    scene.add(strip);
  }

  // Ceiling + recessed golden skylight bay + structural dark beams
  const ceilingMat = trackMat(new T.MeshStandardMaterial({ color: col('#121319'), roughness: 0.88, metalness: 0.08 }));
  const ceiling = new T.Mesh(trackGeo(new T.PlaneGeometry(FLOOR_HALF_W * 2, FLOOR_HALF_L * 2)), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = WALL_HEIGHT;
  scene.add(ceiling);

  const skylightMat = trackMat(new T.MeshBasicMaterial({ color: col('#cbb287') }));
  const skylight = new T.Mesh(trackGeo(new T.PlaneGeometry(4.0, 17.6)), skylightMat);
  skylight.rotation.x = Math.PI / 2;
  skylight.position.y = WALL_HEIGHT - 0.015;
  scene.add(skylight);

  for (const [sw, sd, sx, sz] of [
    [4.24, 0.14, 0, -8.87],
    [4.24, 0.14, 0, 8.87],
    [0.14, 17.88, -2.05, 0],
    [0.14, 17.88, 2.05, 0]
  ]) {
    const skylightFrame = new T.Mesh(trackGeo(new T.BoxGeometry(sw, 0.09, sd)), brassMat);
    skylightFrame.position.set(sx, WALL_HEIGHT - 0.05, sz);
    scene.add(skylightFrame);
  }

  const beamGeo = trackGeo(new T.BoxGeometry(FLOOR_HALF_W * 2, 0.34, 0.38));
  for (const bz of [-12, -7.2, -2.4, 2.4, 7.2, 12]) {
    const beam = new T.Mesh(beamGeo, darkMetalMat);
    beam.position.set(0, WALL_HEIGHT - 0.16, bz);
    scene.add(beam);
  }

  // Perimeter gallery walls + walnut wainscoting + brass dado trim + fluted pilasters
  const wallGeoNS = trackGeo(new T.PlaneGeometry(FLOOR_HALF_W * 2, WALL_HEIGHT));
  const wallGeoEW = trackGeo(new T.PlaneGeometry(FLOOR_HALF_L * 2, WALL_HEIGHT));

  const northWall = new T.Mesh(wallGeoNS, wallMat);
  northWall.position.set(0, WALL_HEIGHT / 2, -FLOOR_HALF_L);
  northWall.receiveShadow = true;
  scene.add(northWall);

  const southWall = new T.Mesh(wallGeoNS, wallMat);
  southWall.rotation.y = Math.PI;
  southWall.position.set(0, WALL_HEIGHT / 2, FLOOR_HALF_L);
  scene.add(southWall);

  const westWall = new T.Mesh(wallGeoEW, wallMat);
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(-FLOOR_HALF_W, WALL_HEIGHT / 2, 0);
  westWall.receiveShadow = true;
  scene.add(westWall);

  const eastWall = new T.Mesh(wallGeoEW, wallMat);
  eastWall.rotation.y = -Math.PI / 2;
  eastWall.position.set(FLOOR_HALF_W, WALL_HEIGHT / 2, 0);
  eastWall.receiveShadow = true;
  scene.add(eastWall);

  // Lower walnut wainscoting & brass chair-rail along all walls
  for (const [w, d, x, z] of [
    [FLOOR_HALF_W * 2, 0.08, 0, -FLOOR_HALF_L + 0.04],
    [FLOOR_HALF_W * 2, 0.08, 0, FLOOR_HALF_L - 0.04],
    [0.08, FLOOR_HALF_L * 2, -FLOOR_HALF_W + 0.04, 0],
    [0.08, FLOOR_HALF_L * 2, FLOOR_HALF_W - 0.04, 0]
  ]) {
    const wainscot = new T.Mesh(trackGeo(new T.BoxGeometry(w, 0.92, d)), walnutMat);
    wainscot.position.set(x, 0.46, z);
    wainscot.receiveShadow = true;
    scene.add(wainscot);

    const rail = new T.Mesh(trackGeo(new T.BoxGeometry(w + 0.02, 0.045, d + 0.02)), brassMat);
    rail.position.set(x, 0.94, z);
    scene.add(rail);
  }

  // South monumental HaKING exit portal arch between the 2 South flanking frames
  const portalArch = new T.Mesh(trackGeo(new T.BoxGeometry(3.2, 4.1, 0.16)), darkMetalMat);
  portalArch.position.set(0, 2.05, FLOOR_HALF_L - 0.08);
  scene.add(portalArch);
  const portalTrim = new T.Mesh(trackGeo(new T.BoxGeometry(3.38, 4.24, 0.12)), brassMat);
  portalTrim.position.set(0, 2.12, FLOOR_HALF_L - 0.06);
  scene.add(portalTrim);

  // 12 Obsidian-marble pilasters lining the 5 West & 5 East bays
  const pilasterShaftGeo = trackGeo(new T.BoxGeometry(0.42, WALL_HEIGHT - 0.4, 0.46));
  const pilasterCapGeo = trackGeo(new T.BoxGeometry(0.54, 0.16, 0.56));
  for (const x of [-FLOOR_HALF_W + 0.18, FLOOR_HALF_W - 0.18]) {
    for (const z of [-12, -7.2, -2.4, 2.4, 7.2, 12]) {
      const shaft = new T.Mesh(pilasterShaftGeo, marbleDarkMat);
      shaft.position.set(x, (WALL_HEIGHT - 0.4) / 2 + 0.1, z);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      scene.add(shaft);

      const cap = new T.Mesh(pilasterCapGeo, brassMat);
      cap.position.set(x, WALL_HEIGHT - 0.34, z);
      scene.add(cap);
    }
  }

  // Two walnut gallery benches along center axis (z = -6.2, +6.2)
  const benchObstacles = [];
  for (const bz of [-6.2, 6.2]) {
    const bench = new T.Group();
    bench.position.set(0, 0, bz);
    const seat = new T.Mesh(trackGeo(new T.BoxGeometry(2.5, 0.09, 0.78)), walnutMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    seat.receiveShadow = true;
    bench.add(seat);
    const inlay = new T.Mesh(trackGeo(new T.BoxGeometry(2.54, 0.02, 0.8)), brassMat);
    inlay.position.y = 0.405;
    bench.add(inlay);
    for (const lx of [-1.0, 1.0]) {
      const leg = new T.Mesh(trackGeo(new T.BoxGeometry(0.09, 0.4, 0.66)), darkMetalMat);
      leg.position.set(lx, 0.2, 0);
      leg.castShadow = true;
      bench.add(leg);
    }
    scene.add(bench);
    benchObstacles.push({ minX: -1.55, maxX: 1.55, minZ: bz - 0.72, maxZ: bz + 0.72 });
  }

  // Centerpiece tiered Carrara marble pedestal + brass stanchions + velvet ropes
  const plinth = new T.Group();
  for (const [pw, ph, py, mat] of [
    [2.1, 0.12, 0.06, marbleDarkMat],
    [1.65, 0.12, 0.18, marbleLightMat],
    [1.18, 0.92, 0.7, marbleLightMat],
    [1.26, 0.06, 1.19, brassMat]
  ]) {
    const block = new T.Mesh(trackGeo(new T.BoxGeometry(pw, ph, pw)), mat);
    block.position.y = py;
    block.castShadow = true;
    block.receiveShadow = true;
    plinth.add(block);
  }
  scene.add(plinth);

  const stanchionCorners = [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]];
  const postBaseGeo = trackGeo(new T.CylinderGeometry(0.14, 0.16, 0.05, 16));
  const postPoleGeo = trackGeo(new T.CylinderGeometry(0.025, 0.025, 0.86, 12));
  const postFinialGeo = trackGeo(new T.SphereGeometry(0.055, 14, 12));
  stanchionCorners.forEach(([sx, sz], i) => {
    const post = new T.Group();
    post.position.set(sx, 0, sz);
    const base = new T.Mesh(postBaseGeo, brassMat);
    base.position.y = 0.025;
    const pole = new T.Mesh(postPoleGeo, brassMat);
    pole.position.y = 0.44;
    pole.castShadow = true;
    const finial = new T.Mesh(postFinialGeo, brassMat);
    finial.position.y = 0.9;
    post.add(base, pole, finial);
    scene.add(post);

    const [nx, nz] = stanchionCorners[(i + 1) % stanchionCorners.length];
    const curve = new T.QuadraticBezierCurve3(
      new T.Vector3(sx, 0.8, sz),
      new T.Vector3((sx + nx) / 2, 0.56, (sz + nz) / 2),
      new T.Vector3(nx, 0.8, nz)
    );
    const rope = new T.Mesh(trackGeo(new T.TubeGeometry(curve, 16, 0.022, 8, false)), velvetMat);
    scene.add(rope);
  });

  // Gallery lighting (key lights + 4 wall wash lights — fast across desktop & mobile WebGL)
  scene.add(new T.HemisphereLight(0xf6eedf, 0x262934, 0.52));
  const rotundaSpot = new T.SpotLight(0xffe7bd, 1.9, 18, Math.PI / 4, 0.55, 1.1);
  rotundaSpot.position.set(1.6, 5.7, 2.2);
  rotundaSpot.target.position.set(0, 1.5, 0);
  rotundaSpot.castShadow = true;
  rotundaSpot.shadow.mapSize.set(1024, 1024);
  rotundaSpot.shadow.bias = -0.0005;
  scene.add(rotundaSpot, rotundaSpot.target);

  const northKeySpot = new T.SpotLight(0xffe5b8, 1.55, 18, Math.PI / 3.2, 0.65, 1.0);
  northKeySpot.position.set(0, 5.5, -7.8);
  northKeySpot.target.position.set(0, 2.4, -13.6);
  scene.add(northKeySpot, northKeySpot.target);

  const chandelierLight = new T.PointLight(0xffdaa3, 1.35, 18, 1.4);
  chandelierLight.position.set(0, 4.3, 0);
  scene.add(chandelierLight);

  for (const [lx, lz] of [[-3.6, -5.5], [3.6, -5.5], [-3.6, 5.5], [3.6, 5.5]]) {
    const wash = new T.PointLight(0xffe8c6, 0.65, 14, 1.3);
    wash.position.set(lx, 4.2, lz);
    scene.add(wash);
  }

  // Create 15 framed exhibit assemblies with sconce hoods, wash halos & brass plaques
  const slots = buildExhibitSlots();
  const exhibits = [];
  const artHitMeshes = [];
  const sconceMat = trackMat(new T.MeshBasicMaterial({ color: col('#ffe8be') }));

  slots.forEach((slot, idx) => {
    const group = new T.Group();
    group.position.set(slot.x, slot.y, slot.z);
    group.rotation.y = slot.rotY;
    scene.add(group);

    const frameW = slot.width;
    const frameH = frameW * (9 / 16);
    const pad = slot.hero ? 0.2 : 0.16;

    // Outer gilt brass frame
    const outerFrame = new T.Mesh(
      trackGeo(new T.BoxGeometry(frameW + pad * 2, frameH + pad * 2, 0.085)),
      brassMat
    );
    outerFrame.castShadow = true;
    group.add(outerFrame);

    // Recessed dark velvet passe-partout backing
    const innerMat = new T.Mesh(
      trackGeo(new T.BoxGeometry(frameW + pad * 0.8, frameH + pad * 0.8, 0.092)),
      matBoardMat
    );
    group.add(innerMat);

    // Artwork canvas plane (matte museum print finish preserves true contrast without gray glare)
    const artMat = trackMat(new T.MeshStandardMaterial({
      color: col('#ffffff'),
      roughness: 0.84,
      metalness: 0.0,
      envMapIntensity: 0.12,
      emissive: col('#000000'),
      emissiveIntensity: 0
    }));
    const artMesh = new T.Mesh(trackGeo(new T.PlaneGeometry(frameW, frameH)), artMat);
    artMesh.position.z = 0.052;
    group.add(artMesh);

    // Sculpted brass overhead picture sconce + gentle top light cone
    const sconceArm = new T.Mesh(trackGeo(new T.BoxGeometry(0.05, 0.04, 0.42)), brassMat);
    sconceArm.position.set(0, frameH / 2 + 0.36, 0.18);
    const sconceHood = new T.Mesh(trackGeo(new T.BoxGeometry(frameW * 0.56, 0.06, 0.14)), brassMat);
    sconceHood.position.set(0, frameH / 2 + 0.36, 0.38);
    const bulbStrip = new T.Mesh(trackGeo(new T.PlaneGeometry(frameW * 0.5, 0.08)), sconceMat);
    bulbStrip.rotation.x = Math.PI / 2;
    bulbStrip.position.set(0, frameH / 2 + 0.328, 0.38);
    group.add(sconceArm, sconceHood, bulbStrip);

    const haloMat = trackMat(new T.MeshBasicMaterial({
      map: lightConeTex,
      transparent: true,
      opacity: 0.11,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide
    }));
    const halo = new T.Mesh(trackGeo(new T.PlaneGeometry(frameW * 1.08, frameH * 0.92)), haloMat);
    halo.position.set(0, frameH * 0.24, 0.11);
    group.add(halo);

    // Engraved museum brass plaque beneath frame
    const plaqueMat = trackMat(new T.MeshStandardMaterial({ roughness: 0.38, metalness: 0.45 }));
    const plaque = new T.Mesh(trackGeo(new T.PlaneGeometry(0.92, 0.2)), plaqueMat);
    plaque.position.set(0, -(frameH / 2 + pad + 0.2), 0.015);
    group.add(plaque);

    const normal = new T.Vector3(0, 0, 1).applyAxisAngle(new T.Vector3(0, 1, 0), slot.rotY);
    const viewDist = slot.hero ? 3.5 : 2.85;
    const viewPos = new T.Vector3(slot.x, PLAYER_EYE_Y, slot.z).addScaledVector(normal, viewDist);

    const exhibit = {
      slotIndex: idx,
      slot,
      group,
      artMesh,
      artMat,
      haloMat,
      plaqueMat,
      viewPos,
      lookTarget: new T.Vector3(slot.x, slot.y, slot.z),
      item: null
    };
    artMesh.userData.exhibit = exhibit;
    artHitMeshes.push(artMesh);
    exhibits.push(exhibit);
  });

  // Load Poly Haven CC0 GLTF models cleanly (Marble Bust + Chandelier)
  const gltfLoader = new T.GLTFLoader();
  let bustMesh = null;
  let chandelierGroup = null;
  let disposed = false;

  const modelLoadJobs = [
    new Promise(resolve => {
      gltfLoader.load(
        'assets/museum/models/marble_bust_01/marble_bust_01_1k.gltf',
        gltf => {
          if (disposed) return resolve();
          const model = gltf.scene;
          model.scale.setScalar(2.25);
          const box = new T.Box3().setFromObject(model);
          model.position.set(
            -(box.min.x + box.max.x) / 2,
            1.22 - box.min.y,
            -(box.min.z + box.max.z) / 2
          );
          model.traverse(node => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          bustMesh = model;
          scene.add(model);
          resolve();
        },
        undefined,
        () => resolve()
      );
    }),
    new Promise(resolve => {
      gltfLoader.load(
        'assets/museum/models/chandelier_02/Chandelier_02_1k.gltf',
        gltf => {
          if (disposed) return resolve();
          const model = gltf.scene;
          model.scale.setScalar(2.6);
          const box = new T.Box3().setFromObject(model);
          model.position.set(
            -(box.min.x + box.max.x) / 2,
            WALL_HEIGHT - box.max.y - 0.04,
            -(box.min.z + box.max.z) / 2
          );
          model.traverse(node => {
            if (node.isMesh && node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach(mat => {
                if (String(mat.name || '').toLowerCase().includes('bulb')) {
                  mat.emissive = new T.Color('#ffdca8');
                  mat.emissiveIntensity = 1.65;
                }
              });
            }
          });
          chandelierGroup = model;
          scene.add(model);
          resolve();
        },
        undefined,
        () => resolve()
      );
    })
  ];

  let activeWingTextures = [];
  let wingLoadToken = 0;
  let wingFetchTimer = null;

  function clearActiveArtTextures() {
    clearTimeout(wingFetchTimer);
    wingFetchTimer = null;
    while (activeWingTextures.length) {
      const tex = activeWingTextures.pop();
      tex?.dispose?.();
    }
  }

  function loadWing(nextIndex) {
    wingIndex = ((nextIndex % wings.length) + wings.length) % wings.length;
    const token = ++wingLoadToken;
    clearActiveArtTextures();

    const wingItems = wings[wingIndex];
    const startNumber = wingIndex * WING_SIZE + 1;
    const pendingLoads = [];
    exhibits.forEach((exhibit, idx) => {
      const item = wingItems[idx] || wingItems[idx % wingItems.length];
      exhibit.item = item;
      exhibit.numberLabel = String(startNumber + idx).padStart(2, '0');

      const placeholder = makeFallbackArtTexture(T, item.game, exhibit.numberLabel);
      activeWingTextures.push(placeholder);
      exhibit.artMat.map = placeholder;
      exhibit.artMat.needsUpdate = true;

      const plaqueTex = makePlaqueTexture(T, exhibit.numberLabel, item.game, item.favorite);
      activeWingTextures.push(plaqueTex);
      exhibit.plaqueMat.map = plaqueTex;
      exhibit.plaqueMat.needsUpdate = true;

      const wantHighRes = exhibit.slot.hero || !isTouchProfile;
      const src = steamGalleryUrl(item, wantHighRes);
      if (src) pendingLoads.push([exhibit, item, src]);
    });

    const startWingFetches = () => {
      if (disposed || token !== wingLoadToken) return;
      pendingLoads.forEach(([exhibit, item, src]) => {
        remoteTexLoader.load(
          src,
          tex => {
            if (disposed || token !== wingLoadToken) {
              tex.dispose();
              return;
            }
            tex.encoding = T.sRGBEncoding;
            tex.anisotropy = Math.min(maxAniso, renderer.capabilities.getMaxAnisotropy());
            activeWingTextures.push(tex);
            exhibit.artMat.map = tex;
            exhibit.artMat.needsUpdate = true;
          },
          undefined,
          () => {
            const fallbackSrc = steamGalleryUrl(item, false);
            if (!fallbackSrc || fallbackSrc === src || disposed || token !== wingLoadToken) return;
            remoteTexLoader.load(
              fallbackSrc,
              tex => {
                if (disposed || token !== wingLoadToken) {
                  tex.dispose();
                  return;
                }
                tex.encoding = T.sRGBEncoding;
                tex.anisotropy = Math.min(maxAniso, renderer.capabilities.getMaxAnisotropy());
                activeWingTextures.push(tex);
                exhibit.artMat.map = tex;
                exhibit.artMat.needsUpdate = true;
              }
            );
          }
        );
      });
    };

    if (token === 1) startWingFetches();
    else wingFetchTimer = setTimeout(startWingFetches, 180);

    if (wingLabelEl) {
      const prefix = wingIndex === 0 ? (c.museum_3d_showcase || 'Showcase') : (c.museum_3d_wing || 'Wing');
      wingLabelEl.textContent = `${prefix} · ${wingIndex + 1} / ${wings.length}`;
    }
    if (wingPrevBtn) wingPrevBtn.disabled = wings.length <= 1;
    if (wingNextBtn) wingNextBtn.disabled = wings.length <= 1;
    updateArtCounter(0);
  }

  // Movement, camera glide, raycasting & auto-tour state
  const galleryDialog = document.getElementById('gallery-dialog');
  const keysDown = new Set();
  const touchMove = { forward: false, back: false, left: false, right: false };
  const padButtons = [...overlay.querySelectorAll('[data-pad]')];
  let activeExhibitIndex = 0;
  let focusedExhibit = null;
  let glide = null;
  let autoTour = false;
  let autoDwell = AUTO_DWELL_SECONDS;
  let returnToFpsAfterDialog = false;
  let isDragging = false;
  let dragDistance = 0;
  let lastPointer = { x: 0, y: 0 };
  let rafId = 0;
  let prevTime = performance.now();
  const raycaster = new T.Raycaster();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dragYawSens = isTouchProfile ? 0.0052 : 0.0040;
  const dragPitchSens = isTouchProfile ? 0.0042 : 0.0034;
  const baseWalkSpeed = isTouchProfile ? 3.4 : 4.2;

  function clearInputs() {
    keysDown.clear();
    touchMove.forward = false;
    touchMove.back = false;
    touchMove.left = false;
    touchMove.right = false;
    for (const btn of padButtons) btn.classList.remove('is-pressed');
  }

  function safeRequestPointerLock() {
    if (isTouchProfile || document.pointerLockElement === canvas) return;
    try {
      const maybePromise = canvas.requestPointerLock?.();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => { });
      }
    } catch { }
  }

  function updateArtCounter(idx) {
    activeExhibitIndex = ((idx % exhibits.length) + exhibits.length) % exhibits.length;
    const item = exhibits[activeExhibitIndex]?.item;
    if (artLabelEl) {
      artLabelEl.textContent = `${exhibits[activeExhibitIndex].numberLabel} · ${item?.game || 'HaKING'}`;
    }
  }

  function glideToExhibit(idx) {
    const targetIdx = ((idx % exhibits.length) + exhibits.length) % exhibits.length;
    const ex = exhibits[targetIdx];
    const dir = ex.lookTarget.clone().sub(ex.viewPos).normalize();
    const targetYaw = Math.atan2(-dir.x, -dir.z);
    const targetPitch = Math.asin(Math.max(-0.9, Math.min(0.9, dir.y)));
    updateArtCounter(targetIdx);

    if (reducedMotion) {
      player.x = ex.viewPos.x;
      player.z = ex.viewPos.z;
      player.yaw = targetYaw;
      player.pitch = targetPitch;
      glide = null;
      return;
    }

    glide = {
      startPos: new T.Vector3(player.x, PLAYER_EYE_Y, player.z),
      endPos: ex.viewPos.clone(),
      startYaw: player.yaw,
      endYaw: targetYaw,
      startPitch: player.pitch,
      endPitch: targetPitch,
      progress: 0,
      duration: 0.72
    };
  }

  function stopAutoTour() {
    if (!autoTour) return;
    autoTour = false;
    autoTourBtn?.setAttribute('aria-pressed', 'false');
    if (autoTourBtn) {
      const span = autoTourBtn.querySelector('span');
      if (span) span.textContent = c.museum_3d_autotour || 'Guided Tour';
    }
  }

  function shortestAngleLerp(a, b, t) {
    const diff = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return a + diff * t;
  }

  function clampPlayerPosition() {
    player.x = Math.max(-PLAYER_BOUND_X, Math.min(PLAYER_BOUND_X, player.x));
    player.z = Math.max(-PLAYER_BOUND_L, Math.min(PLAYER_BOUND_L, player.z));

    // Keep player smoothly outside the center pedestal stanchions (r = 2.25m)
    const distSq = player.x * player.x + player.z * player.z;
    const minRadius = 2.25;
    if (distSq > 0.0001 && distSq < minRadius * minRadius) {
      const dist = Math.sqrt(distSq);
      player.x = (player.x / dist) * minRadius;
      player.z = (player.z / dist) * minRadius;
    } else if (distSq <= 0.0001) {
      player.z = minRadius;
    }

    // Keep outside the two walnut benches
    for (const box of benchObstacles) {
      if (player.x > box.minX && player.x < box.maxX && player.z > box.minZ && player.z < box.maxZ) {
        const dzTop = Math.abs(player.z - box.minZ);
        const dzBot = Math.abs(box.maxZ - player.z);
        const dxLeft = Math.abs(player.x - box.minX);
        const dxRight = Math.abs(box.maxX - player.x);
        const minEdge = Math.min(dzTop, dzBot, dxLeft, dxRight);
        if (minEdge === dzTop) player.z = box.minZ;
        else if (minEdge === dzBot) player.z = box.maxZ;
        else if (minEdge === dxLeft) player.x = box.minX;
        else player.x = box.maxX;
      }
    }
  }

  function updateFocusTarget(ndcX = 0, ndcY = 0) {
    raycaster.setFromCamera(new T.Vector2(ndcX, ndcY), camera);
    const hits = raycaster.intersectObjects(artHitMeshes, false);
    const hit = hits.length && hits[0].distance < 13.5 ? hits[0].object.userData.exhibit : null;
    if (hit !== focusedExhibit) {
      if (focusedExhibit) {
        focusedExhibit.artMat.emissiveIntensity = 0;
        focusedExhibit.haloMat.opacity = 0.11;
      }
      focusedExhibit = hit;
      if (focusedExhibit) {
        focusedExhibit.artMat.emissiveIntensity = 0;
        focusedExhibit.haloMat.opacity = 0.21;
        if (targetTitle) {
          targetTitle.textContent = `№ ${focusedExhibit.numberLabel} · ${focusedExhibit.item?.game || ''}`;
        }
        if (targetPill) targetPill.hidden = false;
      } else if (targetPill) {
        targetPill.hidden = true;
      }
    }
    canvas.style.cursor = focusedExhibit && document.pointerLockElement !== canvas ? 'pointer' : 'grab';
  }

  function inspectExhibit(exhibit) {
    const target = exhibit || focusedExhibit || exhibits[activeExhibitIndex];
    if (!target?.item) return;
    stopAutoTour();
    clearInputs();
    returnToFpsAfterDialog = document.pointerLockElement === canvas;
    if (returnToFpsAfterDialog) document.exitPointerLock?.();
    onInspect(target.item);
  }

  // Event handlers (properly registered & cleaned up on close)
  const stopContextMenu = e => e.preventDefault();
  const onWindowBlur = () => clearInputs();
  const onVisibilityChange = () => { if (document.hidden) clearInputs(); };
  const onDialogClose = () => {
    returnToFpsAfterDialog = false;
    if (!disposed && !overlay.hidden && !isTouchProfile) {
      canvas.focus({ preventScroll: true });
    }
  };

  const onPointerDown = e => {
    if (document.pointerLockElement === canvas) {
      inspectExhibit();
      return;
    }
    isDragging = true;
    dragDistance = 0;
    lastPointer = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = e => {
    if (document.pointerLockElement === canvas) {
      player.yaw -= e.movementX * 0.0021;
      player.pitch = Math.max(-1.05, Math.min(1.05, player.pitch - e.movementY * 0.0021));
      stopAutoTour();
      glide = null;
      return;
    }
    if (isDragging) {
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      dragDistance += Math.hypot(dx, dy);
      player.yaw += dx * dragYawSens;
      player.pitch = Math.max(-1.05, Math.min(1.05, player.pitch + dy * dragPitchSens));
      if (dragDistance > 6) {
        stopAutoTour();
        glide = null;
      }
    } else if (e.pointerType === 'mouse') {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      updateFocusTarget(ndcX, ndcY);
    }
  };

  const onPointerUp = e => {
    if (!isDragging) return;
    isDragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    if (dragDistance < 6) {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      updateFocusTarget(ndcX, ndcY);
      if (focusedExhibit) inspectExhibit(focusedExhibit);
    }
  };

  const onKeyDown = e => {
    if (overlay.hidden) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const dialog = document.getElementById('gallery-dialog');
    if (dialog?.open) {
      if (e.code === 'KeyE' && !e.repeat) {
        e.preventDefault();
        const shouldRelock = returnToFpsAfterDialog;
        returnToFpsAfterDialog = false;
        dialog.close();
        canvas.focus({ preventScroll: true });
        if (shouldRelock) safeRequestPointerLock();
      }
      return;
    }

    const code = e.code;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(code)) {
      keysDown.add(code);
      stopAutoTour();
      glide = null;
    } else if (code === 'KeyE' && !e.repeat) {
      e.preventDefault();
      inspectExhibit();
    } else if (code === 'Enter' && !(document.activeElement instanceof HTMLButtonElement)) {
      e.preventDefault();
      inspectExhibit();
    } else if ((code === 'KeyQ' || code === 'BracketLeft') && !e.repeat) {
      e.preventDefault();
      loadWing(wingIndex - 1);
    } else if ((code === 'KeyR' || code === 'BracketRight') && !e.repeat) {
      e.preventDefault();
      loadWing(wingIndex + 1);
    } else if (code === 'KeyF' && !e.repeat && !isTouchProfile) {
      e.preventDefault();
      toggleFps();
    } else if (code === 'KeyT' && !e.repeat) {
      e.preventDefault();
      toggleAutoTour();
    } else if (code === 'Escape') {
      if (document.pointerLockElement === canvas) return;
      e.preventDefault();
      teardown();
    }
  };

  const onKeyUp = e => keysDown.delete(e.code);

  const onResize = () => {
    if (disposed) return;
    const w = stage.clientWidth || window.innerWidth;
    const h = Math.max(1, stage.clientHeight || window.innerHeight);
    camera.fov = fovForAspect(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const onPointerLockChange = () => {
    const locked = document.pointerLockElement === canvas;
    fpsBtn?.setAttribute('aria-pressed', String(locked));
  };

  const toggleAutoTour = () => {
    autoTour = !autoTour;
    autoTourBtn?.setAttribute('aria-pressed', String(autoTour));
    const span = autoTourBtn?.querySelector('span');
    if (span) {
      span.textContent = autoTour ? (c.museum_3d_pause || 'Pause') : (c.museum_3d_autotour || 'Guided Tour');
    }
    if (autoTour) {
      autoDwell = AUTO_DWELL_SECONDS;
      glideToExhibit(activeExhibitIndex);
    }
  };

  const toggleFps = () => {
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock?.();
    } else {
      safeRequestPointerLock();
    }
  };

  const onWingPrev = () => loadWing(wingIndex - 1);
  const onWingNext = () => loadWing(wingIndex + 1);
  const onArtPrev = () => { stopAutoTour(); glideToExhibit(activeExhibitIndex - 1); };
  const onArtNext = () => { stopAutoTour(); glideToExhibit(activeExhibitIndex + 1); };
  const onInspectBtn = () => inspectExhibit();
  const onClose = () => teardown();

  // Touch D-Pad hold buttons for mobile & tablet navigation (anti-callout + pointer capture)
  const padHandlers = [];
  for (const btn of padButtons) {
    const dirKey = btn.dataset.pad;
    const down = e => {
      e.preventDefault();
      e.stopPropagation();
      try { btn.setPointerCapture?.(e.pointerId); } catch { }
      touchMove[dirKey] = true;
      btn.classList.add('is-pressed');
      stopAutoTour();
      glide = null;
    };
    const up = e => {
      try {
        if (e?.pointerId !== undefined && btn.hasPointerCapture?.(e.pointerId)) {
          btn.releasePointerCapture(e.pointerId);
        }
      } catch { }
      touchMove[dirKey] = false;
      btn.classList.remove('is-pressed');
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', stopContextMenu);
    padHandlers.push([btn, down, up]);
  }

  overlay.addEventListener('contextmenu', stopContextMenu);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onResize);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  galleryDialog?.addEventListener('close', onDialogClose);
  autoTourBtn?.addEventListener('click', toggleAutoTour);
  fpsBtn?.addEventListener('click', toggleFps);
  wingPrevBtn?.addEventListener('click', onWingPrev);
  wingNextBtn?.addEventListener('click', onWingNext);
  artPrevBtn?.addEventListener('click', onArtPrev);
  artNextBtn?.addEventListener('click', onArtNext);
  targetPill?.addEventListener('click', onInspectBtn);
  inspectBtn?.addEventListener('click', onInspectBtn);
  closeBtn?.addEventListener('click', onClose);
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());

  function stepAnimation(now) {
    if (disposed) return;
    rafId = requestAnimationFrame(stepAnimation);
    if (document.hidden) {
      prevTime = now;
      return;
    }

    const realDt = Math.max(0.001, (now - prevTime) / 1000);
    const dt = Math.min(0.05, realDt);
    prevTime = now;
    const dialogOpen = document.getElementById('gallery-dialog')?.open;

    if (!dialogOpen) {
      if (autoTour && !glide) {
        autoDwell -= dt;
        if (autoDwell <= 0) {
          autoDwell = AUTO_DWELL_SECONDS;
          glideToExhibit(activeExhibitIndex + 1);
        }
      }

      if (glide) {
        glide.progress = Math.min(1, glide.progress + realDt / glide.duration);
        const s = glide.progress * glide.progress * (3 - 2 * glide.progress);
        player.x = glide.startPos.x + (glide.endPos.x - glide.startPos.x) * s;
        player.z = glide.startPos.z + (glide.endPos.z - glide.startPos.z) * s;
        player.yaw = shortestAngleLerp(glide.startYaw, glide.endYaw, s);
        player.pitch = glide.startPitch + (glide.endPitch - glide.startPitch) * s;
        if (glide.progress >= 1) glide = null;
      } else {
        let moveZ = 0;
        let moveX = 0;
        if (keysDown.has('KeyW') || keysDown.has('ArrowUp') || touchMove.forward) moveZ += 1;
        if (keysDown.has('KeyS') || keysDown.has('ArrowDown') || touchMove.back) moveZ -= 1;
        if (keysDown.has('KeyA') || touchMove.left) moveX -= 1;
        if (keysDown.has('KeyD') || touchMove.right) moveX += 1;
        if (keysDown.has('ArrowLeft')) player.yaw += 1.75 * dt;
        if (keysDown.has('ArrowRight')) player.yaw -= 1.75 * dt;

        if (moveX || moveZ) {
          const speed = (keysDown.has('ShiftLeft') || keysDown.has('ShiftRight')) ? 6.6 : baseWalkSpeed;
          const len = Math.hypot(moveX, moveZ) || 1;
          const forwardX = -Math.sin(player.yaw);
          const forwardZ = -Math.cos(player.yaw);
          const rightX = Math.cos(player.yaw);
          const rightZ = -Math.sin(player.yaw);
          player.x += ((forwardX * moveZ + rightX * moveX) / len) * speed * dt;
          player.z += ((forwardZ * moveZ + rightZ * moveX) / len) * speed * dt;
          clampPlayerPosition();
        }
      }
    }

    // Subtle organic motion on chandelier & centerpiece lighting
    if (!reducedMotion) {
      if (chandelierGroup) chandelierGroup.rotation.y = Math.sin(now * 0.00025) * 0.06;
      if (bustMesh) bustMesh.rotation.y = Math.sin(now * 0.0002) * 0.08;
    }

    camera.position.set(player.x, player.y, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');

    if (document.pointerLockElement === canvas) {
      updateFocusTarget(0, 0);
    }

    renderer.render(scene, camera);
  }

  function teardown() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(rafId);
    clearTimeout(wingFetchTimer);
    stopAutoTour();
    clearInputs();
    if (document.pointerLockElement === canvas) document.exitPointerLock?.();

    overlay.removeEventListener('contextmenu', stopContextMenu);
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('pointerlockchange', onPointerLockChange);
    galleryDialog?.removeEventListener('close', onDialogClose);
    autoTourBtn?.removeEventListener('click', toggleAutoTour);
    fpsBtn?.removeEventListener('click', toggleFps);
    wingPrevBtn?.removeEventListener('click', onWingPrev);
    wingNextBtn?.removeEventListener('click', onWingNext);
    artPrevBtn?.removeEventListener('click', onArtPrev);
    artNextBtn?.removeEventListener('click', onArtNext);
    targetPill?.removeEventListener('click', onInspectBtn);
    inspectBtn?.removeEventListener('click', onInspectBtn);
    closeBtn?.removeEventListener('click', onClose);
    for (const [btn, down, up] of padHandlers) {
      btn.removeEventListener('pointerdown', down);
      btn.removeEventListener('pointerup', up);
      btn.removeEventListener('pointercancel', up);
      btn.removeEventListener('lostpointercapture', up);
      btn.removeEventListener('contextmenu', stopContextMenu);
    }

    clearActiveArtTextures();
    disposableTextures.forEach(t => t?.dispose?.());
    disposableGeos.forEach(g => g?.dispose?.());
    disposableMats.forEach(m => m?.dispose?.());
    pmremRT?.dispose?.();
    floorReflector?.getRenderTarget?.()?.dispose?.();
    floorReflector?.dispose?.();
    renderer.dispose();

    stage.replaceChildren();
    delete overlay.dataset.inputMode;
    overlay.hidden = true;
    document.documentElement.classList.remove('museum-3d-active');
    returnFocusTo?.focus?.({ preventScroll: true });
  }

  // Expose wing 1 immediately and reveal the room once models + first render finish
  loadWing(0);
  if (loadingBar) loadingBar.style.width = '76%';
  await Promise.all(modelLoadJobs);
  if (disposed) return;

  if (loadingBar) loadingBar.style.width = '100%';
  camera.position.set(player.x, player.y, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  renderer.render(scene, camera);
  loadingEl.hidden = true;
  if (!isTouchProfile) canvas.focus({ preventScroll: true });
  rafId = requestAnimationFrame(stepAnimation);
}
