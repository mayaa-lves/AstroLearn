/* Esfera armilar em WebGL, sem bibliotecas ou CDN. */
(() => {
    const control = document.getElementById('armillaryControl');
    const canvas = document.getElementById('armillaryCanvas');
    const station = document.getElementById('armillaryStation');
    const reset = document.getElementById('armillaryReset');

    if (!control || !canvas || !station || !reset) return;

    // Impede a inicialização duplicada no mesmo canvas.
    if (canvas.dataset.armillaryInitialized === 'true') return;

    canvas.dataset.armillaryInitialized = 'true';
    const media = matchMedia('(prefers-reduced-motion: reduce)');

    const reduced = () =>
        media.matches ||
        document.body.classList.contains('astro-motion-off');

    let gl;
    let program;
    let meshes = [];

    let raf = 0;
    let last = 0;
    let yaw = .3;
    let tilt = .12;
    let speed = 0;
    let drag = null;
    let visible = true;
    let destroyed = false;

    const buffers = [];
    const TAU = Math.PI * 2;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    function fallback() {
        cancelAnimationFrame(raf);
        raf = 0;

        station.classList.remove('armillary-ready');

        control.hidden = true;
        reset.hidden = true;
    }

    function shader(type, source) {
        const item = gl.createShader(type);

        gl.shaderSource(item, source);
        gl.compileShader(item);

        if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
            gl.deleteShader(item);
            throw new Error('Não foi possível preparar a esfera.');
        }

        return item;
    }

    function mesh(point, steps, strips) {
        const vertices = [];

        const add = (u, v) => {
            vertices.push(
                ...point(
                    u / steps * TAU,
                    v / strips * TAU
                )
            );
        };

        for (let u = 0; u < steps; u++) {
            for (let v = 0; v < strips; v++) {
                add(u, v);
                add(u + 1, v);
                add(u, v + 1);

                add(u, v + 1);
                add(u + 1, v);
                add(u + 1, v + 1);
            }
        }

        const buffer = gl.createBuffer();

        buffers.push(buffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.STATIC_DRAW
        );

        return {
            buffer,
            count: vertices.length / 6
        };
    }

    function torus(radius, tube) {
        return mesh((u, v) => {
            const c = Math.cos(u);
            const s = Math.sin(u);
            const cv = Math.cos(v);
            const sv = Math.sin(v);

            return [
                (radius + tube * cv) * c,
                (radius + tube * cv) * s,
                tube * sv,

                cv * c,
                cv * s,
                sv
            ];
        }, 112, 12);
    }

    function sphere() {
        return mesh((u, v) => {
            const x = Math.cos(u) * Math.sin(v / 2);
            const y = Math.cos(v / 2);
            const z = Math.sin(u) * Math.sin(v / 2);

            return [x, y, z, x, y, z];
        }, 36, 24);
    }

    let pos;
    let normal;
    let angles;
    let offset;
    let scale;
    let color;
    let aspect;

    function init() {
        gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            powerPreference: 'low-power'
        });

        if (!gl) {
            throw new Error('WebGL indisponível.');
        }

        const vs = shader(gl.VERTEX_SHADER, `
      attribute vec3 position;
      attribute vec3 normal;

      uniform vec3 angles;
      uniform vec3 offset;
      uniform float scale;
      uniform float aspect;

      varying vec3 n;
      varying vec3 p;

      vec3 rotate(vec3 v) {
        float c = cos(angles.x);
        float s = sin(angles.x);

        v = vec3(
          v.x,
          c * v.y - s * v.z,
          s * v.y + c * v.z
        );

        c = cos(angles.y);
        s = sin(angles.y);

        v = vec3(
          c * v.x + s * v.z,
          v.y,
          -s * v.x + c * v.z
        );

        c = cos(angles.z);
        s = sin(angles.z);

        return vec3(
          c * v.x - s * v.y,
          s * v.x + c * v.y,
          v.z
        );
      }

      void main() {
        n = rotate(normal);
        p = rotate(position * scale) + offset;

        gl_Position = vec4(
          p.x / (1.4 * aspect),
          p.y / 1.4,
          -p.z / 6.,
          1.
        );
      }
    `);

        const fs = shader(gl.FRAGMENT_SHADER, `
      precision mediump float;

      uniform vec3 color;

      varying vec3 n;
      varying vec3 p;

      void main() {
        vec3 N = normalize(n);
        vec3 L = normalize(vec3(-.8, 1.1, 1.5));

        float diffuse = max(dot(N, L), 0.);

        float shine = pow(
          max(
            dot(
              reflect(-L, N),
              vec3(0., 0., 1.)
            ),
            0.
          ),
          48.
        );

        float rim = pow(1. - abs(N.z), 3.);

        float grain =
          sin(p.x * 93. + p.y * 71.) *
          sin(p.z * 87. + p.y * 21.) *
          .024;

        vec3 lit = color * (.32 + .78 * diffuse + grain);

        lit +=
          vec3(1., .88, .63) * shine * .8 +
          vec3(.28, .37, .48) * rim * .22;

        gl_FragColor = vec4(lit, 1.);
      }
    `);

        program = gl.createProgram();

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        gl.deleteShader(vs);
        gl.deleteShader(fs);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Programa WebGL inválido.');
        }

        gl.useProgram(program);

        pos = gl.getAttribLocation(program, 'position');
        normal = gl.getAttribLocation(program, 'normal');

        angles = gl.getUniformLocation(program, 'angles');
        offset = gl.getUniformLocation(program, 'offset');
        scale = gl.getUniformLocation(program, 'scale');
        color = gl.getUniformLocation(program, 'color');
        aspect = gl.getUniformLocation(program, 'aspect');

        meshes = [
            torus(1.13, .025),
            torus(1.03, .028),
            torus(.89, .024),
            torus(.66, .018),
            sphere()
        ];

        gl.enable(gl.DEPTH_TEST);

        station.classList.add('armillary-ready');

        control.hidden = false;
        reset.hidden = false;
    }

    function draw(item, rotation, translation, size, tint) {
        gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);

        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(
            pos,
            3,
            gl.FLOAT,
            false,
            24,
            0
        );

        gl.enableVertexAttribArray(normal);
        gl.vertexAttribPointer(
            normal,
            3,
            gl.FLOAT,
            false,
            24,
            12
        );

        gl.uniform3fv(angles, rotation);
        gl.uniform3fv(offset, translation);
        gl.uniform1f(scale, size);
        gl.uniform3fv(color, tint);

        gl.drawArrays(gl.TRIANGLES, 0, item.count);
    }

    function paint() {
        if (destroyed || gl.isContextLost()) return;

        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const dpr = document.documentElement.dataset.astroTema === 'pixel'
            ? 0.5
            : Math.min(devicePixelRatio || 1, 2);

        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);

        if (
            canvas.width !== width ||
            canvas.height !== height
        ) {
            canvas.width = width;
            canvas.height = height;
        }
        gl.useProgram(program);
        
        gl.viewport(0, 0, width, height);

        gl.clearColor(0, 0, 0, 0);

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.uniform1f(aspect, width / height);

        const brass = [.66, .43, .19];
        const edge = [.79, .57, .29];
        const origin = [0, 0, 0];

        draw(
            meshes[0],
            [tilt, .1, 0],
            origin,
            1,
            edge
        );

        draw(
            meshes[1],
            [tilt + .46, yaw, .18],
            origin,
            1,
            brass
        );

        draw(
            meshes[2],
            [tilt + 1.2, -yaw * .65 + .5, -.2],
            origin,
            1,
            edge
        );

        draw(
            meshes[3],
            [tilt + .8, yaw * .8 + 1, .5],
            origin,
            1,
            brass
        );

        draw(
            meshes[4],
            [tilt, yaw, 0],
            origin,
            .16,
            [.8, .52, .21]
        );

        const orbits = [
            [.67, .7, .095],
            [.9, 3.2, .12],
            [.48, 4.5, .075]
        ];

        for (const [radius, phase, size] of orbits) {
            const a = yaw + phase;

            draw(
                meshes[4],
                [.1, a, 0],
                [
                    Math.cos(a) * radius,
                    Math.sin(a) * radius * .35,
                    Math.sin(a) * radius * .8
                ],
                size,
                brass
            );
        }

        canvas.dataset.rotation = String(yaw);
    }

    function frame(time) {
        raf = 0;

        if (
            !visible ||
            document.hidden ||
            reduced() ||
            destroyed
        ) {
            last = 0;
            return;
        }

        const dt = last
            ? Math.min((time - last) / 1000, .04)
            : 0;

        last = time;

        if (!drag) {
            yaw += speed * dt;
            speed *= Math.exp(-2.6 * dt);
        }

        paint();

        if (drag || Math.abs(speed) > .001) {
            raf = requestAnimationFrame(frame);
        } else {
            last = 0;
        }
    }

    function sync() {
        cancelAnimationFrame(raf);

        raf = 0;
        last = 0;

        if (
            destroyed ||
            !visible ||
            document.hidden
        ) {
            return;
        }

        if (reduced()) {
            speed = 0;
        }

        paint();

        if (
            !reduced() &&
            (drag || Math.abs(speed) > .001)
        ) {
            raf = requestAnimationFrame(frame);
        }
    }

    try {
        init();
        paint();
    } catch {
        fallback();
        return;
    }

    control.addEventListener('click', event => {
        event.stopPropagation();
    });

    control.addEventListener('pointerdown', event => {
        event.stopPropagation();

        if (
            !event.isPrimary ||
            (
                event.pointerType === 'mouse' &&
                event.button !== 0
            )
        ) {
            return;
        }

        control.focus({ preventScroll: true });
        control.setPointerCapture(event.pointerId);

        speed = 0;

        drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            time: event.timeStamp
        };

        control.classList.add('dragging');
    });

    control.addEventListener('pointermove', event => {
        event.stopPropagation();

        if (
            !drag ||
            event.pointerId !== drag.id
        ) {
            return;
        }

        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;

        const seconds = Math.max(
            (event.timeStamp - drag.time) / 1000,
            .008
        );

        const sensitivity =
            4 / Math.max(control.clientWidth, 100);

        yaw += dx * sensitivity;

        tilt = clamp(
            tilt + dy * sensitivity * .35,
            -.25,
            .65
        );

        speed = reduced()
            ? 0
            : clamp(
                dx * sensitivity / seconds,
                -3,
                3
            );

        drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            time: event.timeStamp
        };

        paint();
    });

    function release(event) {
        if (
            !drag ||
            event.pointerId !== drag.id
        ) {
            return;
        }

        if (
            event.type !== 'pointerup' ||
            event.timeStamp - drag.time > 100
        ) {
            speed = 0;
        }

        drag = null;

        control.classList.remove('dragging');

        if (control.hasPointerCapture(event.pointerId)) {
            control.releasePointerCapture(event.pointerId);
        }

        sync();
    }

    control.addEventListener('pointerup', release);
    control.addEventListener('pointercancel', release);
    control.addEventListener('lostpointercapture', release);

    control.addEventListener('keydown', event => {
        const keys = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home'
        ];

        if (!keys.includes(event.key)) return;

        event.preventDefault();

        speed = 0;

        if (event.key === 'Home') {
            yaw = .3;
            tilt = .12;
        } else if (event.key === 'ArrowLeft') {
            yaw -= .15;
        } else if (event.key === 'ArrowRight') {
            yaw += .15;
        } else {
            tilt = clamp(
                tilt + (
                    event.key === 'ArrowUp'
                        ? -.06
                        : .06
                ),
                -.25,
                .65
            );
        }

        sync();
    });

    reset.addEventListener('click', () => {
        yaw = .3;
        tilt = .12;
        speed = 0;

        sync();

        control.focus({ preventScroll: true });
    });

    media.addEventListener('change', sync);

    document.addEventListener(
        'astrolearn:motion',
        sync
    );

    document.addEventListener('visibilitychange', () => {
        speed = 0;
        sync();
    });

    const resize = new ResizeObserver(sync);
    resize.observe(control);

    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;

        if (!visible) {
            speed = 0;
        }

        sync();
    });

    observer.observe(control);

    const classes = new MutationObserver(sync);

    classes.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();

        destroyed = true;

        fallback();
    });

    function dispose() {
        destroyed = true;

        cancelAnimationFrame(raf);

        resize.disconnect();
        observer.disconnect();
        classes.disconnect();

        for (const buffer of buffers) {
            gl.deleteBuffer(buffer);
        }

        gl.deleteProgram(program);
    }

    addEventListener('pagehide', event => {
        if (!event.persisted) {
            dispose();
        } else {
            speed = 0;

            cancelAnimationFrame(raf);

            raf = 0;
        }
    });

    addEventListener('pageshow', event => {
        if (event.persisted) {
            sync();
        }
    });
})();