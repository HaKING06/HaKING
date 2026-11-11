// Dimensionally informed Victus 16 visualization. Hand-built geometry, not an HP CAD asset.
export async function initVictus(){
 const host=document.getElementById('victus-stage');
 for(let i=0;!window.THREE&&i<60;i++)await new Promise(r=>setTimeout(r,100));
 const T=window.THREE;if(!T)return;
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{return;}
 host.querySelector('.model-fallback').hidden=true;
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(5,4.8,7);camera.lookAt(0,.6,0);
 scene.add(new T.HemisphereLight(0xd9e9ff,0x282024,.65));
 for(const [color,power,x,y,z] of [[0xffffff,1.2,3,6,4],[0x93bbff,.6,-4,3,-2],[0xf3bd63,.5,4,2,-4]]){const l=new T.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);}
 const body=new T.Group();scene.add(body);body.rotation.y=-.28;
 const metal=new T.MeshStandardMaterial({color:0x252a30,metalness:.75,roughness:.32});
 const edge=new T.MeshStandardMaterial({color:0x515862,metalness:.85,roughness:.27});
 const dark=new T.MeshStandardMaterial({color:0x080a0d,roughness:.65});
 const keymat=new T.MeshStandardMaterial({color:0x20252c,roughness:.55});
 function box(w,h,d,mat,x,y,z,parent=body){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;}
 // 36.9 x 25.9 cm footprint, distinct bevel-like stepped edges.
 box(4.36,.12,3.05,edge,0,.04,0);box(4.4,.10,3.08,metal,0,.12,0);box(4.28,.05,2.98,metal,0,.2,0);
 box(1.25,.008,.76,edge,-.25,.231,.92);box(1.21,.01,.72,metal,-.25,.237,.92);
 for(let row=0;row<6;row++)for(let col=0;col<19;col++){
 const w=col===18?.15:.183;box(w,.022,.153,keymat,-1.97+col*.218,.244,-.83+row*.205);
 }
 box(1.15,.025,.14,keymat,-.35,.248,.2);
 // White keyboard legends, speaker perforations, stickers and lateral ports.
 const kc=document.createElement('canvas');kc.width=2048;kc.height=1024;const k=kc.getContext('2d');k.clearRect(0,0,2048,1024);k.fillStyle='#dce3e9';k.font='20px monospace';
 const rows=['ESC  F1  F2  F3  F4  F5  F6  F7  F8  F9  F10 F11 F12  DEL','`1234567890-=←789/','TABQWERTYUIOP[]456*','CAPSASDFGHJKL;↵123-','SHIFTZXCVBNM,./↑0+','CTRL FN WIN ALT            ALT CTRL ← ↓ →'];
 rows.forEach((r,y)=>[...r].forEach((c,x)=>k.fillText(c,35+x*103,60+y*148)));
 const kt=new T.CanvasTexture(kc),km=new T.MeshBasicMaterial({map:kt,transparent:true});const kp=new T.Mesh(new T.PlaneGeometry(4.08,1.2),km);kp.rotation.x=-Math.PI/2;kp.position.set(0,.26,-.32);body.add(kp);
 for(let i=0;i<58;i++)box(.027,.005,.09,dark,-2+i*.07,.233,-1.22);
 for(const side of [-1,1]){for(let i=0;i<13;i++)box(.01,.045,.045,dark,side*2.205,.12,-1.15+i*.06);for(let i=0;i<3;i++)box(.012,.055,.21,dark,side*2.207,.12,-.1+i*.4);}
 const sticker=new T.MeshStandardMaterial({color:0x76b900,roughness:.5});box(.22,.006,.15,sticker,1.8,.233,1.1);box(.22,.006,.15,new T.MeshStandardMaterial({color:0x1268b0}),1.5,.233,1.1);
 for(const x of [-1.55,1.55]){const hinge=new T.Mesh(new T.CylinderGeometry(.085,.085,.5,24),edge);hinge.rotation.z=Math.PI/2;hinge.position.set(x,.23,-1.4);body.add(hinge);}
 const lid=new T.Group();lid.position.set(0,.23,-1.4);lid.rotation.x=-.17;body.add(lid);
 box(4.4,2.8,.1,metal,0,1.4,0,lid);box(4.32,2.72,.015,dark,0,1.4,.06,lid);
 const screen=document.createElement('canvas');screen.width=1920;screen.height=1080;const ctx=screen.getContext('2d');
 function paint(image){const g=ctx.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'#081523');g.addColorStop(.6,'#15151f');g.addColorStop(1,'#683e24');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);if(image){ctx.globalAlpha=.5;ctx.drawImage(image,0,0,1920,1080);ctx.globalAlpha=1;}ctx.fillStyle='#f3bd63';ctx.font='bold 130px sans-serif';ctx.textAlign='center';ctx.fillText('HaKING',960,540);ctx.font='25px monospace';ctx.fillStyle='#ffffff';ctx.fillText('VICTUS  /  RTX 4070  /  144 Hz',960,615);}
 paint();const texture=new T.CanvasTexture(screen);texture.encoding=T.sRGBEncoding;
 const display=new T.Mesh(new T.PlaneGeometry(4.1,2.306),new T.MeshBasicMaterial({map:texture}));display.position.set(0,1.47,.072);lid.add(display);
 const wallpaper=new Image();wallpaper.onload=()=>{paint(wallpaper);texture.needsUpdate=true;};wallpaper.src='assets/images/HaKING2.png';
 const webcam=new T.Mesh(new T.SphereGeometry(.018,12,12),new T.MeshStandardMaterial({color:0x163348,metalness:.8,roughness:.1}));webcam.position.set(0,2.72,.079);lid.add(webcam);
 const logo=document.createElement('canvas');logo.width=512;logo.height=128;const lc=logo.getContext('2d');lc.fillStyle='#adb5c1';lc.font='32px sans-serif';lc.textAlign='center';lc.fillText('V I C T U S',256,75);const lm=new T.MeshBasicMaterial({map:new T.CanvasTexture(logo),transparent:true});const lp=new T.Mesh(new T.PlaneGeometry(.65,.16),lm);lp.position.set(0,.14,.079);lid.add(lp);
 // Back-lid V emblem remains visible when the viewer rotates the chassis.
 const vc=document.createElement('canvas');vc.width=256;vc.height=256;const v=vc.getContext('2d');v.fillStyle='#9da7b9';v.beginPath();v.moveTo(40,60);v.lineTo(128,200);v.lineTo(216,60);v.lineTo(176,60);v.lineTo(128,140);v.lineTo(80,60);v.fill();const vl=new T.Mesh(new T.PlaneGeometry(.6,.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(vc),transparent:true}));vl.rotation.y=Math.PI;vl.position.set(0,1.5,-.057);lid.add(vl);
 let drag=false,lastX=0,lastY=0,pitch=0;const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','HP Victus 16 interactive 3D model');
 canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);canvas.addEventListener('pointermove',e=>{if(!drag)return;body.rotation.y+=(e.clientX-lastX)*.009;pitch=Math.max(-.25,Math.min(.55,pitch+(e.clientY-lastY)*.005));body.rotation.x=pitch;lastX=e.clientX;lastY=e.clientY;});
 canvas.addEventListener('wheel',e=>{e.preventDefault();camera.zoom=Math.max(.75,Math.min(1.6,camera.zoom-e.deltaY*.001));camera.updateProjectionMatrix();},{passive:false});
 canvas.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')body.rotation.y-=.15;if(e.key==='ArrowRight')body.rotation.y+=.15;if(e.key==='ArrowUp')body.rotation.x=Math.max(-.25,body.rotation.x-.1);if(e.key==='ArrowDown')body.rotation.x=Math.min(.55,body.rotation.x+.1);}});
 document.getElementById('model-reset').addEventListener('click',()=>{body.rotation.set(0,-.28,0);pitch=0;camera.zoom=1;camera.updateProjectionMatrix();});
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(host);
 function frame(){requestAnimationFrame(frame);if(document.getElementById('machine').classList.contains('active')&&!document.hidden)renderer.render(scene,camera);}frame();
}
