/**
 * HP Victus 16-r1015nt — custom exterior study, in decimetres.
 * Product footprint: 36.9 × 25.94 cm. Not manufacturer CAD.
 * References and material/color notes: assets/models/victus/REFERENCES.md.
 */
export async function initVictus() {
  const host = document.getElementById('victus-stage');
  if (!host || host.dataset.modelReady) return;
  for (let i = 0; !window.THREE && i < 60; i++) await new Promise(resolve => setTimeout(resolve, 100));
  const T = window.THREE;
  if (!T) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { return; }
  host.dataset.modelReady = 'true';
  host.querySelector('.model-fallback').hidden = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .88;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  host.append(canvas);
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'HP Victus 16-r1015nt · 3D');
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, .1, 50);
  const defaultCameraPos = [4.5, 3.9, 6.7];
  const defaultLookTarget = [0, .77, -.12];
  const currentLook = new T.Vector3(...defaultLookTarget);
  let targetCam = null;
  let targetLook = null;
  camera.position.set(...defaultCameraPos);
  camera.lookAt(currentLook);

  const body = new T.Group();
  body.rotation.y = -.34;
  scene.add(body);

  // Three r128 does not automatically linearize CSS/hex material colors.
  // Without this conversion charcoal becomes pale grey after sRGB output.
  const color = value => new T.Color(value).convertSRGBToLinear();
  function material(value, roughness = .6, metalness = .03) {
    return new T.MeshStandardMaterial({ color: color(value), roughness, metalness });
  }
  const chassis = material('#242629', .76, .04);
  const lidMaterial = material('#222427', .78, .04);
  const touchpadMat = material('#212326', .70, .03);
  const trim = material('#2c2f34', .52, .06);
  const black = material('#090b0e', .86, .02);
  const rubber = material('#121417', .95, 0);
  const keys = material('#17191c', .78, .02);
  const steel = material('#5d6268', .35, .45);

  scene.add(new T.HemisphereLight(0xd2def0, 0x4a4c52, .42));
  const keyLight = new T.DirectionalLight(0xfff7ec, .90);
  keyLight.position.set(-3.5, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -.0004;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.bottom = -4;
  scene.add(keyLight);
  const fill = new T.DirectionalLight(0xd4e1ff, .38);
  fill.position.set(4.2, 2.0, 2.2);
  scene.add(fill);
  const rim = new T.DirectionalLight(0xeaf0fa, .62);
  rim.position.set(.4, 3.8, -5.2);
  scene.add(rim);
  // Gentle under/front studio bounce keeps rear lid and bottom grille legible during 360 inspection.
  const backBounce = new T.DirectionalLight(0xcad5e6, .34);
  backBounce.position.set(-1.8, -3.2, 3.8);
  scene.add(backBounce);

  function outline(w, d, r = .04) {
    const points = [];
    for (const [cx, cz, start] of [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, 90], [-w / 2 + r, -d / 2 + r, 180], [w / 2 - r, -d / 2 + r, 270]]) {
      for (let i = 0; i <= 6; i++) {
        const a = (start + i * 90 / 6) * Math.PI / 180;
        points.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
      }
    }
    return points;
  }
  function shell(layers, mat, parent = body) {
    const vertices = [], indices = [];
    const count = outline(layers[0][0], layers[0][1], layers[0][3]).length;
    layers.forEach(([w, d, y, r]) => outline(w, d, r).forEach(([x, z]) => vertices.push(x, y, z)));
    for (let k = 0; k < layers.length - 1; k++) {
      for (let i = 0; i < count; i++) {
        const j = (i + 1) % count, a = k * count + i, b = k * count + j, c = (k + 1) * count + j, e = (k + 1) * count + i;
        indices.push(a, e, b, b, e, c);
      }
    }
    const lo = vertices.length / 3; vertices.push(0, layers[0][2], 0);
    const hi = vertices.length / 3; vertices.push(0, layers.at(-1)[2], 0);
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      indices.push(lo, i, j);
      indices.push(hi, (layers.length - 1) * count + j, (layers.length - 1) * count + i);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new T.Mesh(geometry, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function rounded(w, h, d, mat, x, y, z, parent = body, r = .025) {
    r = Math.min(r, w / 3, d / 3);
    const mesh = shell([[w - .012, d - .012, -h / 2, r], [w, d, -h / 2 + .004, r], [w, d, h / 2 - .004, r], [w - .012, d - .012, h / 2, r]], mat, parent);
    mesh.position.set(x, y, z);
    return mesh;
  }
  function plane(w, h, mat, x, y, z, parent = body, rotation = 0) {
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.x = rotation;
    parent.add(mesh);
    return mesh;
  }
  function label(text, w, h, size = 48, fillColor = '#a5a6a8', background = null) {
    const ch = text.length > 6 ? 256 : 128;
    const scale = ch / 128;
    const cw = Math.max(ch, Math.round(ch * (w / Math.max(h, .01))));
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext('2d');
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, cw, ch); }
    ctx.fillStyle = fillColor;
    ctx.font = `600 ${size * scale}px system-ui, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (text === '↑↓') {
      ctx.font = `600 ${44 * scale}px system-ui, Arial, sans-serif`;
      ctx.fillText('↑', cw / 2, ch * .28);
      ctx.fillStyle = 'rgba(207, 212, 220, .24)';
      ctx.fillRect(cw * .18, ch * .5, cw * .64, 3 * scale);
      ctx.fillStyle = fillColor;
      ctx.fillText('↓', cw / 2, ch * .76);
    } else {
      ctx.fillText(text, cw / 2, ch / 2);
    }
    const texture = new T.CanvasTexture(c);
    texture.encoding = T.sRGBEncoding;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return new T.MeshBasicMaterial({ map: texture, transparent: !background, depthWrite: false, toneMapped: false });
  }

  // Tapered lower enclosure, subtle joint seam and one continuous palm-rest.
  shell([[3.50, 2.40, .012, .07], [3.65, 2.56, .065, .06], [3.69, 2.594, .155, .055]], chassis);
  rounded(3.68, .012, 2.584, trim, 0, .162, 0, body, .055);
  rounded(3.69, .028, 2.594, chassis, 0, .181, 0, body, .055);
  rounded(3.45, .009, 1.205, black, 0, .198, -.405, body, .03);

  // Full-size ISO-inspired key layout, with numeric pad and narrow function row.
  // Each legend canvas matches the keycap aspect ratio so legends stay crisp.
  const rowDefinitions = [
    [['esc', 1], ['f1', 1], ['f2', 1], ['f3', 1], ['f4', 1], ['f5', 1], ['f6', 1], ['f7', 1], ['f8', 1], ['f9', 1], ['f10', 1], ['f11', 1], ['f12', 1], ['ins', 1], ['del', 1]],
    [['"', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['*', 1], ['−', 1], ['backspace', 2]],
    [['tab', 1.5], ['Q', 1], ['W', 1], ['E', 1], ['R', 1], ['T', 1], ['Y', 1], ['U', 1], ['I', 1], ['O', 1], ['P', 1], ['Ğ', 1], ['Ü', 1], ['', 1.5]],
    [['caps', 1.75], ['A', 1], ['S', 1], ['D', 1], ['F', 1], ['G', 1], ['H', 1], ['J', 1], ['K', 1], ['L', 1], ['Ş', 1], ['İ', 1], [',', 1], ['↵', 1.25]],
    [['shift', 1.25], ['<', 1], ['Z', 1], ['X', 1], ['C', 1], ['V', 1], ['B', 1], ['N', 1], ['M', 1], ['Ö', 1], ['Ç', 1], ['.', 1], ['shift', 2.75]],
    [['ctrl', 1.25], ['fn', 1], ['⊞', 1], ['alt', 1.25], ['', 5], ['alt gr', 1.25], ['ctrl', 1.25], ['←', 1], ['↑↓', 1], ['→', 1]]
  ];
  const keyMaterials = new Map();
  function keycap(text, x, z, w, d = .151) {
    rounded(w, .022, d, keys, x, .217, z, body, .014);
    if (!text) return;
    const cacheKey = `${text}:${Math.round(w * 100)}:${Math.round(d * 100)}`;
    let m = keyMaterials.get(cacheKey);
    if (!m) {
      const size = text.length > 5 ? 28 : text.length > 2 ? 36 : text.length === 2 ? 44 : 58;
      m = label(text, w * .88, d * .77, size, '#cfd4dc');
      keyMaterials.set(cacheKey, m);
    }
    plane(w * .88, d * .77, m, x, .231, z, body, -Math.PI / 2);
  }
  const pitch = .178, left = -1.672;
  rowDefinitions.forEach((row, r) => {
    let x = left;
    const total = row.reduce((n, k) => n + k[1], 0);
    const unit = 2.67 / total;
    row.forEach(([text, units]) => {
      const width = units * unit - .014;
      keycap(text, x + width / 2, -.886 + r * .181, width, r === 0 ? .102 : .151);
      x += units * unit;
    });
  });
  // Slim top keys above the numeric pad, including the integrated power key.
  ['home', 'pg up', 'pg dn', '⏻'].forEach((text, c) => {
    keycap(text, 1.105 + c * pitch, -.886, .164, .102);
  });
  const pad = [['num', '/', '*', '−'], ['7', '8', '9', '+'], ['4', '5', '6', '+'], ['1', '2', '3', '↵'], ['0', '', '.', '↵']];
  pad.forEach((row, r) => row.forEach((text, c) => {
    if (!text) return;
    const wide = r === 4 && c === 0;
    keycap(text, 1.105 + c * pitch + (wide ? pitch / 2 : 0), -.705 + r * .181, wide ? .342 : .164);
  }));

  // Touchpad outline follows the left-of-centre keyboard without z-fighting.
  rounded(1.25, .004, .79, trim, -.33, .195, .735, body, .024);
  rounded(1.232, .005, .772, touchpadMat, -.33, .200, .735, body, .022);
  plane(.28, .06, label('HyperX', .28, .06, 56, '#90949a'), -1.48, .201, .31, body, -Math.PI / 2);

  // Hardware badges use standard lit surfaces so they match chassis lighting.
  function badge(text, bg, x) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#ffffff60'; ctx.strokeRect(4, 4, 120, 120);
    ctx.fillStyle = '#e8ecf0'; ctx.textAlign = 'center'; ctx.font = 'bold 23px Arial';
    text.split('|').forEach((line, i) => ctx.fillText(line, 64, 47 + i * 30));
    const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding;
    plane(.155, .155, new T.MeshStandardMaterial({ map: tex, roughness: .42, metalness: .06 }), x, .202, .97, body, -Math.PI / 2);
  }
  badge('intel|CORE i7', '#13527c', 1.36);
  badge('NVIDIA|GEFORCE', '#386719', 1.56);

  // Rear exhaust cavity, inset hinge blocks, and properly oriented rear brand text.
  rounded(3.53, .115, .055, black, 0, .108, -1.294, body, .015);
  for (let i = 0; i < 67; i++) rounded(.014, .084, .038, trim, -1.72 + i * .052, .108, -1.325, body, .002);
  for (const x of [-1.36, 1.36]) rounded(.35, .105, .28, trim, x, .204, -1.158, body, .025);
  rounded(2.25, .068, .18, chassis, 0, .198, -1.196, body, .015);
  const rearBrand = plane(.47, .07, label('V I C T U S', .47, .07, 68, '#8a9098'), 0, .15, -1.326, body, 0);
  rearBrand.rotation.y = Math.PI;

  const lid = new T.Group(); lid.position.set(0, .24, -1.12); lid.rotation.x = -.25; body.add(lid);
  const lidShell = rounded(3.69, .067, 2.355, lidMaterial, 0, 1.1775, 0, lid, .048);
  lidShell.rotation.x = Math.PI / 2;

  // Front face: restrained bezels, thicker chin, slim top camera housing.
  const front = new T.Group(); front.position.z = .037; lid.add(front);
  plane(3.604, 2.265, new T.MeshStandardMaterial({ color: color('#0d0e11'), roughness: .78 }), 0, 1.182, .002, front);
  const screenCanvas = document.createElement('canvas'); screenCanvas.width = 1920; screenCanvas.height = 1080;
  const sc = screenCanvas.getContext('2d');
    function drawScreenFallback() {
      const bg = sc.createLinearGradient(0, 0, 1920, 1080);
      bg.addColorStop(0, '#06111d'); bg.addColorStop(.5, '#102d45'); bg.addColorStop(1, '#090c15');
      sc.fillStyle = bg; sc.fillRect(0, 0, 1920, 1080);
      for (let i = 0; i < 18; i++) {
        sc.beginPath();
        sc.moveTo(-120, 1020 - i * 28);
        sc.bezierCurveTo(600, 830 - i * 18, 690, 70 + i * 11, 2040, 260 + i * 26);
        sc.strokeStyle = `rgba(${50 + i * 3},${110 + i * 4},${160 + i * 3},${.05 + i * .005})`;
        sc.lineWidth = 36;
        sc.stroke();
      }
      sc.fillStyle = '#e3edf2'; sc.textAlign = 'center'; sc.font = '500 84px Arial';
      sc.fillText('VICTUS', 960, 548);
      sc.font = '20px Arial'; sc.fillStyle = '#91b1c5';
      sc.fillText('BY HP', 960, 595);
    }
    drawScreenFallback();
    const screenTexture = new T.CanvasTexture(screenCanvas);
    screenTexture.encoding = T.sRGBEncoding;
    screenTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    plane(3.505, 1.972, new T.MeshBasicMaterial({ map: screenTexture, toneMapped: false }), 0, 1.249, .005, front);

    // Load owner's desktop wallpaper (`assets/images/walpaper.png`) onto the 16:9 panel with cover framing.
    const wallpaper = new Image();
    wallpaper.decoding = 'async';
    wallpaper.addEventListener('load', () => {
      const iw = wallpaper.naturalWidth || 1920;
      const ih = wallpaper.naturalHeight || 1024;
      const scale = Math.max(1920 / iw, 1080 / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      sc.clearRect(0, 0, 1920, 1080);
      sc.drawImage(wallpaper, (1920 - dw) / 2, (1080 - dh) / 2, dw, dh);
      const vignette = sc.createRadialGradient(960, 540, 620, 960, 540, 1180);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,.22)');
      sc.fillStyle = vignette;
      sc.fillRect(0, 0, 1920, 1080);
      screenTexture.needsUpdate = true;
      requestRender();
    });
    wallpaper.src = 'assets/images/walpaper.png';
    plane(.38, .073, label('V I C T U S', .38, .073, 64, '#7e848c'), 0, .105, .006, front);
    const lens = new T.Mesh(new T.CircleGeometry(.014, 16), new T.MeshBasicMaterial({ color: 0x101a22 }));
    lens.position.set(0, 2.285, .007); front.add(lens);
    const lensInner = new T.Mesh(new T.CircleGeometry(.006, 16), new T.MeshBasicMaterial({ color: 0x365569 }));
    lensInner.position.set(0, 2.285, .008); front.add(lensInner);
    for (const x of [-.084, .084]) {
      const mic = new T.Mesh(new T.CircleGeometry(.003, 8), black);
      mic.position.set(x, 2.285, .008); front.add(mic);
    }

    // Smoked dark-chrome V emblem remains clearly readable against the charcoal lid.
    const logoCanvas = document.createElement('canvas'); logoCanvas.width = 512; logoCanvas.height = 512;
    const lc = logoCanvas.getContext('2d');
    const logoGrad = lc.createLinearGradient(80, 110, 432, 400);
    logoGrad.addColorStop(0, '#808792');
    logoGrad.addColorStop(.5, '#596069');
    logoGrad.addColorStop(1, '#707782');
    lc.fillStyle = logoGrad;
    lc.beginPath();
    lc.moveTo(80, 110); lc.lineTo(256, 400); lc.lineTo(432, 110);
    lc.lineTo(350, 110); lc.lineTo(256, 260); lc.lineTo(162, 110);
    lc.closePath(); lc.fill();
    const logoTexture = new T.CanvasTexture(logoCanvas); logoTexture.encoding = T.sRGBEncoding;
    const logo = plane(.62, .62, new T.MeshStandardMaterial({ map: logoTexture, transparent: true, roughness: .28, metalness: .28 }), 0, 1.25, -.035, lid);
    logo.rotation.y = Math.PI;

    // Side ports are oriented into their actual side planes.
    function sidePort(side, z, w, h, kind) {
      const g = new T.Group(); g.position.set(side * 1.846, .115, z); g.rotation.y = side * Math.PI / 2; body.add(g);
      plane(w, h, new T.MeshBasicMaterial({ color: 0x050607 }), 0, 0, 0, g);
      if (kind === 'usb') { plane(w * .78, h * .18, steel, 0, -h * .12, .001, g); for (let i = 0; i < 4; i++) plane(.012, .01, trim, -w * .25 + i * w * .16, .008, .002, g); }
      if (kind === 'ethernet') { plane(w * .86, h * .25, trim, 0, -h * .40, .002, g); for (let i = 0; i < 8; i++) plane(.005, .025, steel, -w * .3 + i * w * .085, h * .1, .002, g); }
      if (kind === 'round') { const ring = new T.Mesh(new T.RingGeometry(h * .26, h * .43, 20), trim); ring.position.z = .003; g.add(ring); }
    }
    sidePort(-1, -.93, .17, .105, 'ethernet'); sidePort(-1, -.66, .145, .054, 'usb');
    for (let i = 0; i < 7; i++) sidePort(-1, -.37 + i * .085, .067, .065, 'vent');
    sidePort(-1, .61, .055, .055, 'round');
    sidePort(1, -1.04, .065, .065, 'round'); sidePort(1, -.78, .18, .06, 'hdmi'); sidePort(1, -.49, .145, .054, 'usb'); sidePort(1, -.23, .145, .054, 'usb'); sidePort(1, .04, .092, .035, 'usbc');

    // Bottom: dense intake field, rubber strips, screws and model plate.
    const grilleCanvas = document.createElement('canvas'); grilleCanvas.width = 2048; grilleCanvas.height = 1024;
    const gc = grilleCanvas.getContext('2d');
    for (let row = 0; row < 38; row++) for (let col = 0; col < 92; col++) {
      gc.fillStyle = '#0d0e11'; gc.fillRect(34 + col * 21, 32 + row * 25, 12, 13);
      gc.fillStyle = '#36393e'; gc.fillRect(34 + col * 21, 45 + row * 25, 12, 1);
    }
    const grilleTexture = new T.CanvasTexture(grilleCanvas); grilleTexture.encoding = T.sRGBEncoding;
    grilleTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    plane(3.03, 1.30, new T.MeshStandardMaterial({ map: grilleTexture, transparent: true, roughness: .88 }), 0, .009, -.46, body, Math.PI / 2);
    rounded(3.08, .033, .103, rubber, 0, -.008, -1.09, body, .03);
    rounded(3.08, .033, .103, rubber, 0, -.008, 1.08, body, .03);
    for (const x of [-1.61, 0, 1.61]) for (const z of [-1.12, 1.12]) {
      const screw = new T.Mesh(new T.CylinderGeometry(.018, .018, .004, 12), trim);
      screw.position.set(x, .007, z); body.add(screw);
      rounded(.019, .002, .003, steel, x, .004, z, body, .001);
    }
    plane(1.45, .22, label('VICTUS  ·  16-r1015nt', 1.45, .22, 52, '#8b9096'), 0, .008, .66, body, Math.PI / 2);

    // Soft contact shadow anchors the object rather than leaving a floating block.
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 256; shadowCanvas.height = 256;
    const sh = shadowCanvas.getContext('2d');
    const gradient = sh.createRadialGradient(128, 128, 12, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0,0,0,.42)'); gradient.addColorStop(.6, 'rgba(0,0,0,.22)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    sh.fillStyle = gradient; sh.fillRect(0, 0, 256, 256);
    const shadow = plane(5, 3.6, new T.MeshBasicMaterial({ map: new T.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }), 0, -.045, 0, scene, -Math.PI / 2);

    let target = [0, -.34, 0], drag = false, lastX = 0, lastY = 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    function setView(rot, camPos = defaultCameraPos, look = defaultLookTarget) {
      target = rot;
      targetCam = camPos;
      targetLook = look;
      if (reducedMotion.matches) {
        body.rotation.set(...rot);
        camera.position.set(...camPos);
        currentLook.set(...look);
        camera.lookAt(currentLook);
        target = null; targetCam = null; targetLook = null;
      }
      requestRender();
    }
    document.getElementById('model-front').onclick = () => setView([0, -.34, 0]);
    document.getElementById('model-back').onclick = () => setView([0, Math.PI - .3, 0]);
    document.getElementById('model-bottom').onclick = () => setView([-1.95, -.28, 0], [3.6, 3.4, 6.2], [0, -.1, .1]);
    document.getElementById('model-reset').onclick = () => {
      camera.zoom = 1; camera.updateProjectionMatrix();
      setView([0, -.34, 0]);
    };
    canvas.addEventListener('pointerdown', e => { target = null; targetCam = null; targetLook = null; drag = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', () => drag = false);
    canvas.addEventListener('pointercancel', () => drag = false);
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      body.rotation.y += (e.clientX - lastX) * .008;
      body.rotation.x = Math.max(-Math.PI, Math.min(Math.PI, body.rotation.x + (e.clientY - lastY) * .006));
      lastX = e.clientX; lastY = e.clientY;
      requestRender();
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      camera.zoom = Math.max(.75, Math.min(1.6, camera.zoom - e.deltaY * .001));
      camera.updateProjectionMatrix();
      requestRender();
    }, { passive: false });
    canvas.addEventListener('keydown', e => {
      if (!e.key.startsWith('Arrow')) return;
      e.preventDefault(); target = null; targetCam = null; targetLook = null;
      if (e.key === 'ArrowLeft') body.rotation.y -= .15;
      if (e.key === 'ArrowRight') body.rotation.y += .15;
      if (e.key === 'ArrowUp') body.rotation.x -= .12;
      if (e.key === 'ArrowDown') body.rotation.x += .12;
      requestRender();
    });
    let frameId = 0;
    function requestRender() { if (!frameId) frameId = requestAnimationFrame(render); }
    function render() {
      frameId = 0;
      if (document.hidden || !document.getElementById('machine').classList.contains('active')) return;
      let animating = false;
      if (target) {
        const dx = target[0] - body.rotation.x, dy = target[1] - body.rotation.y;
        body.rotation.x += dx * .12;
        body.rotation.y += dy * .12;
        if (Math.abs(dx) + Math.abs(dy) < .001) { body.rotation.x = target[0]; body.rotation.y = target[1]; target = null; }
        else animating = true;
      }
      if (targetCam && targetLook) {
        camera.position.x += (targetCam[0] - camera.position.x) * .12;
        camera.position.y += (targetCam[1] - camera.position.y) * .12;
        camera.position.z += (targetCam[2] - camera.position.z) * .12;
        currentLook.x += (targetLook[0] - currentLook.x) * .12;
        currentLook.y += (targetLook[1] - currentLook.y) * .12;
        currentLook.z += (targetLook[2] - currentLook.z) * .12;
        camera.lookAt(currentLook);
        if (camera.position.distanceTo(new T.Vector3(...targetCam)) + currentLook.distanceTo(new T.Vector3(...targetLook)) < .005) {
          camera.position.set(...targetCam); currentLook.set(...targetLook); camera.lookAt(currentLook);
          targetCam = null; targetLook = null;
        } else {
          animating = true;
        }
      }
      if (animating) requestRender();
      shadow.visible = Math.abs(body.rotation.x) < .5;
      renderer.render(scene, camera);
    }
    new ResizeObserver(() => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); requestRender();
    }).observe(host);
    new MutationObserver(requestRender).observe(document.getElementById('machine'), { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', requestRender);
    requestRender();
  }
