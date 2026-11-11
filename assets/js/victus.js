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
 const metal=new T.MeshStandardMaterial({color:0x202329,metalness:.18,roughness:.43});
 const edge=new T.MeshStandardMaterial({color:0x393d44,metalness:.35,roughness:.36});
 const dark=new T.MeshStandardMaterial({color:0x080a0d,roughness:.65});
 const keymat=new T.MeshStandardMaterial({color:0x20252c,roughness:.55});
 function box(w,h,d,mat,x,y,z,parent=body){const radius=Math.min(.045,w*.12,d*.12);const shape=new T.Shape();shape.moveTo(-w/2+radius,-d/2);shape.lineTo(w/2-radius,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+radius);shape.lineTo(w/2,d/2-radius);shape.quadraticCurveTo(w/2,d/2,w/2-radius,d/2);shape.lineTo(-w/2+radius,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-radius);shape.lineTo(-w/2,-d/2+radius);shape.quadraticCurveTo(-w/2,-d/2,-w/2+radius,-d/2);const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1,curveSegments:4});geo.rotateX(-Math.PI/2);geo.translate(0,-h/2,0);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}

 // 36.9 x 25.9 cm footprint, distinct bevel-like stepped edges.
 box(4.36,.12,3.05,edge,0,.04,0);box(4.4,.10,3.08,metal,0,.12,0);box(4.28,.05,2.98,metal,0,.2,0);
 box(1.25,.008,.76,edge,-.25,.231,.92);box(1.21,.01,.72,metal,-.25,.237,.92);
 // Individual sculpted keycaps with per-key legends; full-size layout and separate numpad.
 const layout=[['esc','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12','del'],['~','1','2','3','4','5','6','7','8','9','0','−','=','←'],['tab','Q','W','E','R','T','Y','U','I','O','P','[',']'],['caps','A','S','D','F','G','H','J','K','L',';',"'",'↵'],['shift','Z','X','C','V','B','N','M',',','.','/','↑','shift'],['ctrl','fn','win','alt','space','alt','ctrl','←','↓','→']];
 const legends=new Map();
 function key(label,x,z,w=.204){box(w,.027,.167,keymat,x,.249,z);let material=legends.get(label);if(!material){const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#181b20';ctx.fillRect(0,0,128,64);ctx.fillStyle='#c9ccd1';ctx.font=label.length>2?'18px sans-serif':'24px sans-serif';ctx.textAlign='center';ctx.fillText(label,64,42);material=new T.MeshBasicMaterial({map:new T.CanvasTexture(c)});legends.set(label,material);}const face=new T.Mesh(new T.PlaneGeometry(w*.84,.125),material);face.rotation.x=-Math.PI/2;face.position.set(x,.265,z);body.add(face);}
 layout.forEach((row,r)=>{let x=-1.94;row.forEach(label=>{const w=label==='space'?1.18:label==='shift'?.31:.204;key(label,x+w/2,-.86+r*.207,w);x+=w+.025;});});
 [['num','/','*','−'],['7','8','9','+'],['4','5','6','+'],['1','2','3','↵'],['0','0','.','↵']].forEach((row,r)=>row.forEach((label,c)=>key(label,1.24+c*.23,-.65+r*.207,.193)));
 for(let i=0;i<58;i++)box(.027,.005,.09,dark,-2+i*.07,.233,-1.22);
 for(const side of [-1,1]){for(let i=0;i<13;i++)box(.01,.045,.045,dark,side*2.205,.12,-1.15+i*.06);for(let i=0;i<3;i++)box(.012,.055,.21,dark,side*2.207,.12,-.1+i*.4);}
 const sticker=new T.MeshStandardMaterial({color:0x76b900,roughness:.5});box(.22,.006,.15,sticker,1.8,.233,1.1);box(.22,.006,.15,new T.MeshStandardMaterial({color:0x1268b0}),1.5,.233,1.1);
 for(const x of [-1.55,1.55]){const hinge=new T.Mesh(new T.CylinderGeometry(.085,.085,.5,24),edge);hinge.rotation.z=Math.PI/2;hinge.position.set(x,.23,-1.4);body.add(hinge);}
 const lid=new T.Group();lid.position.set(0,.23,-1.4);lid.rotation.x=-.17;body.add(lid);
 box(4.4,2.8,.1,metal,0,1.4,0,lid);box(4.32,2.72,.015,dark,0,1.4,.06,lid);
 const screen=document.createElement('canvas');screen.width=1920;screen.height=1080;const ctx=screen.getContext('2d');
 function paint(image){const g=ctx.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'#081523');g.addColorStop(.6,'#15151f');g.addColorStop(1,'#683e24');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);if(image){ctx.globalAlpha=.5;ctx.drawImage(image,0,0,1920,1080);ctx.globalAlpha=1;}ctx.fillStyle='#f3bd63';ctx.font='bold 130px sans-serif';ctx.textAlign='center';ctx.fillText('VICTUS',960,540);ctx.font='25px monospace';ctx.fillStyle='#ffffff';ctx.fillText('VICTUS  /  RTX 4070  /  144 Hz',960,615);}
 paint();const texture=new T.CanvasTexture(screen);texture.encoding=T.sRGBEncoding;
 const display=new T.Mesh(new T.PlaneGeometry(4.1,2.306),new T.MeshBasicMaterial({map:texture}));display.position.set(0,1.47,.072);lid.add(display);
 const wallpaper=new Image();wallpaper.onload=()=>{paint(wallpaper);texture.needsUpdate=true;};// Neutral studio screen preserves the product silhouette.
 const webcam=new T.Mesh(new T.SphereGeometry(.018,12,12),new T.MeshStandardMaterial({color:0x163348,metalness:.8,roughness:.1}));webcam.position.set(0,2.72,.079);lid.add(webcam);
 const logo=document.createElement('canvas');logo.width=512;logo.height=128;const lc=logo.getContext('2d');lc.fillStyle='#adb5c1';lc.font='32px sans-serif';lc.textAlign='center';lc.fillText('V I C T U S',256,75);const lm=new T.MeshBasicMaterial({map:new T.CanvasTexture(logo),transparent:true});const lp=new T.Mesh(new T.PlaneGeometry(.65,.16),lm);lp.position.set(0,.14,.079);lid.add(lp);
 // Back-lid V emblem remains visible when the viewer rotates the chassis.
 const vc=document.createElement('canvas');vc.width=256;vc.height=256;const v=vc.getContext('2d');v.fillStyle='#9da7b9';v.beginPath();v.moveTo(40,60);v.lineTo(128,200);v.lineTo(216,60);v.lineTo(176,60);v.lineTo(128,140);v.lineTo(80,60);v.fill();const vl=new T.Mesh(new T.PlaneGeometry(.6,.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(vc),transparent:true}));vl.rotation.y=Math.PI;vl.position.set(0,1.5,-.057);lid.add(vl);
 const fans=[];
 for(const x of [-1.28,1.28]){
  const fan=new T.Group();fan.position.set(x,-.026,-.65);body.add(fan);fans.push(fan);
  const ring=new T.Mesh(new T.TorusGeometry(.49,.035,8,48),edge);ring.rotation.x=Math.PI/2;fan.add(ring);
  const disk=new T.Mesh(new T.CylinderGeometry(.46,.46,.015,48),dark);fan.add(disk);
  for(let i=0;i<37;i++){const blade=box(.035,.016,.32,edge,Math.sin(i/37*Math.PI*2)*.26,0,Math.cos(i/37*Math.PI*2)*.26,fan);blade.rotation.y=i/37*Math.PI*2+.45;}
  const hub=new T.Mesh(new T.CylinderGeometry(.12,.12,.025,24),keymat);hub.position.y=-.018;fan.add(hub);
  // Fine intake grille above the fan assembly.
  for(let i=-7;i<=7;i++){const len=Math.sqrt(Math.max(0,.48*.48-(i*.06)**2))*2;box(len,.008,.014,metal,x,-.055,-.65+i*.06);}
 }
 for(const x of [-1.85,1.85])for(const z of [-1.18,1.17])box(.35,.04,.11,dark,x,-.055,z);
 for(const x of [-1.95,0,1.95])for(const z of [-1.28,1.28]){const screw=new T.Mesh(new T.CylinderGeometry(.023,.023,.008,12),edge);screw.position.set(x,-.027,z);body.add(screw);}
 for(let i=0;i<64;i++)box(.025,.06,.045,dark,-2+i*.063,.12,-1.548);
 let targetView=null;
 document.getElementById('model-front').addEventListener('click',()=>targetView=[0,-.28,0]);
 document.getElementById('model-back').addEventListener('click',()=>targetView=[0,Math.PI-.25,0]);
 document.getElementById('model-bottom').addEventListener('click',()=>targetView=[2.3,0,0]);
 let drag=false,lastX=0,lastY=0,pitch=0;const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','HP Victus 16 interactive 3D model');
 canvas.addEventListener('pointerdown',e=>{targetView=null;drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);canvas.addEventListener('pointermove',e=>{if(!drag)return;body.rotation.y+=(e.clientX-lastX)*.009;pitch=Math.max(-2.7,Math.min(2.7,pitch+(e.clientY-lastY)*.005));body.rotation.x=pitch;lastX=e.clientX;lastY=e.clientY;});
 canvas.addEventListener('wheel',e=>{e.preventDefault();camera.zoom=Math.max(.75,Math.min(1.6,camera.zoom-e.deltaY*.001));camera.updateProjectionMatrix();},{passive:false});
 canvas.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')body.rotation.y-=.15;if(e.key==='ArrowRight')body.rotation.y+=.15;if(e.key==='ArrowUp')body.rotation.x=Math.max(-.25,body.rotation.x-.1);if(e.key==='ArrowDown')body.rotation.x=Math.min(.55,body.rotation.x+.1);}});
 document.getElementById('model-reset').addEventListener('click',()=>{targetView=[0,-.28,0];pitch=0;camera.zoom=1;camera.updateProjectionMatrix();});
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(host);
 function frame(){requestAnimationFrame(frame);if(targetView){body.rotation.x+=(targetView[0]-body.rotation.x)*.08;body.rotation.y+=(targetView[1]-body.rotation.y)*.08;}fans.forEach(f=>f.rotation.y+=.008);if(document.getElementById('machine').classList.contains('active')&&!document.hidden)renderer.render(scene,camera);}frame();
}
