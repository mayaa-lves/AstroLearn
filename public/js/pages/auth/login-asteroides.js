// Rochas com volume irregular, textura mineral e iluminação fixa no cenário.
const dir=new URL('../../../assets/imagens/login/cenarios-e-personagens/',import.meta.url);
const image=n=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=new URL(n,dir)});
const rocks=[[693,75,43,65,-.44,1.23,.72],[650,304,34,73,.55,1.14,.85],[1035,803,50,90,-.29,1.26,.70],[1427,91,27,82,.38,1.22,.72],[1458,464,33,96,-.64,1.14,.85]];
const tau=2*Math.PI,unit=v=>{const l=Math.hypot(...v)||1;return v.map(k=>k/l)},sub=(a,b)=>a.map((n,i)=>n-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function geometry(seed,ax,ay){
 const pos=[],tri=[],norm=[];const N=22,M=14;
 function hash(a,b,c){let h=Math.sin(a*127.1+b*311.7+c*74.7+seed*41)*43758.5453;return h-Math.floor(h)}
 function noise(x,y,z,f){x=x*f+5;y=y*f+8;z=z*f+3;let i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),sum=0;x-=i;y-=j;z-=k;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)sum+=hash(i+a,j+b,k+c)*(a?x:1-x)*(b?y:1-y)*(c?z:1-z);return sum-.5}
 for(let j=0;j<=M;j++)for(let i=0;i<N;i++){
  const t=Math.PI*j/M,l=tau*i/N,x=Math.sin(t)*Math.cos(l),y=Math.cos(t),z=Math.sin(t)*Math.sin(l);
  const r=1+.62*noise(x,y,z,2.1)+.22*noise(x,y,z,4.1)-.16*Math.exp(-9*(x+.2)**2-5*(z-.65)**2);
  pos.push([ax*r*x+.16*y,ay*r*y+.12*x*x-.05,.8*r*z]);norm.push([0,0,0]);
 }
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N,c=a+N,d=b+N;for(const f of [[a,b,c],[b,d,c]]){let n=cross(sub(pos[f[1]],pos[f[0]]),sub(pos[f[2]],pos[f[0]]));if(Math.hypot(...n)<1e-8)continue;for(const k of f)for(let h=0;h<3;h++)norm[k][h]+=n[h];tri.push([f,unit(n)])}}
 return {pos,tri,norm:norm.map(unit),N,M};
}
Promise.all([image('asteroid-sky-clean.png'),image('asteroid-albedo-v2.png')]).then(([sky,tex])=>{
 const root=document.querySelector('.space-background');if(!root)return;
 const sheet=()=>{let c=document.createElement('canvas');c.className='scene-canvas';c.width=1672;c.height=941;c.setAttribute('aria-hidden','true');c.style.pointerEvents='none';root.append(c);return c};
 const plate=sheet(),canvas=sheet(),bg=plate.getContext('2d'),ctx=canvas.getContext('2d');const make=(w,h)=>{let c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const texture=make(512,256),tc=texture.getContext('2d');tc.drawImage(tex,0,0,512,256);const al=tc.getImageData(0,0,512,256).data;
 const parts=rocks.map(([x,y,r,period,tilt,ax,ay],i)=>{
  const pad=Math.ceil(r*1.65),tile=make(pad*2,pad*2),g=tile.getContext('2d');g.drawImage(sky,x-pad,y-pad,pad*2,pad*2,0,0,pad*2,pad*2);
  const m=g.createRadialGradient(pad,pad,r*1.25,pad,pad,pad);m.addColorStop(0,'#000');m.addColorStop(1,'transparent');g.globalCompositeOperation='destination-in';g.fillStyle=m;g.fillRect(0,0,pad*2,pad*2);bg.drawImage(tile,x-pad,y-pad);
  const size=Math.ceil(3.6*r*1.5),off=make(size,size),o=off.getContext('2d');return {x,y,r,period,tilt,i,size,off,o,mesh:geometry(i+2,ax,ay),im:o.createImageData(size,size),depth:new Float32Array(size*size)};
 });
 function paint(p,time){
  const {size,mesh,depth,im}=p,S=p.r*1.5, a=time*tau/p.period+p.i*.8,co=Math.cos(a),si=Math.sin(a),ct=Math.cos(p.tilt),st=Math.sin(p.tilt);
  function rot([x,y,z]){const xx=co*x+si*z;return [xx*ct-y*st,xx*st+y*ct,-si*x+co*z]}
  const v=mesh.pos.map(k=>{const [x,y,z]=rot(k);return [x*S+size/2,size/2-y*S,z]});
  const lighting=n=>Math.max(0,-.73*n[0]+.49*n[1]+.47*n[2]);const light=mesh.norm.map(n=>lighting(rot(n)));
  im.data.fill(0);depth.fill(-Infinity);
  for(const [indices,normal] of mesh.tri){let [ia,ib,ic]=indices;const A=v[ia],B=v[ib],C=v[ic];const denom=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(denom)<.01)continue;
   const face=lighting(rot(normal));let us=indices.map(k=>(k%mesh.N)/mesh.N);if(Math.max(...us)-Math.min(...us)>.5)us=us.map(u=>u<.5?u+1:u);const vs=indices.map(k=>Math.floor(k/mesh.N)/mesh.M);
   for(let y=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1])));y<=Math.min(size-1,Math.ceil(Math.max(A[1],B[1],C[1])));y++)for(let x=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0])));x<=Math.min(size-1,Math.ceil(Math.max(A[0],B[0],C[0])));x++){
    const u=((B[1]-C[1])*(x+.5-C[0])+(C[0]-B[0])*(y+.5-C[1]))/denom,w=((C[1]-A[1])*(x+.5-C[0])+(A[0]-C[0])*(y+.5-C[1]))/denom,h=1-u-w;if(Math.min(u,w,h)<0)continue;
    const z=u*A[2]+w*B[2]+h*C[2],idx=y*size+x;if(z<=depth[idx])continue;depth[idx]=z;
    const tx=Math.floor(512*((u*us[0]+w*us[1]+h*us[2]+p.i*.173)%1)),ty=Math.min(255,Math.floor(255*(u*vs[0]+w*vs[1]+h*vs[2]))),q=(ty*512+tx)*4;
    const t=(al[q]*.3+al[q+1]*.59+al[q+2]*.11)/140,L=.65*(u*light[ia]+w*light[ib]+h*light[ic])+.35*face,d=idx*4;
    im.data[d]=(79+149*L)*t;im.data[d+1]=(61+121*L)*t;im.data[d+2]=(84+90*L)*t;im.data[d+3]=255;
   }
  }p.o.putImageData(im,0,0);ctx.drawImage(p.off,p.x-size/3,p.y-size/3,size/1.5,size/1.5);
 }
 let elapsed=0,last=0,id=0;const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 function draw(){ctx.clearRect(0,0,1672,941);parts.forEach(p=>paint(p,elapsed))}
 function frame(now){if(!last||now-last>=55){elapsed+=last?Math.min(.2,(now-last)/1000):0;last=now;draw()}id=requestAnimationFrame(frame)}
 function sync(){cancelAnimationFrame(id);last=0;const hide=document.documentElement.dataset.visualStyle==='pixel';canvas.hidden=plate.hidden=hide;if(!hide&&!document.hidden&&!reduce.matches&&!document.body.classList.contains('motion-paused'))id=requestAnimationFrame(frame)}
 draw();sync();new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-visual-style']});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',()=>cancelAnimationFrame(id));window.addEventListener('pageshow',sync);
}).catch(()=>{});

import './login-rochas-pixel.js?v=2';
