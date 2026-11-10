// Move apenas as crateras da ilustração; a silhueta, a luz e o céu vêm do cenário.
const sky=new Image();sky.src=new URL('../../../assets/imagens/login/pixel/scene.webp',import.meta.url);await sky.decode();
const root=document.querySelector('.space-background'),layer=document.createElement('canvas');
layer.width=sky.width;layer.height=sky.height;layer.className='scene-canvas';
layer.style.cssText='pointer-events:none;image-rendering:pixelated';layer.setAttribute('aria-hidden','true');
const g=layer.getContext('2d');root.append(layer);
const TAU=2*Math.PI, clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
const parts=[[718,81,46,47,68],[666,309,34,33,76],[1062,812,49,47,88],[1395,92,24,24,70],[1467,488,30,29,82],[690,578,14,14,62],[932,583,13,13,73],[704,171,11,12,69]].map(([x,y,rx,ry,period])=>{
 const w=2*rx+1,h=2*ry+1,c=document.createElement('canvas');c.width=w;c.height=h;const k=c.getContext('2d');k.drawImage(sky,x-rx,y-ry,w,h,0,0,w,h);
 const src=k.getImageData(0,0,w,h).data,im=k.createImageData(w,h),detail=new Float32Array(w*h),samples=[];const lum=i=>.299*src[i]+.587*src[i+1]+.114*src[i+2];
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const a=(i-rx)/rx,b=(j-ry)/ry,r=Math.hypot(a,b);if(r>=.96)continue;
  let sum=0,n=0;const d=Math.max(2,Math.round(rx*.14));
  for(let v=-d;v<=d;v+=2)for(let u=-d;u<=d;u+=2){const ii=i+u,jj=j+v;if(Math.hypot((ii-rx)/rx,(jj-ry)/ry)<.96){sum+=lum(4*(jj*w+ii));n++}}
  const h0=Math.sqrt(1-b*b)*rx,idx=j*w+i;
  detail[idx]=lum(idx*4)-sum/Math.max(1,n);
  samples.push([idx,j*w,Math.asin(clamp((i-rx)/h0,-1,1)),h0,clamp((.96-r)/.14,0,1)]);
 }
 return {x:x-rx,y:y-ry,rx,period,w,k,c,src,im,detail,samples}
});
function draw(time){for(const p of parts){
 const angle=time*TAU/p.period;
 for(const [idx,row,lon,span,edge] of p.samples){
  const j=row+clamp(Math.round(p.rx+span*Math.sin(lon-angle)),0,p.w-1),d=4*idx;
  const diff=(p.detail[j]-p.detail[idx])*.87;
  for(let col=0;col<3;col++)p.im.data[d+col]=p.src[d+col]+diff;
  p.im.data[d+3]=255*edge;
 }
 p.k.putImageData(p.im,0,0);g.clearRect(p.x,p.y,p.w,p.c.height);g.drawImage(p.c,p.x,p.y);
}}
let t=0,last=null,id;const reduce=matchMedia('(prefers-reduced-motion:reduce)');
function frame(now){if(last===null||now-last>=100){t+=last===null?0:Math.min(.2,(now-last)/1000);last=now;draw(t)}id=requestAnimationFrame(frame)}
function sync(){cancelAnimationFrame(id);last=null;layer.hidden=document.documentElement.dataset.visualStyle!=='pixel';layer.style.display=layer.hidden?'none':'block';if(!layer.hidden&&!document.hidden&&!reduce.matches&&!document.body.classList.contains('motion-paused'))id=requestAnimationFrame(frame)}
new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-visual-style']});new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
