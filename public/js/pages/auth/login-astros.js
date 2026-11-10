// Projeção esférica em Canvas 2D: funciona também sem aceleração WebGL.
function sphere(host,src,period){
 const large=host.classList.contains('axis-globe');const size=large?480:128;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;host.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});const output=ctx.createImageData(size,size);
 const u=new Float32Array(size*size),v=new Float32Array(size*size),light=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x,nx=(x+.5)/size*2-1,ny=1-(y+.5)/size*2,r=nx*nx+ny*ny;
  if(r>=1)continue;const nz=Math.sqrt(1-r);u[i]=Math.atan2(nx,nz)/(Math.PI*2);v[i]=.5-Math.asin(ny)/Math.PI;
  light[i]=.6+.4*Math.max(0,(-.45*nx+.45*ny+nz)/1.185);output.data[i*4+3]=Math.min(255,(1-r)*size*255/2);
 }
 let pixels,angle=.15,last=0,lastPaint=0;const img=new Image();
 function draw(){if(!pixels)return;const data=output.data;
  for(let i=0;i<u.length;i++){if(!data[i*4+3])continue;let longitude=((u[i]+angle)%1+1)%1;longitude=1-Math.abs(longitude*2-1);
   const sx=Math.min(1023,Math.floor((.22+longitude*.56)*1024)),sy=Math.min(1023,Math.floor((.12+v[i]*.76)*1024)),s=(sy*1024+sx)*4,d=i*4;
   data[d]=pixels[s]*light[i];data[d+1]=pixels[s+1]*light[i];data[d+2]=pixels[s+2]*light[i];
  }ctx.putImageData(output,0,0);canvas.dataset.longitude=angle.toFixed(5);
 }
 img.onload=()=>{const texture=document.createElement('canvas');texture.width=texture.height=1024;const t=texture.getContext('2d');t.drawImage(img,0,0,1024,1024);pixels=t.getImageData(0,0,1024,1024).data;draw();};img.src=src;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function frame(now){const delta=last?Math.min(100,now-last):0;last=now;
  if(pixels&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-paused')){angle+=delta/(period*1000);if(now-lastPaint>65){draw();lastPaint=now;}}
  requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}
const root='../public/assets/imagens/login/cenarios-e-personagens/';
document.querySelectorAll('.axis-globe').forEach(e=>sphere(e,root+'planet.png',65));
document.querySelectorAll('.ambient-body').forEach((e,i)=>sphere(e,root+'asteroid-layer-v22.png',28+i*8));
