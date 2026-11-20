(() => {
  "use strict";
  const canvas = document.getElementById("gamesController");
  const context = canvas?.getContext("2d");
  if (!context) return;
  const mesh = [];
  const textures = { front: null, back: null };
  const scriptURL = document.currentScript.src;

  function loadTexture(side, filename) {
    const image = new Image();
    image.onload = () => {
      const surface = document.createElement("canvas");
      surface.width = Math.min(768, image.naturalWidth);
      surface.height = Math.round(surface.width * image.naturalHeight / image.naturalWidth);
      const painter = surface.getContext("2d", { willReadFrequently: true });
      if (!painter) return;
      painter.drawImage(image, 0, 0, surface.width, surface.height);
      const pixels = painter.getImageData(0, 0, surface.width, surface.height);
      textures[side] = { width: surface.width, height: surface.height, pixels: pixels.data };
      sync();
    };
    image.src = new URL("../../../assets/imagens/professor/" + filename, scriptURL).href;
  }
  const cream = [239, 220, 216];
  const purple = [132, 76, 181];
  const dark = [76, 43, 108];

  function face(points, color) { mesh.push({ points, color }); }

  function curve(start, segments) {
    const points = [start];
    let previous = start;
    for (const [a, b, end] of segments) {
      for (let step = 1; step <= 10; step++) {
        const t = step / 10, u = 1 - t;
        points.push([0, 1].map(axis =>
          u ** 3 * previous[axis] + 3 * u ** 2 * t * a[axis] +
          3 * u * t ** 2 * b[axis] + t ** 3 * end[axis]));
      }
      previous = end;
    }
    points.pop();
    return points;
  }

  function shell(outline, rings, frontColor, backColor) {
    const loops = rings.map(([scale, z]) => outline.map(([x, y]) => [x * scale, y * scale, z]));
    face([...loops[0]].reverse(), backColor);
    for (let ring = 1; ring < loops.length; ring++) {
      for (let index = 0; index < outline.length; index++) {
        const next = (index + 1) % outline.length;
        face([loops[ring - 1][index], loops[ring - 1][next], loops[ring][next], loops[ring][index]], frontColor);
      }
    }
    face(loops.at(-1), frontColor);
  }

  function cylinder(x, y, radius, bottom, top, color, capColor = color) {
    const front = [], back = [];
    for (let index = 0; index < 28; index++) {
      const angle = index * Math.PI * 2 / 28;
      const px = x + Math.cos(angle) * radius, py = y + Math.sin(angle) * radius;
      front.push([px, py, top]);
      back.push([px, py, bottom]);
    }
    face([...back].reverse(), color);
    for (let index = 0; index < front.length; index++) {
      const next = (index + 1) % front.length;
      face([back[index], back[next], front[next], front[index]], color);
    }
    face(front, capColor);
  }

  const outline = curve([-1.08, .73], [
    [[-.6, .86], [.6, .86], [1.08, .73]],
    [[1.48, .67], [1.63, -.1], [1.7, -.73]],
    [[1.74, -1.08], [1.42, -1.23], [1.19, -.92]],
    [[.98, -.69], [.91, -.43], [.76, -.4]],
    [[.3, -.34], [-.3, -.34], [-.76, -.4]],
    [[-.91, -.43], [-.98, -.69], [-1.19, -.92]],
    [[-1.42, -1.23], [-1.74, -1.08], [-1.7, -.73]],
    [[-1.63, -.1], [-1.48, .67], [-1.08, .73]]
  ]);
  shell(outline, [[.92, -.36], [1, -.23], [1, .18], [.95, .34]], cream, purple);

  for (const side of [-1, 1]) {
    const grip = curve([side * 1.25, -.15], [
      [[side * 1.52, -.2], [side * 1.61, -.46], [side * 1.61, -.75]],
      [[side * 1.65, -1.0], [side * 1.43, -1.08], [side * 1.26, -.86]],
      [[side * 1.08, -.6], [side * 1.0, -.34], [side * 1.25, -.15]]
    ]);
    if (side < 0) grip.reverse();
    shell(grip, [[1, .21], [.96, .365]], purple, purple);
    cylinder(side * .56, -.15, .23, .34, .41, dark);
    cylinder(side * .56, -.15, .17, .41, .55, purple);
    cylinder(side * .56, -.15, .155, .55, .58, purple, [157, 105, 195]);
    cylinder(side * .91, .65, .22, -.14, .08, dark);
  }

  // Raised directional pad, separate from the two analogue sticks.
  const cross = [[-.1,.29],[.1,.29],[.1,.1],[.29,.1],[.29,-.1],[.1,-.1],[.1,-.29],[-.1,-.29],[-.1,-.1],[-.29,-.1],[-.29,.1],[-.1,.1]];
  shell(cross.map(([x,y])=>[x-.94,y+.3]), [[1,.34],[1,.45]], dark, dark);

  for (const [x,y] of [[.94,.58],[1.2,.32],[.94,.06],[.68,.32]]) {
    cylinder(x,y,.105,.34,.42,purple,[183,151,205]);
  }
  cylinder(-.13,.27,.048,.34,.37,purple);
  cylinder(.13,.27,.048,.34,.37,purple);
  // Battery cover, rear screws and seam are visible during the back half of a turn.
  shell([[-.48,.37],[.48,.37],[.48,-.17],[-.48,-.17]], [[1,-.37],[1,-.385]], [117,69,156],[117,69,156]);
  for (const x of [-1.1, 1.1]) for (const y of [-.5,.4]) cylinder(x,y,.027,-.4,-.365,dark);

  function rotate([x,y,z], angle) {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = -x * Math.sin(angle) + z * Math.cos(angle);
    const tilt = -.17;
    return [rx, y * Math.cos(tilt) - rz * Math.sin(tilt),
      y * Math.sin(tilt) + rz * Math.cos(tilt)];
  }

  // Triangulate the curved outline once so every surface can share a depth buffer.
  const triangles = [];
  for (const item of mesh) {
    const points = item.points;
    const normal = [0,0,0];
    for (let index=0; index<points.length; index++) {
      const a=points[index], b=points[(index+1)%points.length];
      normal[0]+=(a[1]-b[1])*(a[2]+b[2]);
      normal[1]+=(a[2]-b[2])*(a[0]+b[0]);
      normal[2]+=(a[0]-b[0])*(a[1]+b[1]);
    }
    const drop=normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs)));
    const axes=[0,1,2].filter(axis=>axis!==drop);
    const projected=points.map(p=>axes.map(axis=>p[axis]));
    const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    const area=projected.reduce((sum,a,index)=>{
      const b=projected[(index+1)%points.length];
      return sum+a[0]*b[1]-a[1]*b[0];
    },0);
    const sign=Math.sign(area)||1;
    const remaining=points.map((_,index)=>index);
    let attempts=0;
    while (remaining.length>2 && attempts++<points.length*points.length) {
      let found=false;
      for (let i=0;i<remaining.length;i++) {
        const a=remaining[(i+remaining.length-1)%remaining.length], b=remaining[i], c=remaining[(i+1)%remaining.length];
        if (cross(projected[a],projected[b],projected[c])*sign<=1e-9) continue;
        const contains=remaining.some(p=>p!==a && p!==b && p!==c &&
          cross(projected[a],projected[b],projected[p])*sign>=-1e-9 &&
          cross(projected[b],projected[c],projected[p])*sign>=-1e-9 &&
          cross(projected[c],projected[a],projected[p])*sign>=-1e-9);
        if (contains) continue;
        const vertices = [points[a], points[b], points[c]];
        const side = vertices.reduce((sum, p) => sum + p[2], 0) > 0 ? "front" : "back";
        const cap = Math.abs(normal[2]) / (Math.hypot(...normal) || 1) > .85;
        const front = points[a][2] + points[b][2] + points[c][2] >= 0;
        const uv=[points[a],points[b],points[c]].map(point => [
          .5 + point[0] * (front ? .245 : -.245),
          .438 - point[1] * .405
        ]);
        triangles.push({points:vertices,color:item.color,normal,side,cap,uv});
        remaining.splice(i,1);
        found=true;
        break;
      }
      if (!found) break;
    }
  }

  let bitmap, depths;
  function draw(angle) {
    const ratio=Math.min(devicePixelRatio||1,1.25,440/Math.max(1,canvas.clientWidth));
    const width=Math.max(1,Math.round(canvas.clientWidth*ratio));
    const height=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if (canvas.width!==width || canvas.height!==height || !bitmap) {
      canvas.width=width;
      canvas.height=height;
      bitmap=context.createImageData(width,height);
      depths=new Float32Array(width*height);
    }
    bitmap.data.fill(0);
    depths.fill(0);
    const scale=Math.min(width/5.1,height/3.2);
    for (const triangle of triangles) {
      const projected=triangle.points.map(point=>{
        const [x,y,z]=rotate(point,angle);
        const depth=1/(6-z);
        return [width/2+x*scale*6*depth,height/2-y*scale*6*depth,depth];
      });
      const [a,b,c]=projected;
      const denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
      if (Math.abs(denominator)<.001) continue;
      const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));
      const maxX=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));
      const maxY=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const normal=rotate(triangle.normal,angle);
      const length=Math.hypot(...normal)||1;
      const light=Math.abs((normal[0]*-.35+normal[1]*.55+normal[2]*.76)/length);
      const color=triangle.color.map(value=>Math.round(value*(.68+.32*light)));
      const texture = triangle.cap ? textures[triangle.side] : null;
      for (let y=minY;y<=maxY;y++) for (let x=minX;x<=maxX;x++) {
        const u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/denominator;
        const v=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/denominator;
        const w=1-u-v;
        if (u<0 || v<0 || w<0) continue;
        const depth=u*a[2]+v*b[2]+w*c[2];
        const pixel=y*width+x;
        if (depth<=depths[pixel]) continue;
        depths[pixel]=depth;
        const offset=pixel*4;
        let red=color[0], green=color[1], blue=color[2];
        if (texture) {
          const uv=triangle.uv;
          const tx=Math.round((u*a[2]*uv[0][0]+v*b[2]*uv[1][0]+w*c[2]*uv[2][0])/depth*(texture.width-1));
          const ty=Math.round((u*a[2]*uv[0][1]+v*b[2]*uv[1][1]+w*c[2]*uv[2][1])/depth*(texture.height-1));
          if (tx>=0 && tx<texture.width && ty>=0 && ty<texture.height) {
            const sample=(ty*texture.width+tx)*4;
            if (texture.pixels[sample+3]>100) {
              const shade=.84+.16*light;
              red=Math.round(texture.pixels[sample]*shade);
              green=Math.round(texture.pixels[sample+1]*shade);
              blue=Math.round(texture.pixels[sample+2]*shade);
            }
          }
        }
        bitmap.data[offset]=red;
        bitmap.data[offset+1]=green;
        bitmap.data[offset+2]=blue;
        bitmap.data[offset+3]=255;
      }
    }
    function glow(point, radius, color, opacity) {
      const [x,y,z]=rotate(point,0);
      const depth=1/(6-z);
      const px=width/2+x*scale*6*depth, py=height/2-y*scale*6*depth;
      for (let y=Math.max(0,Math.floor(py-radius));y<=Math.min(height-1,Math.ceil(py+radius));y++) {
        for (let x=Math.max(0,Math.floor(px-radius));x<=Math.min(width-1,Math.ceil(px+radius));x++) {
          const distance=Math.hypot(x+.5-px,y+.5-py)/radius;
          if (distance>1 || depth<depths[y*width+x]) continue;
          const offset=(y*width+x)*4;
          const alpha=(1-distance)*opacity, oldAlpha=bitmap.data[offset+3]/255;
          const nextAlpha=alpha+oldAlpha*(1-alpha);
          for (let channel=0;channel<3;channel++) {
            bitmap.data[offset+channel]=(color[channel]*alpha+bitmap.data[offset+channel]*oldAlpha*(1-alpha))/nextAlpha;
          }
          bitmap.data[offset+3]=Math.round(nextAlpha*255);
        }
      }
    }
    function orbitPoint(t, ring) {
      return [2.03*Math.cos(t), .56*Math.sin(t)+(ring ? -.36 : .32)*Math.cos(t)-.08,
        Math.sin(t)*(ring ? -.95 : 1.1)];
    }
    for (let ring=0;ring<2;ring++) {
      for (let step=0;step<220;step++) {
        glow(orbitPoint(step/220*Math.PI*2,ring),1.25,[226,193,255],.5);
      }
      for (let dot=0;dot<7;dot++) {
        const t=dot/7*Math.PI*2+angle*(ring ? -1.3 : 1.7);
        const point=orbitPoint(t,ring);
        glow(point,6,[216,168,255],.28);
        glow(point,2,[255,246,255],.95);
      }
    }
    context.putImageData(bitmap,0,0);
  }

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let angle = -.22;
  let frame = 0, last = 0;
  const noMotion = () => motion.matches || document.body.classList.contains("astro-motion-off") || document.body.classList.contains("motion-paused");
  function tick(now) {
    frame = 0;
    if (document.hidden || noMotion()) return;
    if (!last || now - last >= 32) {
      if (last) angle = (angle + Math.min(now - last,100) / 1000 * Math.PI / 9) % (Math.PI*2);
      last = now;
      draw(angle);
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    draw(angle);
    if (!document.hidden && !noMotion()) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(()=>draw(angle)).observe(canvas);
  new MutationObserver(sync).observe(document.body,{ attributes:true,attributeFilter:["class"] });
  motion.addEventListener("change",sync);
  document.addEventListener("visibilitychange",sync);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(frame));
  window.addEventListener("pageshow",sync);
  sync();
  loadTexture("front", "controle-frente-realista.webp");
  loadTexture("back", "controle-verso-realista.webp");
})();
