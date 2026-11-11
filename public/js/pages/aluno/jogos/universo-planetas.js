/* Um contexto, um programa e uniformes pertencentes ao mesmo programa. */
export function createPlanetRenderer(canvas, textureURL, onReady) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const vertex = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_radius;
    uniform float u_extent;
    varying vec2 v_point;
    void main() {
      v_point = a_position * u_extent;
      vec2 pixel = u_center + v_point * u_radius;
      gl_Position = vec4(pixel / u_resolution * 2.0 - 1.0, 0.0, 1.0);
    }`;
  const fragment = `
    precision mediump float;
    varying vec2 v_point;
    uniform sampler2D u_texture;
    uniform vec2 u_cell;
    uniform float u_phase;
    uniform float u_kind;
    uniform float u_selected;
    const float PI = 3.14159265;
    vec3 surface(vec3 n) {
      float longitude = fract(atan(n.x, n.z) / (2.0 * PI) + 0.5 + u_phase);
      float latitude = asin(clamp(n.y, -1.0, 1.0)) / PI + 0.5;
      vec2 uv = u_cell + vec2(longitude, clamp(latitude, 0.005, 0.995)) * 0.5;
      vec3 base = texture2D(u_texture, uv).rgb;
      vec3 sun = normalize(vec3(0.65, 0.48, 0.68));
      float diffuse = max(0.0, dot(n, sun));
      vec3 color = base * (0.09 + 1.0 * diffuse);
      if (u_kind < 0.5) {
        float water = smoothstep(0.01, 0.22, base.b - base.r);
        float specular = pow(max(0.0, dot(reflect(-sun,n), vec3(0.0,0.0,1.0))), 28.0);
        color += vec3(0.5,0.65,0.8) * specular * water * 0.45;
        float rim = pow(1.0 - n.z, 3.0);
        color += vec3(0.08,0.26,0.5) * rim * (0.2 + diffuse);
      }
      return color;
    }
    void main() {
      vec2 p = ${document.documentElement.dataset.astroTema==="pixel"?"(floor(v_point*56.)+.5)/56.":"v_point"};
      float rr = dot(p,p);
      float sphereZ = -100.0;
      bool sphere = rr <= 1.0;
      vec3 color = vec3(0.0);
      float alpha = 0.0;
      if (sphere) {
        sphereZ = sqrt(max(0.0, 1.0 - rr));
        vec3 n = vec3(p, sphereZ);
        color = surface(n);
        alpha = 1.0-smoothstep(0.985,1.0,sqrt(rr));
      } else if (u_kind < 0.5 && rr < 1.12) {
        float glow = 1.0 - smoothstep(1.0,1.058,sqrt(rr));
        color = vec3(0.12,0.4,0.8);
        alpha = glow * 0.25;
      }
      if (u_kind > 1.5 && u_kind < 2.5) {
        vec3 normal = normalize(vec3(0.27,0.84,0.47));
        float z = -(normal.x*p.x + normal.y*p.y) / normal.z;
        float radius = length(vec3(p,z));
        if (radius > 1.24 && radius < 2.08 && (!sphere || z > sphereZ)) {
          float grooves = 0.65 + 0.18*sin(radius*125.0) + 0.1*sin(radius*53.0);
          float gap = smoothstep(0.01,0.025,abs(radius-1.74));
          float edge = smoothstep(1.24,1.28,radius)*(1.0-smoothstep(2.02,2.08,radius));
          color = mix(vec3(0.36,0.31,0.24),vec3(0.82,0.75,0.61),grooves);
          float shadow = (p.x < -0.1 && abs(p.y) < 0.25) ? 0.5 : 1.0;
          color *= shadow;
          alpha = edge * gap * 0.85;
        }
      }
      if (u_selected > 0.5 && !sphere && rr < 1.21 && rr > 1.1) {
        float edge = (1.0-smoothstep(1.055,1.10,sqrt(rr))) * smoothstep(1.045,1.055,sqrt(rr));
        color = mix(color,vec3(0.75,0.56,1.0),edge);
        alpha = max(alpha,edge*0.7);
      }
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(color,alpha);
    }`;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) { gl.deleteShader(result); throw Error('Shader indisponível'); }
    return result;
  }
  let program;
  try {
    program = gl.createProgram();
    const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Renderização indisponível');
  } catch {
    if (program) gl.deleteProgram(program);
    return null;
  }
  const uniforms = {};
  for (const name of ['resolution','center','radius','extent','texture','cell','phase','kind','selected']) uniforms[name] = gl.getUniformLocation(program,'u_'+name);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,'a_position');
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,(document.documentElement.dataset.astroTema === "pixel" ? gl.NEAREST : gl.LINEAR));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,(document.documentElement.dataset.astroTema === "pixel" ? gl.NEAREST : gl.LINEAR));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([120,100,80,255]));
  let ready = false, alive = true;
  canvas.addEventListener('webglcontextlost', () => { alive = false; }, { once: true });
  const image = new Image();
  image.onload = () => {
    if (!alive || gl.isContextLost()) return;
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    ready = true; onReady?.(true);
  };
  image.onerror = () => onReady?.(false);
  image.src = textureURL;
  const cells = [[0,.5],[.5,.5],[0,0],[.5,0]];
  return {
    draw(planets, width, height, ratio) {
      if (!alive || gl.isContextLost()) return;
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready) return;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.uniform1i(uniforms.texture,0);
      gl.uniform2f(uniforms.resolution,width*ratio,height*ratio);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      planets.forEach(planet => {
        gl.uniform2f(uniforms.center,planet.x*ratio,(height-planet.y)*ratio);
        gl.uniform1f(uniforms.radius,planet.r*ratio);
        gl.uniform1f(uniforms.extent,planet.kind===2?2.2:1.12);
        gl.uniform2f(uniforms.cell,...cells[planet.kind]);
        gl.uniform1f(uniforms.phase,planet.phase);
        gl.uniform1f(uniforms.kind,planet.kind);
        gl.uniform1f(uniforms.selected,planet.selected?1:0);
        gl.drawArrays(gl.TRIANGLES,0,6);
      });
    }
  };
}
/* astro-tema-v2 */