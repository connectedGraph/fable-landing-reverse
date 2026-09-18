(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  222197,
  (e) => {
    "use strict";
    var t = e.i(408560),
      a = e.i(190072),
      o = e.i(223490);
    let r = (function () {
        function e(e) {
          let t = e >>> 0;
          return function () {
            t |= 0;
            let e = Math.imul((t = (t + 0x6d2b79f5) | 0) ^ (t >>> 15), 1 | t);
            return (((e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e) ^ (e >>> 14)) >>> 0) / 0x100000000;
          };
        }
        let t = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]],
          a = (e, t) => [e[0] * t, e[1] * t, e[2] * t],
          o = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]],
          r = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
        function n(e) {
          let t = Math.hypot(e[0], e[1], e[2]) || 1;
          return [e[0] / t, e[1] / t, e[2] / t];
        }
        let i = (e, t, a) => e + (t - e) * a,
          l = (e, t, a) => Math.min(a, Math.max(t, e)),
          s = [0, 1, 0];
        return {
          generate: function (h, u) {
            let c = Object.assign(
                {
                  origin: [0, 0, 0],
                  rootDir: null,
                  trunkLen: 1,
                  trunkRadius: 0.045,
                  segLen: 0.07,
                  wobble: 0.22,
                  maxDepth: 3,
                  childrenByDepth: [5, 3, 2],
                  radialByDepth: [10, 8, 6, 5],
                  childAngle: [0.55, 1.05],
                  twigLift: 0.05,
                  tipLift: 0.09,
                  leafDensity: 1,
                  barkDark: [0.34, 0.27, 0.215],
                  barkLight: [0.47, 0.395, 0.3],
                },
                u || {},
              ),
              d = e(h),
              f = {
                positions: [],
                normals: [],
                colors: [],
                flex: [],
                uvs: [],
                indices: [],
                min: [1 / 0, 1 / 0, 1 / 0],
                max: [-1 / 0, -1 / 0, -1 / 0],
                vert(e, t, a, o, r) {
                  (this.positions.push(e[0], e[1], e[2]),
                    this.normals.push(t[0], t[1], t[2]),
                    this.colors.push(a[0], a[1], a[2]),
                    this.flex.push(o || 0),
                    this.uvs.push(r ? r[0] : 0.5, r ? r[1] : 0));
                  for (let t = 0; t < 3; t++)
                    (e[t] < this.min[t] && (this.min[t] = e[t]), e[t] > this.max[t] && (this.max[t] = e[t]));
                  return this.positions.length / 3 - 1;
                },
                tri(e, t, a) {
                  this.indices.push(e, t, a);
                },
              },
              m = [],
              p = c.rootDir ? n(c.rootDir) : n([0.92, 0.3, (d() - 0.5) * 0.3]);
            !(function h(u, c, d, f, m, p, v, g, y, w, b) {
              let x = l(Math.round(p / w.segLen), 4, 16),
                M = p / x,
                k = [f.slice()],
                S = [],
                D = n(m),
                C = f.slice(),
                z = o(D, s);
              (1e-4 > Math.hypot(z[0], z[1], z[2]) && (z = [1, 0, 0]), (z = a(n(z), 0.5 > u() ? 1 : -1)));
              let A = (0.02 + 0.05 * u()) * (0 === g ? 1.5 : 1);
              for (let e = 0; e < x; e++) {
                let o = (e + 1) / x,
                  r = w.wobble * (0.75 + 0.45 * g),
                  l = [(u() - 0.5) * r, (u() - 0.5) * r, (u() - 0.5) * r];
                ((l = t(l, [0, g >= 2 ? w.twigLift : 0 === g ? i(-0.04, w.tipLift, o) : 0.01, 0])),
                  (D = n(t(t(D, l), a(z, A)))),
                  (C = t(C, a(D, M))),
                  k.push(C.slice()),
                  S.push(D.slice()));
              }
              (S.push(S[S.length - 1].slice()), S.unshift(S[0].slice()));
              let B = o(S[0], 0.9 > Math.abs(S[0][1]) ? s : [1, 0, 0]);
              B = n(B);
              let I = [];
              for (let e = 0; e <= x; e++) {
                let i = S[e];
                B = n(t(B, a(i, -r(i, B))));
                let l = n(o(i, B));
                I.push({ t: i, n: B.slice(), b: l });
              }
              let F = g >= w.maxDepth - 1,
                T = F ? Math.max(0.18 * v, 0.0014) : 0.38 * v,
                L = [];
              for (let e = 0; e <= x; e++) L.push(i(v, T, Math.pow(e / x, 0.72)));
              let R = l(g / w.maxDepth, 0, 1),
                N = u(),
                P = N < 0.35 ? [0.015, 0.05, -0.02] : N < 0.7 ? [0.055, 0.005, -0.012] : [-0.025, -0.015, 0.012],
                W = [
                  i(w.barkDark[0], w.barkLight[0], R) + P[0],
                  i(w.barkDark[1], w.barkLight[1], R) + P[1],
                  i(w.barkDark[2], w.barkLight[2], R) + P[2],
                ];
              b && (W = [0.6, 0.58, 0.55]);
              let G = Math.max(4, w.radialByDepth[Math.min(g, w.radialByDepth.length - 1)]),
                V = [],
                E = u() * Math.PI * 2,
                O = 0.05 + 0.06 * u(),
                q = Math.min(4 + Math.floor(4 * u()), Math.floor(G / 2)),
                U = u() * Math.PI * 2,
                _ = (u() - 0.5) * 2,
                H = 0.5 + 0.8 * u(),
                j = F ? 0.05 : 0 === g ? 0.17 : 0.15,
                K = 0.05 + 0.09 * u(),
                X = u() * Math.PI,
                Q = Math.floor(u() * x * 2.5);
              for (let e = 0; e <= x; e++) {
                V.push(c.positions.length / 3);
                let o = I[e],
                  r = e / x,
                  n = y + r * p,
                  l = n / 0.3,
                  s = 1 + O * Math.sin(1.9 * e + E) + 0.13 * Math.pow(Math.max(0, Math.sin(0.83 * e + 1.7 * E)), 10),
                  h = e === Q;
                h && (s *= 0.8);
                let d = 2 * Math.PI * L[e] * s,
                  f = 0,
                  m = 0;
                for (let p = 0; p <= G; p++) {
                  let v = p === G,
                    y = (p / G) * Math.PI * 2,
                    w = t(a(o.n, Math.cos(y)), a(o.b, Math.sin(y))),
                    b = Math.pow(0.5 + 0.5 * Math.cos(y * q + _ * n * 6 + U + H * Math.sin(9 * n + E)), 2.2),
                    x = L[e] * s * (1 + K * Math.cos(2 * y + X)) * (1 + j * (0.55 - b)) * (1 + (u() - 0.5) * 0.1),
                    M = (u() - 0.5) * 0.05;
                  (0 === p && ((f = x), (m = M)), v && ((x = f), (M = m)));
                  let S = t(k[e], a(w, x)),
                    D = (x / (L[e] * s) - 1) * 1.9,
                    C = g > 0 ? 1 - 0.3 * Math.exp(-(0.8 * e)) : 1,
                    z = M + 0.12 * D + (h ? -0.09 : 0),
                    A = [(W[0] + z) * C, (W[1] + z) * C, (W[2] + 0.8 * z) * C];
                  if (F) {
                    let e = 0.4 * r;
                    A = [i(A[0], 0.42, e), i(A[1], 0.48, e), i(A[2], 0.29, e)];
                  }
                  c.vert(S, w, A, n, [(p / G) * (d / 0.3), l]);
                }
              }
              for (let e = 0; e < x; e++)
                for (let t = 0; t < G; t++) {
                  let a = V[e] + t,
                    o = V[e] + t + 1,
                    r = V[e + 1] + t,
                    n = V[e + 1] + t + 1;
                  (c.tri(a, r, o), c.tri(o, r, n));
                }
              {
                let e = I[x],
                  o = t(k[x], a(e.t, 0.7 * L[x])),
                  r = c.vert(o, e.t, W, y + p);
                for (let e = 0; e < G; e++) c.tri(V[x] + e, r, V[x] + e + 1);
              }
              if (0 === g) {
                let e = I[0],
                  o = a(e.t, -1),
                  r = c.vert(k[0], o, [0.62, 0.52, 0.38], 0),
                  n = c.positions.length / 3;
                for (let r = 0; r < G; r++) {
                  let n = (r / G) * Math.PI * 2,
                    i = t(a(e.n, Math.cos(n)), a(e.b, Math.sin(n)));
                  c.vert(t(k[0], a(i, L[0])), o, [0.58, 0.48, 0.35], 0);
                }
                for (let e = 0; e < G; e++) {
                  let t = (e + 1) % G;
                  c.tri(n + e, n + t, r);
                }
              }
              let Y = (e) => i(v, T, Math.pow(e, 0.72)),
                Z = (e) => I[l(Math.round(e * x), 0, x)],
                $ = (e) => {
                  let o = e * x,
                    r = l(Math.floor(o), 0, x - 1),
                    n = o - r;
                  return t(a(k[r], 1 - n), a(k[r + 1], n));
                };
              d.perches || (d.perches = []);
              {
                let e = Math.max(1, Math.round(p / 0.06));
                for (let t = 0; t < e; t++) {
                  let a = 0.15 + 0.7 * (1 === e ? 0.5 : t / (e - 1)),
                    o = Z(a);
                  d.perches.push({ c: $(a), r: Y(a), along: o.t, d: g, t: a, flex: y + a * p });
                }
              }
              if (!b && g <= 1) {
                let e = +(0.32 > u());
                for (let o = 0; o < e; o++) {
                  let e = 0.15 + 0.7 * u(),
                    o = u() * Math.PI * 2,
                    r = Z(e),
                    i = t(a(r.n, Math.cos(o)), a(r.b, Math.sin(o))),
                    l = 0.9 + 0.5 * u(),
                    s = n(t(t(a(r.t, Math.cos(l)), a(i, Math.sin(l))), [0, -0.15 * u(), 0]));
                  h(u, c, d, $(e), s, 0.035 + 0.05 * u(), Math.max(0.42 * Y(e), 0.0015), w.maxDepth, y + e * p, w, !0);
                }
              }
              if (!b && g < w.maxDepth) {
                let e = Math.max(
                    0,
                    Math.round(w.childrenByDepth[Math.min(g, w.childrenByDepth.length - 1)] + (u() - 0.5) * 1.5),
                  ),
                  o = u() * Math.PI * 2;
                for (let r = 0; r < e; r++) {
                  let s = l(0.14 + 0.78 * ((r + 0.8 * u()) / Math.max(1, e)), 0.12, 0.92);
                  o += 2.39996323 + (u() - 0.5) * 0.9;
                  let f = Z(s),
                    m = t(a(f.n, Math.cos(o)), a(f.b, Math.sin(o))),
                    v = i(w.childAngle[0], w.childAngle[1], u()),
                    b = n(t(a(f.t, Math.cos(v)), a(m, Math.sin(v)))),
                    x = p * i(0.4, 0.62, u()) * (1.25 - 0.55 * s),
                    M = Math.max(Math.min(0.72 * Y(s), Y(s) * (0.5 + 0.25 * u())), 0.0022),
                    k = t($(s), a(m, 0.6 * Y(s)));
                  x > 2.2 * w.segLen && h(u, c, d, k, b, x, M, g + 1, y + s * p, w);
                }
                if (g <= w.maxDepth - 2) {
                  let e = 1 + Math.round(1.5 * u());
                  for (let r = 0; r < e; r++) {
                    let e = l(0.1 + 0.85 * u(), 0.1, 0.95);
                    o += 4.079937491 + (u() - 0.5);
                    let r = Z(e),
                      s = t(a(r.n, Math.cos(o)), a(r.b, Math.sin(o))),
                      f = i(0.7, 1.15, u()),
                      m = n(t(a(r.t, Math.cos(f)), a(s, Math.sin(f)))),
                      v = p * i(0.1, 0.2, u());
                    v > 1.6 * w.segLen &&
                      h(
                        u,
                        c,
                        d,
                        t($(e), a(s, 0.6 * Y(e))),
                        m,
                        v,
                        Math.max(0.3 * Y(e), 0.0016),
                        w.maxDepth - 1,
                        y + e * p,
                        w,
                      );
                  }
                }
              }
              if (!b && g >= 1) {
                let o = e(Math.floor(0xffffffff * u())),
                  r = g >= (null != w.leafOuterDepth ? w.leafOuterDepth : w.maxDepth - 1),
                  n = r ? w.leafDensity : 0.26 * w.leafDensity,
                  s = r ? 0.12 : 0.5,
                  h = Math.round((p / 0.05) * n),
                  c = o() * Math.PI * 2;
                for (let e = 0; e < h; e++) {
                  let r = l(s + (1 - s) * Math.pow(e / Math.max(1, h - 1), 0.78), 0, 1);
                  c += 2.39996323 + (o() - 0.5) * 0.5;
                  let n = 0.35 > o() ? 3 : 0.75 > o() ? 2 : 1;
                  for (let e = 0; e < n; e++) {
                    let s = l(r + (e - (n - 1) / 2) * 0.055, 0.05, 1),
                      h = Z(s),
                      u = c + e * (2.4 + 0.6 * o()),
                      f = t(a(h.n, Math.cos(u)), a(h.b, Math.sin(u)));
                    d.push({
                      p: t(t($(s), a(f, 0.8 * Y(s))), a(h.t, (o() - 0.5) * 0.02)),
                      out: f,
                      along: h.t,
                      c: $(s),
                      r: Y(s),
                      d: g,
                      t: s,
                      size: i(0.75, 1.15, o()) * (1.05 - 0.25 * s),
                      flex: y + s * p,
                      roll: (o() - 0.5) * 2,
                      droop: o(),
                    });
                  }
                }
                let f = I[x];
                d.push({
                  p: t(k[x], a(f.t, L[x])),
                  out: f.n,
                  along: f.t,
                  c: k[x],
                  r: L[x],
                  d: g,
                  t: 1,
                  size: i(0.85, 1.1, o()),
                  flex: y + p,
                  roll: (o() - 0.5) * 2,
                  droop: o(),
                });
              }
            })(d, f, m, c.origin.slice(), p, c.trunkLen, c.trunkRadius, 0, 0, c);
            let v = 1e-6;
            for (let e of f.flex) e > v && (v = e);
            for (let e of m) e.flex > v && (v = e.flex);
            let g = new Float32Array(f.flex.length);
            for (let e = 0; e < f.flex.length; e++) g[e] = Math.pow(f.flex[e] / v, 1.4);
            for (let e of m) e.flex = Math.pow(e.flex / v, 1.4);
            for (let e of m.perches || []) e.flex = Math.min(1, Math.pow(e.flex / v, 1.4));
            let y = f.positions.length / 3,
              w = y > 65535 ? Uint32Array : Uint16Array,
              b = [(f.min[0] + f.max[0]) / 2, (f.min[1] + f.max[1]) / 2, (f.min[2] + f.max[2]) / 2],
              x = 0.5 * Math.hypot(f.max[0] - f.min[0], f.max[1] - f.min[1], f.max[2] - f.min[2]);
            return {
              positions: new Float32Array(f.positions),
              normals: new Float32Array(f.normals),
              colors: new Float32Array(f.colors),
              flex: g,
              uvs: new Float32Array(f.uvs),
              indices: new w(f.indices),
              anchors: m,
              perches: m.perches || [],
              bounds: { center: b, radius: x },
              stats: { vertices: y, triangles: f.indices.length / 3, leaves: m.length, seed: h },
            };
          },
        };
      })(),
      n = [0x326eb8d5, 0x794e9d91],
      i = [0xc2ed8dc, 0x371915ac, 0x641e7af9, 0x52d2dd4a];
    e.s(
      [
        "createFableHero",
        0,
        function (e, l = {}) {
          let s,
            h,
            u,
            c,
            d,
            f,
            m,
            p,
            v = (e) => (l.assets || "") + e,
            g = [],
            y = (e, t, a, o) => {
              (e.addEventListener(t, a, o), g.push([e, t, a, o]));
            },
            w = Object.assign(
              {
                host: "fx-hero",
                canvas: "fx-hero-canvas",
                drawn: "drawn",
                overBird: "over-bird",
                looks: "fx-hero-looks",
                look: "fx-hero-look",
                on: "on",
                night: "fx-hero--night",
                dusk: "fx-hero--dusk",
                morning: "fx-hero--morning",
                unsupported: "fx-hero--unsupported",
              },
              l.classes,
            );
          e.classList.add(w.host);
          let b = document.createElement("canvas");
          ((b.className = w.canvas), b.setAttribute("aria-hidden", "true"), e.prepend(b));
          let x = matchMedia("(prefers-reduced-motion: reduce)").matches;
          try {
            ((s = new t.WebGLRenderer({ canvas: b, antialias: !1, alpha: !1, powerPreference: "high-performance" }))
              .getContext()
              .getExtension("EXT_color_buffer_float"),
              s.getContext().getExtension("OES_texture_float_linear"));
          } catch (t) {
            return (b.remove(), e.classList.add(w.unsupported), l.onUnsupported && l.onUnsupported(t), null);
          }
          ((s.toneMapping = a.NoToneMapping), (s.outputColorSpace = a.LinearSRGBColorSpace));
          let M = new a.Scene(),
            k = new a.PerspectiveCamera(21, 1, 0.1, 700);
          k.position.set(0, 0, 0);
          let S = new a.Vector3(0, 0.55, -3),
            D = (e) => new a.Color(e),
            C = new a.Vector3(0.45, 0.6, 0.42).normalize(),
            z = D("#6180c3"),
            A = D("#6483c6"),
            B = D("#fff3dc"),
            I = D("#ffe9c4"),
            F = `
  uniform float uLag;
  uniform vec4 uLand;   // a landing: the perch (xyz) and the time it took the weight (w) - the wood there dips and springs back
  uniform vec3 uLandK;  // that perch's spring: amplitude (m), angular frequency, decay - a twig slow and deep, a bough short and firm
  float landSpring(vec3 wp, float flex, float t) {
    float lt = t - uLand.w;
    if (lt <= 0.0 || lt > 3.0) return 0.0;
    float prox = 1.0 - smoothstep(0.0, 0.9, distance(wp, uLand.xyz)); // the wood near the perch, fading out along the branch
    return -sin(lt * uLandK.y) * exp(-lt * uLandK.z) * uLandK.x * (0.3 + 0.7 * flex) * prox;  // an immediate dip, then fading bounces
  }
  // wood, not rubber: a branch bends as ONE piece (the phase changes slowly
  // across the canopy, so neighbouring points move together instead of
  // rippling along the twig), the wood near the trunk barely moves (the
  // amplitude rises steeply toward the tips), and the quick tremble lives
  // in the outermost twigs only
  vec3 windSway(vec3 wp, float flex, float t, float wind) {
    float ph = wp.x * 0.7 + wp.z * 0.5 + wp.y * 0.3 - flex * 0.6 * uLag;
    float s1 = sin(t * 1.05 + ph);
    float s2 = sin(t * 2.30 + ph * 1.6 + 1.3);
    float s3 = sin(t * 4.70 + ph * 2.9 + 4.1) * flex * flex;
    float amp = wind * flex * flex * (0.35 + 0.65 * flex);
    vec3 dir = vec3(0.72, 0.18, 0.55);
    return dir * (s1 * 0.58 + s2 * 0.24 + s3 * 0.07) * amp * 0.085
         + vec3(0.0, 1.0, 0.0) * ((s2 * 0.45 + s3 * 0.15) * amp * 0.028 + landSpring(wp, flex, t));
  }
`,
            T = { value: 0 },
            L = { value: 0 },
            R = { value: 0 },
            N = { value: 0 },
            P = new a.Color("#e89a88"),
            W = new a.Color("#9aa6bc"),
            G = 0.42 * !x,
            V = { value: G },
            E = { value: 1 },
            O = { value: new a.Vector4(0, 0, 0, -100) },
            q = { value: new a.Vector3(0.02, 15, 3.4) },
            U = new a.Vector3(),
            _ = new a.Vector3(),
            H = new a.Vector3(),
            j = new a.Quaternion();
          function K(e, t, a = 1.4) {
            let o = e.flex,
              r = Math.max(0.8, Math.min(1.2, a / 1.4));
            (O.value.set(e.p[0], e.p[1], e.p[2], t),
              q.value.set((0.006 + 0.01 * o) * r, 2 * Math.PI * (5 - 1.2 * o), 6 + 2 * (1 - o)));
          }
          let X = `
  uniform vec3 uZenith, uHorizon, uSunDir, uSunGlow, uDuskMid, uDuskFar, uMoonDir;
  uniform float uNight, uDusk, uSkyVar;
  vec3 skyColor(vec3 dir) {
    float h = smoothstep(-0.06, 0.6, dir.y);
    vec3 col = mix(uHorizon, uZenith, pow(h, 0.85));
    // sunset: the colour lives NEAR THE SUN. Overhead stays a dusky blue; a
    // thin salmon band hugs the horizon; gold builds toward the sun's azimuth
    // and the horizon away from it is hazy blue-grey
    vec3 sunH = normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + vec3(1e-5));
    vec3 dirH = normalize(vec3(dir.x, 0.0, dir.z) + vec3(1e-5));
    float az = smoothstep(-0.4, 1.0, dot(dirH, sunH));              // 1 = toward the sun
    vec3 hor = mix(uDuskFar, uHorizon, az);
    vec3 band = mix(mix(uDuskFar, uDuskMid, 0.35), uDuskMid, az);
    vec3 dc = mix(hor, band, smoothstep(-0.01, 0.07, dir.y));
    dc = mix(dc, uZenith, smoothstep(0.02, 0.17 + 0.10 * az, dir.y));   // the blue takes over low: the warmth is a band, not a wall
    col = mix(col, dc, uDusk);
    float sd = max(dot(dir, uSunDir), 0.0);
    // by day this is the sun's glow; at night uSunDir has swung to the moon
    // and the same term becomes a soft halo around it; at dusk it swells
    col += uSunGlow * pow(sd, 14.0) * (mix(0.22, 0.06, uNight) + 0.28 * uDusk);
    col += uSunGlow * pow(sd, 4.0) * 0.14 * uDusk;                     // golden haze low over the horizon
    // (no visible sun disc: the moon is the scene's only celestial body -
    //  the sunset lives in its glow and horizon colour alone)
    // real skies are never mathematically flat - and the moon's shadow side
    // must carry the same variation, or it shows as a ghost disc
    col *= 1.0 + uSkyVar * (0.011 * sin(dir.x * 4.1 + dir.y * 6.3) * sin(dir.y * 3.7 - dir.x * 2.3)
                          + 0.006 * sin(dir.x * 11.0) * sin(dir.y * 9.0));
    return col;
  }
`,
            Q = [48, 74, -268],
            Y = new a.Vector3(...Q),
            Z = new a.Mesh(
              new a.SphereGeometry(600, 48, 24),
              new a.ShaderMaterial({
                side: a.BackSide,
                uniforms: {
                  uZenith: { value: z },
                  uHorizon: { value: A },
                  uSunDir: { value: C },
                  uSunGlow: { value: I },
                  uSkyVar: { value: 1 },
                  uMoonDir: { value: Y.clone().normalize() },
                  uNight: L,
                  uDusk: R,
                  uTime: T,
                  uDuskMid: { value: P },
                  uDuskFar: { value: W },
                },
                vertexShader: `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
                fragmentShader: `
      varying vec3 vDir;
      uniform float uTime;
      ${X}
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      void main() {
        vec3 dir = normalize(vDir);
        vec3 col = skyColor(dir);
        float g = pow(max(dot(dir, uSunDir), 0.0), 14.0);
        if (uNight > 0.001) {
          // star field on an azimuth / elevation grid (~0.5 deg cells): one
          // candidate star per cell, most faint, a few bright, all twinkling
          vec2 ae = vec2(atan(dir.x, -dir.z), asin(clamp(dir.y, -1.0, 1.0))) * 114.6;
          vec2 c = floor(ae);
          vec2 f = fract(ae) - 0.5;
          float hs = hash(vec3(c, 1.0));
          vec2 o = vec2(hash(vec3(c, 7.3)), hash(vec3(c, 13.9))) - 0.5;
          float mag = fract(hs * 41.7);                  // 0 faint .. 1 bright
          // pin-points, not discs: a tight core the size of a pixel or two,
          // the brightest few carrying a faint soft skirt
          float rad = 0.028 + 0.035 * mag * mag;
          float dd = length(f - o * 0.7);
          float core = smoothstep(rad, rad * 0.25, dd);
          float skirt = smoothstep(rad * 4.0, 0.0, dd) * 0.08 * mag * mag;
          // a bright moon washes out all but the brightest stars: very sparse
          float star = (core + skirt) * step(0.955, hs);
          // real stars scintillate, they do not blink: a slow, slight shimmer
          float tw = 0.93 + 0.07 * sin(uTime * (0.8 + 1.2 * hs) + hs * 80.0);
          float bright = (0.16 + 0.9 * mag * mag) * tw;
          col += mix(vec3(0.78, 0.85, 1.0), vec3(1.0, 0.95, 0.85), fract(hs * 9.1))
               * star * bright * uNight * smoothstep(-0.02, 0.2, dir.y) * (1.0 - g * 0.85);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
              }),
            );
          M.add(Z);
          let $ = new a.Vector3(-0.86, 0.34, 0.18).normalize(),
            J = new a.Mesh(
              new a.SphereGeometry(10.2, 48, 32),
              new a.ShaderMaterial({
                transparent: !0,
                depthWrite: !0,
                uniforms: {
                  uMoonLight: { value: $ },
                  uZenith: { value: z },
                  uHorizon: { value: A },
                  uSunDir: { value: C },
                  uSunGlow: { value: I },
                  uMoonGain: { value: 1 },
                  uSkyVar: { value: 1 },
                  uMoonDir: { value: Y.clone().normalize() },
                  uNight: L,
                  uDusk: R,
                  uDuskMid: { value: P },
                  uDuskFar: { value: W },
                },
                vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vNv; varying vec3 vRay;
      void main() {
        vN = normalize(position);
        vNv = normalMatrix * normal;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vRay = wp.xyz - cameraPosition;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
                fragmentShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vNv; varying vec3 vRay;
      uniform vec3 uMoonLight;
      uniform float uMoonGain;
      ${X}
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float vnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n000 = hash(i), n100 = hash(i + vec3(1,0,0));
        float n010 = hash(i + vec3(0,1,0)), n110 = hash(i + vec3(1,1,0));
        float n001 = hash(i + vec3(0,0,1)), n101 = hash(i + vec3(1,0,1));
        float n011 = hash(i + vec3(0,1,1)), n111 = hash(i + vec3(1,1,1));
        return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
                   mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
      }
      float fbm(vec3 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.13; a *= 0.5; }
        return v;
      }
      void main() {
        vec3 n = normalize(vN);
        // the sky's own gradient along this exact view ray
        vec3 skyCol = skyColor(normalize(vRay));

        float edge = dot(normalize(vV), normalize(vNv));
        // broad, gentle terminator: illumination rolls off across the disc
        float litRaw = dot(n, uMoonLight);
        float lit = smoothstep(-0.22, 0.58, litRaw);
        lit = lit * lit * (3.0 - 2.0 * lit); // eased, curved terminator that wraps the sphere
        // night: one continuous fade across the whole disc - a single
        // un-eased smoothstep so the change is never concentrated anywhere
        // and there is NO locatable division line
        float litW = smoothstep(-0.45, 0.70, litRaw);
        // BY DAY the moon reads as two gradients laid over the disc (from the
        // reference frame): a LINEAR one, the moon fully there at top-left and
        // gone into the sky at bottom-right - times a RADIAL one anchored on the
        // right part of the disc, sky-coloured at the anchor and growing outward
        // from it, so the whole left limb is where the moon is strongest
        vec2 q = n.xy;                                                  // the disc as seen: x right, y up
        float g1 = smoothstep(-0.50, 0.62, dot(q, normalize(vec2(-1.0, 1.0))));   // progressive, but fully sky before the right limb: no circle shows
        float g2 = smoothstep(0.20, 1.25, length(q - vec2(0.62, -0.05)));
        lit = g1 * g2;                       // the same two gradients in every look, night included
        // surface: large maria patches + craters, strongest under grazing light
        float m = fbm(n * 3.1 + 7.0);
        float m2 = fbm(n * 1.6 + 2.0);
        float mare = 0.30 * smoothstep(0.44, 0.66, m)
                   + 0.16 * smoothstep(0.48, 0.72, m2);
        float term = smoothstep(-0.15, 0.15, litRaw) * smoothstep(0.75, 0.35, litRaw);
        float craters = (0.07 + 0.10 * term) * smoothstep(0.50, 0.85, fbm(n * 17.0 + 3.0))
                      + 0.06 * fbm(n * 9.0);
        // a further level: broad highland patches a step lighter than the rest
        // (the lunar highlands ARE brighter than the plains) - the existing
        // tones stay, these areas simply come up
        float highland = 0.11 * smoothstep(0.52, 0.72, fbm(n * 2.3 + 13.0))
                       + 0.05 * smoothstep(0.58, 0.80, fbm(n * 5.1 + 27.0));
        float detail = 1.0 - mare - craters + highland;
        // night: maria read as large, soft, clearly darker basins, plus a few
        // bright ray craters - the texture a camera actually resolves
        float mareN = 0.30 * smoothstep(0.40, 0.62, m) + 0.13 * smoothstep(0.46, 0.70, m2);
        float rays = 0.06 * smoothstep(0.78, 0.94, fbm(n * 23.0 + 11.0));
        float grain = 0.06 * (fbm(n * 41.0 + 5.0) - 0.5); // fine regolith mottle
        float detailN = clamp(1.0 - mareN - craters * 0.9 + rays + grain, 0.0, 1.2);
        detailN *= 1.0 - 0.05 * term; // barely-there: a band here would redraw the division
        detail = mix(detail, detailN, uNight);
        // per-channel gains: the daytime moon is far LESS blue than the sky
        // pale by day: barely lighter than the sky, bluish, low contrast (a daytime
        // moon is a sunlit rock seen THROUGH the whole bright atmosphere)
        vec3 daySurf = skyCol * uMoonGain * vec3(2.9, 1.9, 1.24);
        // at night the moon IS the light: bright bone-white, independent of the sky
        // exposed like a real night frame: cream-grey highlands (~#c9c4b4 after
        // the grade), maria a clear step darker - never a white disc
        vec3 nightSurf = vec3(0.30, 0.29, 0.26) * uMoonGain; // a night moon is bright, not blinding
        vec3 moonSurf = mix(daySurf, nightSurf, uNight) * detail;
        // radial: bright at the rim, translucent toward the centre (day only)
        float rim = pow(1.0 - abs(edge), 1.6);
        moonSurf = mix(moonSurf, moonSurf * vec3(1.13, 1.12, 1.09), rim); // the limb a tad lighter
        moonSurf = mix(moonSurf, mix(moonSurf, skyCol, 0.30), (1.0 - rim) * (1.0 - uNight));
        // the shaded side is not painted at all: the disc's opacity IS the lit
        // term, so whatever sky is behind it - blue, pale morning, sunset,
        // night with its stars - shows through untouched
        float limb = smoothstep(0.0, mix(0.34, 0.24, uNight), abs(edge)); // the limb dissolves; a shade crisper at night
        float alpha = smoothstep(0.02, mix(0.16, 0.12, uNight), abs(edge)) * lit * (limb * 0.97 + 0.03);
        gl_FragColor = vec4(moonSurf, alpha);
      }
    `,
              }),
            );
          (J.position.copy(Y), M.add(J));
          let ee = { value: 0 },
            et = { value: 0 },
            ea = new a.Mesh(
              new a.SphereGeometry(200, 48, 24),
              new a.ShaderMaterial({
                side: a.BackSide,
                transparent: !0,
                depthWrite: !1,
                uniforms: {
                  uClouds: ee,
                  uCover: { value: 0.7 },
                  uCloudT: et,
                  uNight: L,
                  uDusk: R,
                  uMorn: N,
                  uDeckFine: { value: 1 },
                  uCoverBoost: { value: 0 },
                  uWarmK: { value: 1 },
                  uShelterReach: { value: 0.2 },
                  uShelterA: { value: new a.Vector4(0, 0, 0, 0) },
                  uShelterB: { value: new a.Vector4(0, 0, 0, 0) },
                  uShelterC: { value: new a.Vector4(0, 0, 0, 0) },
                  uShelterShift: { value: new a.Vector2(0, 0) },
                  uRes: { value: new a.Vector2(1, 1) },
                  uSunDir: { value: C },
                  uSunGlow: { value: I },
                  uMoonDir: { value: Y.clone().normalize() },
                },
                vertexShader: `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
                fragmentShader: `
      varying vec3 vDir;
      uniform float uClouds, uCover, uCloudT, uNight, uDusk, uMorn, uDeckFine, uCoverBoost, uWarmK, uShelterReach;
      uniform vec3 uSunDir, uSunGlow, uMoonDir;
      float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
                   mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 5; i++) { v += a * vn(p); p = R * p * 2.07 + vec2(1.7, 9.2); a *= 0.5; }
        return v;
      }
      float fbm3(vec2 p) {
        float v = 0.0, a = 0.5;
        mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 3; i++) { v += a * vn(p); p = R * p * 2.07 + vec2(1.7, 9.2); a *= 0.5; }
        return v;
      }
      // the cloud density field: broad masses, finer detail riding the other
      // way, a billow term that splits masses into rounded puffs, and a fine
      // grain for texture
      // (the lens is long - 21 degrees - so the frame sees a tiny patch of the
      //  deck; the structure has to be FINE in deck units to show several lobes
      //  across the frame, as the footage does)
      float cloudField(vec2 p, vec2 drift, float seed) {
        float base = fbm(p * 3.2 + drift + seed); // masses a third smaller: at 2.2 a wide frame showed one or two huge ones
        float fine = 0.16 * (fbm(p * 5.5 - drift * 1.4 + 4.0 + seed) - 0.5);
        float billow = 1.0 - abs(2.0 * fbm3(p * 11.0 + drift * 0.6 + 9.0 + seed) - 1.0);
        float grain = 0.06 * (fbm3(p * 26.0 + drift * 0.3 + 23.0 + seed) - 0.5);
        return base + fine + 0.14 * (billow - 0.5) + grain;
      }
      // one deck of cumulus: density, lobe-level light and shade, lit top edges.
      // sc scales the puffs (bigger = nearer), seed decorrelates the layers
      // feather (0..1) widens each puff's soft rim - 1 where the words' shelter has the deck parting
      vec4 deck(vec3 dir, vec2 p0, vec2 drift, float sc, float seed, float th0, float nearMoon, float feather) {
        p0 *= sc * uDeckFine; // phones magnify a strip of the frame: a finer deck keeps the lobes and layering the desktop shows
        // weather mask: clouds come in families with clear sky between them
        float wx = fbm3(p0 * 0.9 + drift * 0.5 + 31.0 + seed);
        // domain warp: the deck is advected, so cells bend and curl
        vec2 warp = (vec2(fbm3(p0 * 1.4 + drift + 3.0 + seed), fbm3(p0 * 1.4 + drift + 17.0 + seed)) - 0.5) * 0.25;
        vec2 p = p0 + warp;
        // (a gentle swing only: the Cover the viewer chose has to HOLD as the deck
        //  drifts - a strong weather mask made whole families build up over minutes)
        float th = th0 + (0.5 - wx) * 0.08 + nearMoon * 0.16;
        // base shapes, finer detail riding the other way, and a BILLOW term:
        // ridged noise that splits each mass into individual rounded puffs
        float field = cloudField(p, drift, seed);
        float dens = smoothstep(th, th + 0.14, field);
        // the soft rim, wider where the shelter has the deck parting: the puffs at the clearing's border feather off
        // into wisps instead of ending at a line
        float fringe = smoothstep(th - 0.08 - 0.14 * feather, th, field) * (1.0 - dens);
        float thick = smoothstep(th, th + 0.40, field);
        // LIGHT AND SHADE, the way a cumulus reads: a puff is bright on the
        // side that faces the sun and dark where a neighbouring puff stands
        // between it and the light. Two scales - the mass and the lobe - each
        // judged by how the density changes toward the sun
        vec2 Ld = normalize(uSunDir.xz + vec2(1e-4, 0.0));
        float towardBig = cloudField(p + Ld * 0.045, drift, seed) - field;     // mass scale
        float lobeHere = fbm3(p * 11.0 + drift * 0.6 + 9.0 + seed);
        float towardLobe = fbm3((p + Ld * 0.012) * 11.0 + drift * 0.6 + 9.0 + seed) - lobeHere; // puff scale
        float bigShade = smoothstep(0.08, -0.08, towardBig);                    // density falling toward the sun = lit face
        float lobeShade = smoothstep(0.10, -0.10, towardLobe);
        float lam = 0.10 + 0.90 * (0.45 * bigShade + 0.55 * lobeShade); // lit faces, mid flanks, dark hollows
        // the bellies: the mass ABOVE a point (toward the zenith) shades it
        float above = cloudField(p * 0.96, drift, seed);
        float belly = exp(-max(above - th, 0.0) * 7.0);
        float light = lam * belly;
        // the sunlit top edge of every mass: dense here, sky just above
        float topEdge = smoothstep(0.0, 0.10, th - above) * dens;
        // PRE-grade values, solved through the ACES curve so the clouds land
        // where the footage's do: peach crowns ~ (232,190,170), pink-grey
        // mid ~ (205,165,165), grey-lilac undersides ~ (170,160,175)
        // a GAMUT of crowns from mass to mass: each cloud family (the weather mask's scale) draws its own hue,
        // from a deep orange to a clear yellow - one colour per mass, blended only across a family's edge
        float hue = smoothstep(0.36, 0.64, fbm3(p0 * 0.55 + drift * 0.3 + 57.0 + seed));
        vec3 litD = mix(vec3(1.66, 0.80, 0.24), vec3(1.50, 1.06, 0.44), hue) * (1.0 - uMorn) + vec3(1.62, 0.86, 0.30) * uMorn;
        litD = mix(vec3(dot(litD, vec3(0.333))), litD, uWarmK); // phones: the crowns pushed further into their hue (their strip reads pale otherwise)
        vec3 midD = mix(vec3(0.98, 0.52, 0.26), vec3(0.92, 0.66, 0.34), hue), shdD = vec3(0.30, 0.27, 0.30); // mid close to the crown: one continuous gradient, not pools of pink
        vec3 litK = vec3(1.04, 0.62, 0.46), midK = vec3(0.52, 0.33, 0.40), shdK = vec3(0.22, 0.18, 0.34); // sunset: pink / dusty rose / violet
        litD = mix(litD, litK, uDusk); midD = mix(midD, midK, uDusk); shdD = mix(shdD, shdK, uDusk);
        vec3 litN = vec3(0.080, 0.088, 0.120), midN = vec3(0.028, 0.032, 0.047), shdN = vec3(0.006, 0.007, 0.012); // moonlit: silver-grey crowns well above the sky, mid a shade above it, the hollows below it
        // morning: paler, cooler, less warm on the crowns - the sun is low and soft
        // morning: the same peach, a touch softer against the pale sky
        litD = mix(litD, vec3(1.30, 0.62, 0.24), uMorn); midD = mix(midD, vec3(0.78, 0.44, 0.27), uMorn); shdD = mix(shdD, vec3(0.30, 0.27, 0.28), uMorn);
        // how hard the light/shade reads: moderate at noon, softer in every
        // other look so the clouds sit IN those skies instead of on them
        float contrast = 0.84 - 0.36 * uDusk - 0.16 * uNight - 0.08 * uMorn; // the crowns must REACH the lit colour: at 0.72 they stalled a quarter short of it, grey (at night the deck keeps most of its relief: a flat deck vanished into the sky)
        float lk = mix(0.5, clamp(light, 0.0, 1.0), contrast);
        vec3 dayCol = lk < 0.5 ? mix(shdD, midD, lk * 2.0) : mix(midD, litD, lk * 2.0 - 1.0);
        vec3 nightCol = lk < 0.5 ? mix(shdN, midN, lk * 2.0) : mix(midN, litN, lk * 2.0 - 1.0);
        vec3 col = mix(dayCol, nightCol, uNight);
        col += mix(litD, litN, uNight) * topEdge * 0.18;
        col *= mix(1.0, 0.90, thick); // deep cores carry a greyer underside
        col *= mix(vec3(1.0), vec3(1.02, 1.0, 0.86), lk * (1.0 - uNight)); // the sunlit crowns shed the sky's blue: warm where the light is
        // forward scatter: the sun (or moon) burns through the thin parts
        float gm = pow(max(dot(dir, uSunDir), 0.0), mix(24.0, 48.0, uNight));
        col += uSunGlow * gm * mix(0.55, 0.50, uNight) * (1.0 - thick * 0.8) * (1.0 - 0.7 * uDusk); // the moon silvers the thin cloud round it
        return vec4(col, dens + fringe * 0.5);
      }
      uniform vec4 uShelterA, uShelterB, uShelterC; uniform vec2 uRes, uShelterShift;
      // signed distance from a point to one of the words' boxes, rounded to a lozenge (negative inside). Both are in
      // frame HEIGHTS (s scales the box's fractions), so the clearing runs as far left and right of the words as above
      // and below them (in the frame's own fractions a wide frame's fade was half again as wide sideways)
      float boxDist(vec2 p, vec4 r, vec2 s) {
        if (r.z <= r.x) return 1e3;
        vec2 c = 0.5 * (r.xy + r.zw) * s, h = 0.5 * (r.zw - r.xy) * s;
        float rad = min(min(h.x, h.y), 0.12);
        vec2 d = abs(p - c) - (h - rad);
        return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - rad;
      }
      // the soft union of two distances: where two boxes meet, the join is a curve, not a notch
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }
      // the distance (heights) to the union of the three boxes. The point is WARPED before it is judged, so the edge
      // wanders and drifts with the clouds (a straight-sided hole read as a shelf cut through the deck); a soft union
      // only ever grows the clearing, so it is safe for the words' margin
      float shelterDist(vec2 p, vec2 warp, vec2 s) {
        p += warp;
        return smin(smin(boxDist(p, uShelterA, s), boxDist(p, uShelterB, s), 0.08), boxDist(p, uShelterC, s), 0.08);
      }
      void main() {
        vec3 dir = normalize(vDir);
        if (uClouds <= 0.001 || dir.y < -0.05) discard;
        // project the dome onto a flat cloud deck overhead: perspective
        // flattens the field toward the horizon, as a real sky does
        vec2 p0 = dir.xz / (max(dir.y, 0.0) + 0.5) * 0.85;
        vec2 drift = uCloudT * vec2(0.005, 0.002);
        float nearMoon = pow(max(dot(dir, uMoonDir), 0.0), 80.0);
        float th0 = mix(0.80, 0.46, clamp(uCover + uCoverBoost, 0.0, 1.0)); // from a wisp or two up to a well-clouded sky (phones: a boost, their strip sees the deck's sparse low band)
        // text shelter: where the page's words sit there are FEWER clouds - the
        // deck's threshold rises there, so the masses shrink and part; whatever
        // remains keeps its full colour (a fade washed the crowns grey)
        // the clearing is judged in the sky's own frame, not the screen's: the camera sways and follows the pointer by a
        // few pixels, and a hole fixed to the words while the deck slid under it read as clouds morphing with the mouse.
        // The words' boxes carry padding enough that the words stay clear through the shift
        vec2 sc = gl_FragCoord.xy / uRes; sc.y = 1.0 - sc.y; sc -= uShelterShift;
        // The shelter is the words and a bounded margin, judged with a small warp so nothing wanders in over the type,
        // and a LONG ramp out from there - long enough that the field's own relief, not the ramp, draws the edge: the
        // masses on the ramp shrink and part where they are thin and hold where they are thick, and the puffs at the
        // border feather off (deck's fringe). The ramp is uneven at puff scale, so it bites deeper here and a mass
        // holds its ground there. (One short ramp that raised the threshold by a whole unit killed the deck within
        // its first few percent: the edge was a uniform soft line tracing the boxes' lozenge - a hole cut in the sky.)
        vec2 s = vec2(uRes.x / uRes.y, 1.0); // frame fractions -> frame heights
        float shelter = 0.0;
        if (shelterDist(sc * s, vec2(0.0), s) < uShelterReach + 0.06) { // within the warp's reach of the ramp's end; beyond it the shelter is nothing, and its noise is not paid for
          vec2 warp = (vec2(fbm3(p0 * 1.6 + drift + 5.0), fbm3(p0 * 1.6 + drift + 19.0)) - 0.5) * 0.08
                    + (vec2(fbm3(p0 * 4.5 + drift * 1.2 + 83.0), fbm3(p0 * 4.5 + drift * 1.2 + 97.0)) - 0.5) * 0.04; // +-6% of a height, at most: the fade starts that far out
          float d = shelterDist(sc * s, warp, s);
          shelter = 1.0 - smoothstep(0.06, uShelterReach, d);
          float margin = 1.0 - smoothstep(0.06, 0.14, d); // 1 over the words and their margin
          shelter = mix(shelter * (0.6 + 0.8 * fbm3(p0 * 7.0 + drift * 0.8 + 77.0)), shelter, margin); // even over the words' margin, uneven beyond it
          th0 += 0.6 * shelter;
          // and over the words a FLOOR the field can never reach (its terms sum to ~1.15 at most, all of them at their
          // peaks at once): the ramp's +0.6 alone left the threshold there near that ceiling at a phone's cover, so a
          // core drifting under the title could in principle have shown. Safe by construction again, whatever the cover
          th0 = max(th0, 1.3 * margin);
        }
        float feather = smoothstep(0.0, 0.45, shelter);
        // TWO decks for depth: a far one of smaller puffs, drifting slower and
        // a shade paler with distance, and the near one of big masses over it
        vec4 far = deck(dir, p0, drift * 0.6, 2.1, 41.0, th0 + 0.06, nearMoon, feather);
        far.rgb = mix(far.rgb, mix(vec3(0.82, 0.62, 0.48), vec3(0.030, 0.034, 0.050), uNight), 0.22);
        vec4 near = deck(dir, p0, drift, 1.0, 0.0, th0, nearMoon, feather);
        float alpha = near.a + far.a * 0.7 * (1.0 - near.a);
        vec3 col = (near.rgb * near.a + far.rgb * far.a * 0.7 * (1.0 - near.a)) / max(alpha, 1e-4);
        alpha *= uClouds;
        float gm = pow(max(dot(dir, uSunDir), 0.0), mix(24.0, 90.0, uNight));
        // high cirrus: a faint, streaky veil far above the decks
        vec2 pc = dir.xz / (max(dir.y, 0.0) + 0.5) * 0.55;
        vec2 q = vec2(pc.x * 0.8 + pc.y * 0.6, -pc.x * 0.6 + pc.y * 0.8);
        q = vec2(q.x * 0.5, q.y * 1.3) + drift * 0.35;
        float cir = fbm(q + 7.0) * 0.5 + fbm(q * 3.1 + 2.0) * 0.5;
        float cirMask = smoothstep(0.42, 0.64, fbm3(pc * 0.45 + drift * 0.2 + 11.0)); // patchy, not everywhere
        float cirA = smoothstep(0.58, 0.82, cir) * 0.16 * cirMask * smoothstep(0.0, 0.5, uCover) * uClouds
                   * (1.0 - nearMoon * 0.6) * (1.0 - shelter);
        vec3 cirCol = mix(mix(vec3(0.98, 0.99, 1.02), vec3(1.1, 0.9, 0.82), uDusk), vec3(0.030, 0.034, 0.050), uNight);
        cirCol += uSunGlow * gm * mix(0.35, 0.25, uNight) * (1.0 - 0.6 * uDusk);
        float aAll = 1.0 - (1.0 - alpha) * (1.0 - cirA);
        col = (col * alpha + cirCol * cirA * (1.0 - alpha)) / max(aAll, 1e-4);
        // the deck thins toward the horizon. By day the fade is gentle and long (matched to the footage); at night the
        // clouds hold nearly to the horizon - the frame's bottom sits there, and that band read as empty sky
        alpha = aAll * mix(smoothstep(-0.03, 0.10, dir.y), smoothstep(-0.05, 0.02, dir.y), uNight);
        gl_FragColor = vec4(col, alpha);
      }
    `,
              }),
            ),
            eo = new a.Scene();
          (eo.add(Z), eo.add(J));
          let er = new a.Scene();
          er.add(ea);
          let en = new a.DirectionalLight(B, 2.4);
          (en.position.copy(C).multiplyScalar(10), M.add(en));
          let ei = new a.HemisphereLight(D("#bcd6f7"), D("#5d7050"), 1);
          M.add(ei);
          let el = Y.clone().normalize(),
            es = {
              zenith: z.clone(),
              horizon: A.clone(),
              glow: I.clone(),
              sunDir: C.clone(),
              sunCol: B.clone(),
              sunInt: 2.4,
              hemiSky: D("#bcd6f7"),
              hemiGround: D("#6e6252"),
              hemiInt: 1.1,
              leafSun: B.clone().multiplyScalar(1.7),
              leafSky: D("#b8c9dc").multiplyScalar(0.64),
              leafGround: D("#6b7355").multiplyScalar(0.6),
            },
            eh = {
              zenith: D("#030818"),
              horizon: D("#0a1631"),
              glow: D("#9fb0d4"),
              sunDir: el.clone(),
              sunCol: D("#9fb3d8"),
              sunInt: 0.1,
              hemiSky: D("#182a4a"),
              hemiGround: D("#070b14"),
              hemiInt: 0.08,
              leafSun: D("#b4c6e6").multiplyScalar(0.45),
              leafSky: D("#3a5a8c").multiplyScalar(0.16),
              leafGround: D("#1a2436").multiplyScalar(0.12),
            },
            eu = {
              zenith: D("#4a6cab"),
              horizon: D("#e59558"),
              glow: D("#ffb871"),
              sunDir: new a.Vector3(0.66, 0.05, -0.75).normalize(),
              sunCol: D("#f3c9a4"),
              sunInt: 1.35,
              hemiSky: D("#c3adb0"),
              hemiGround: D("#5a4a44"),
              hemiInt: 0.75,
              leafSun: D("#ffc188").multiplyScalar(1.7),
              leafSky: D("#b9a9b4").multiplyScalar(0.55),
              leafGround: D("#5a4a44").multiplyScalar(0.5),
            },
            ec = {
              zenith: D("#5f7aa4"),
              horizon: D("#a29aa6"),
              glow: D("#e8bcae"),
              sunDir: new a.Vector3(0.8, 0.22, 0.3).normalize(),
              sunCol: D("#ffd8b8"),
              sunInt: 2.2,
              hemiSky: D("#d8dcea"),
              hemiGround: D("#a08c84"),
              hemiInt: 1.7,
              leafSun: D("#ffe4b4").multiplyScalar(1.6),
              leafSky: D("#d0dcea").multiplyScalar(0.7),
              leafGround: D("#7c8462").multiplyScalar(0.62),
              duskK: 0,
              nightK: 0,
            },
            ed = { d: 0, n: 0, t: 0 },
            ef = { d: 0, n: 0, t: 0 },
            em = (e, t, a, o, r, n, i, l) => {
              let s = 1 - n - i - l;
              return e.setRGB(
                t.r * s + a.r * n + o.r * i + r.r * l,
                t.g * s + a.g * n + o.g * i + r.g * l,
                t.b * s + a.b * n + o.b * i + r.b * l,
              );
            },
            ep = (e, t, a, o, r, n, i) => e * (1 - r - n - i) + t * r + a * n + o * i;
          function ev(t, a, o) {
            ((R.value = t + o * ec.duskK),
              (L.value = a + o * ec.nightK),
              (N.value = o),
              em(z, es.zenith, eu.zenith, eh.zenith, ec.zenith, t, a, o),
              em(A, es.horizon, eu.horizon, eh.horizon, ec.horizon, t, a, o),
              em(I, es.glow, eu.glow, eh.glow, ec.glow, t, a, o),
              C.set(0, 0, 0)
                .addScaledVector(es.sunDir, 1 - t - a - o)
                .addScaledVector(eu.sunDir, t)
                .addScaledVector(eh.sunDir, a)
                .addScaledVector(ec.sunDir, o)
                .normalize(),
              en.position.copy(C).multiplyScalar(10),
              em(en.color, es.sunCol, eu.sunCol, eh.sunCol, ec.sunCol, t, a, o),
              (en.intensity = ep(es.sunInt, eu.sunInt, eh.sunInt, ec.sunInt, t, a, o)),
              em(ei.color, es.hemiSky, eu.hemiSky, eh.hemiSky, ec.hemiSky, t, a, o),
              em(ei.groundColor, es.hemiGround, eu.hemiGround, eh.hemiGround, ec.hemiGround, t, a, o),
              (ei.intensity = ep(es.hemiInt, eu.hemiInt, eh.hemiInt, ec.hemiInt, t, a, o)),
              em(eR.uniforms.uSunCol.value, es.leafSun, eu.leafSun, eh.leafSun, ec.leafSun, t, a, o),
              em(eR.uniforms.uSkyCol.value, es.leafSky, eu.leafSky, eh.leafSky, ec.leafSky, t, a, o),
              em(eR.uniforms.uGroundCol.value, es.leafGround, eu.leafGround, eh.leafGround, ec.leafGround, t, a, o),
              e.classList.toggle(w.night, a > 0.5),
              e.classList.toggle(w.dusk, t > 0.5),
              e.classList.toggle(w.morning, o > 0.5),
              eg(t, a, o));
          }
          function eg(e, t, a) {
            for (let o of e0)
              ((o.emissiveIntensity = 0.12 * (1 - 0.88 * t) + 0.05 * e + 0.02 * a),
                o.color.setRGB(
                  1 - 0.4 * t + 0.06 * e + 0.03 * a,
                  1 - 0.34 * t - 0.06 * e,
                  1 - 0.16 * t - 0.2 * e - 0.05 * a,
                ));
          }
          let ey = [
              {
                origin: [-1.35, -1.6, -2.55],
                rootDir: [0.62, 1, 0.08],
                trunkLen: 2,
                trunkRadius: 0.017,
                portraitDrop: 0.35,
              },
              {
                origin: [1.4, -1.78, -2.8],
                rootDir: [-0.5, 1, -0.02],
                trunkLen: 2.1,
                trunkRadius: 0.019,
                portraitDrop: 0.35,
              },
              {
                origin: [0.35, -1.9, -3.15],
                rootDir: [0.22, 1, 0.25],
                trunkLen: 1.7,
                trunkRadius: 0.015,
                portraitDrop: 0.35,
              },
              {
                origin: [1.75, -0.15, -2.3],
                rootDir: [-1, 0.3, 0.08],
                trunkLen: 1.9,
                trunkRadius: 0.034,
                leafDensity: 0.5,
                childrenByDepth: [4, 3, 2],
                portraitDrop: 0.5,
              },
            ],
            ew = {
              segLen: 0.06,
              wobble: 0.36,
              maxDepth: 3,
              childrenByDepth: [6, 4, 2],
              radialByDepth: [16, 12, 9, 7],
              childAngle: [0.55, 1],
              leafDensity: 0.95,
              twigLift: 0.05,
              tipLift: 0.1,
              barkDark: [1.18, 1.06, 1.04],
              barkLight: [1.66, 1.54, 1.5],
            },
            eb = 0,
            ex = new Map();
          function eM(e, t, a, o, n) {
            let i = Object.assign({}, ew, e);
            (eE.portrait && e.portraitDrop && (i.origin = [e.origin[0], e.origin[1] - e.portraitDrop, e.origin[2]]),
              (i.leafDensity = i.leafDensity * n));
            let l = Math.pow(o, 0.55);
            return (
              (i.childrenByDepth = i.childrenByDepth.map((e, t) => Math.max(+(0 === t), e * l))),
              (i.maxDepth = 4),
              (i.leafOuterDepth = 2),
              (i.childrenByDepth = i.childrenByDepth.concat([(o - 1) * 1.5 - 0.3])),
              r.generate(a + 101 * t, i)
            );
          }
          function ek(e) {
            let t = Math.tan((10.5 * Math.PI) / 180);
            for (let a of e)
              for (let e of a.perches || []) {
                if (e.r < 0.0045 || e.t > 0.85 || Math.abs(e.along[1]) > 0.7) continue;
                let a = -e.c[2];
                if (a < 1.85 || a > 4.2) continue;
                let o = e.c[0] / (1.78 * t * a),
                  r = (e.c[1] - 0.183 * a) / (t * a),
                  n = eE.portrait ? -0.95 : -0.58,
                  i = eE.portrait ? -0.35 : 0.45;
                if (o > -0.3 && o < 0.9 && r > n && r < i) return !0;
              }
            return !1;
          }
          function eS(e) {
            let t = null,
              a = 1e9,
              o = 3,
              r = Math.tan((10.5 * Math.PI) / 180),
              n = (e) => {
                if (!e.c) return { p: e.p.slice(), flex: e.flex };
                let t = e.along,
                  a = t[1],
                  o = -t[0] * a,
                  r = 1 - t[1] * a,
                  n = -t[2] * a,
                  i = Math.hypot(o, r, n) || 1;
                ((o /= i), (r /= i), (n /= i));
                let l = 0.92 * e.r - 0.0025;
                return { p: [e.c[0] + o * l, e.c[1] + r * l, e.c[2] + n * l], flex: e.flex, along: t.slice(), r: e.r };
              },
              i = (o) => {
                let i = 0 === o,
                  l = o >= 2,
                  s = i ? 0.0045 : 1 === o ? 0.0035 : 2 === o ? 0.0025 : 0.0015;
                for (let o = 0; o < e.length; o++) {
                  let h = 0.15 * (o !== e.length - 1);
                  for (let u of e[o].perches || e[o].anchors) {
                    if ((null != u.r && u.r < s) || (null != u.t && u.t > 0.85)) continue;
                    let e = u.along ? Math.abs(u.along[1]) : 0;
                    if (e > (i ? 0.5 : l ? 0.8 : 0.7)) continue;
                    let o = u.p || u.c,
                      c = -o[2],
                      d = null != u.r && u.r >= 0.0045,
                      f = d ? 1.85 : 2.4;
                    if (
                      (i && (c < f || c > 3.8)) ||
                      (!i && !l && (c < Math.min(f, 2.2) || c > 4.2)) ||
                      (l && (c < 1.7 || c > 4.6))
                    )
                      continue;
                    let m = o[0] / (1.78 * r * c),
                      p = ((o[1] - 0.183 * c) / (r * c) - eE.cy) * (eE.portrait ? eE.zoom : 1),
                      v = i ? 0.28 : 0.08,
                      g = eE.max - eE.min;
                    if (!(m > eE.min + (v * g) / 2 && m < eE.max - (v * g) / 2)) continue;
                    if (eE.portrait) {
                      if (
                        (i && (p < -0.82 || p > -0.45)) ||
                        (!i && !l && (p < -0.9 || p > -0.35)) ||
                        (l && (p < -0.94 || p > -0.3))
                      )
                        continue;
                    } else if (i && (p < -0.55 || p > 0.62)) continue;
                    if (!i && Math.abs(p) > 0.88) continue;
                    let y = null != u.r ? Math.max(0, 0.011 - u.r) / 0.006 : 0,
                      w = (eE.min + eE.max) / 2,
                      b = (eE.max - eE.min) / 2,
                      x =
                        ((m - (w + (eE.portrait ? 0.1 : 0.42) * b)) / b) ** 2 +
                        (p - (eE.portrait ? -0.62 : -0.05)) ** 2 +
                        h +
                        0.3 * y * y +
                        0.5 * e * e +
                        0.25 * (c - (d ? 2.5 : 3)) ** 2;
                    x < a && ((a = x), (t = n(u)));
                  }
                }
              };
            if (
              (i(0),
              t && (o = 0),
              !t && (i(1), t && (o = 1)),
              !t && (i(2), t && (o = 2)),
              !t && (i(3), t && (o = 3)),
              !t)
            )
              for (let o of e.flatMap((e) => e.perches || e.anchors)) {
                let e = o.p || o.c;
                if (1.8 > -e[2]) continue;
                let r = null != o.r ? Math.max(0, 0.007 - o.r) / 0.004 : 0,
                  i = o.along ? Math.abs(o.along[1]) : 0,
                  l =
                    e[0] * e[0] +
                    (e[1] - 0.3) ** 2 +
                    (e[2] + 2.6) ** 2 +
                    2 * r * r +
                    3 * i * i +
                    4 * (null != o.t && o.t > 0.85);
                l < a && ((a = l), (t = n(o)));
              }
            if (!t) {
              let a = e.flatMap((e) => e.perches || e.anchors);
              t = a.length ? n(a[0]) : { p: [0.4, 0.3, -2.6], flex: 0.5 };
            }
            return { perch: t, pass: o, score: a };
          }
          let eD = new a.TextureLoader(),
            eC = 2,
            ez = () => {
              eC--;
            },
            eA = performance.now() + 2500,
            eB = eD.load(v("bark_diff.webp"), ez, void 0, ez);
          ((eB.colorSpace = a.SRGBColorSpace), (eB.wrapS = eB.wrapT = a.RepeatWrapping), (eB.anisotropy = 2));
          let eI = eD.load(v("bark_nor.webp"), ez, void 0, ez);
          ((eI.wrapS = eI.wrapT = a.RepeatWrapping), (eI.anisotropy = 1));
          let eF = new a.MeshStandardMaterial({
            vertexColors: !0,
            roughness: 0.82,
            metalness: 0,
            map: eB,
            normalMap: eI,
            normalScale: new a.Vector2(0.55, 0.55),
          });
          eF.onBeforeCompile = (e) => {
            ((e.uniforms.uTime = T),
              (e.uniforms.uWind = V),
              (e.uniforms.uLag = E),
              (e.uniforms.uLand = O),
              (e.uniforms.uLandK = q),
              (e.vertexShader =
                "attribute float aFlex;\nuniform float uTime;\nuniform float uWind;\n" +
                F +
                e.vertexShader.replace(
                  "#include <begin_vertex>",
                  "#include <begin_vertex>\ntransformed += windSway(position, aFlex, uTime, uWind);",
                )));
          };
          let eT =
              (((h = document.createElement("canvas")).width = h.height = 256),
              (u = h.getContext("2d")).clearRect(0, 0, 256, 256),
              (c = ["h", "h", "y", "d"]),
              [
                [0, 0],
                [128, 0],
                [0, 128],
                [128, 128],
              ].forEach(([e, t], a) =>
                (function (e, t, a, o) {
                  let r = t + 64 + (Math.random() - 0.5) * 8,
                    n = a + 16,
                    i = a + 128 - 26,
                    l = i - n,
                    s = 0.42 + 0.08 * Math.random(),
                    h = (e) =>
                      128 *
                      s *
                      Math.pow(Math.sin(Math.PI * Math.pow(Math.max(e, 0.01), 0.45) * 0.9), 1.1) *
                      (1 - 0.85 * Math.pow(e, 2.5)),
                    u = 8 + Math.floor(4 * Math.random()),
                    c = 0.11 + 0.05 * Math.random(),
                    d = (Math.random() - 0.5) * 0.16,
                    f = () => Array.from({ length: 24 }, () => 0.55 + 0.9 * Math.random()),
                    m = f(),
                    p = f(),
                    v = Math.random(),
                    g = Math.random(),
                    y = (e, t, a) => {
                      let o = e * u + t,
                        r = ((Math.floor(o) % 24) + 24) % 24,
                        n = Math.min(1, 5 * e) * Math.min(1, (1 - e) * 6 + 0.1);
                      return 1 + c * Math.pow(1 - Math.abs(2 * (o - Math.floor(o)) - 1), 0.65) * a[r] * n;
                    },
                    w = [];
                  for (let e = 0; e <= 96; e++) {
                    let t = e / 96,
                      a = d * Math.sin(Math.PI * t) * 23.04;
                    w.push([r + a + h(1 - t) * y(t, v, m), n + t * l]);
                  }
                  for (let e = 96; e >= 0; e--) {
                    let t = e / 96,
                      a = d * Math.sin(Math.PI * t) * 23.04;
                    w.push([r + a - h(1 - t) * y(t, g, p), n + t * l]);
                  }
                  for (let [t, a] of (e.beginPath(), e.moveTo(w[0][0], w[0][1]), w)) e.lineTo(t, a);
                  e.closePath();
                  let b = e.createLinearGradient(0, i, 0, n),
                    x = 0.92 + 0.16 * Math.random(),
                    M = (e) =>
                      Math.round(e * x)
                        .toString(16)
                        .padStart(2, "0");
                  ("y" === o
                    ? (b.addColorStop(0, "#a89a4e"), b.addColorStop(0.55, "#8f8145"), b.addColorStop(1, "#7a6f3c"))
                    : (b.addColorStop(0, "#" + M(139) + M(143) + M(92)),
                      b.addColorStop(0.55, "#" + M(112) + M(120) + M(74)),
                      b.addColorStop(1, "#" + M(91) + M(101) + M(64))),
                    (e.fillStyle = b),
                    e.fill(),
                    e.save(),
                    e.clip());
                  for (let a = 0; a < 40; a++) {
                    let a = t + 128 * Math.random(),
                      o = n + Math.random() * l,
                      r = 5 + 18 * Math.random();
                    ((e.fillStyle = 0.5 > Math.random() ? "rgba(70,102,44,0.10)" : "rgba(178,204,110,0.10)"),
                      e.beginPath(),
                      e.arc(a, o, r, 0, 7),
                      e.fill());
                  }
                  let k = (t, a, o, r, n) => {
                    ((e.strokeStyle = "rgba(58,84,36,0.55)"),
                      (e.lineWidth = n + 0.8),
                      e.beginPath(),
                      e.moveTo(t, a),
                      e.quadraticCurveTo((t + o) / 2 + (o - t) * 0.12, (a + r) / 2, o, r),
                      e.stroke(),
                      (e.strokeStyle = "rgba(196,216,140,0.8)"),
                      (e.lineWidth = n),
                      e.beginPath(),
                      e.moveTo(t, a),
                      e.quadraticCurveTo((t + o) / 2 + (o - t) * 0.12, (a + r) / 2, o, r),
                      e.stroke());
                  };
                  k(r, i + 8, r, n + 4, 1.6);
                  for (let e = 0; e < 6; e++) {
                    let t = 0.12 + 0.15 * e,
                      a = i - t * l,
                      o = 0.94 * h(t);
                    (k(r, a, r + o, a - 0.13 * l, 1), k(r, a, r - o, a - 0.13 * l, 1));
                  }
                  if ((e.restore(), "d" === o))
                    for (let t = 0; t < 3; t++) {
                      let a = 0.22 + 0.6 * Math.random(),
                        o = 2 === t,
                        i = 0.5 > Math.random() ? 1 : -1,
                        s = o ? r + (Math.random() - 0.5) * h(0.5) : r + i * h(1 - a) * 0.85,
                        u = n + a * l,
                        c = o ? 3 + 4 * Math.random() : 6 + 9 * Math.random();
                      ((e.fillStyle = "rgba(122,84,44,0.6)"),
                        e.beginPath(),
                        e.arc(s, u, c + 2.5, 0, 7),
                        e.fill(),
                        (e.globalCompositeOperation = "destination-out"),
                        e.beginPath(),
                        e.arc(s, u, c, 0, 7),
                        e.fill(),
                        (e.globalCompositeOperation = "source-over"));
                    }
                  ((e.strokeStyle = "#7d7a4a"),
                    (e.lineWidth = 7),
                    (e.lineCap = "round"),
                    e.beginPath(),
                    e.moveTo(r, i + 2),
                    e.lineTo(r, a + 128 - 3),
                    e.stroke(),
                    (e.strokeStyle = "#96905c"),
                    (e.lineWidth = 3),
                    e.beginPath(),
                    e.moveTo(r, i + 2),
                    e.lineTo(r, a + 128 - 3),
                    e.stroke());
                })(u, e, t, c[a]),
              ),
              ((d = new a.CanvasTexture(h)).colorSpace = a.SRGBColorSpace),
              (d.anisotropy = 1),
              (d.generateMipmaps = !0),
              d),
            eL =
              (((f = document.createElement("canvas")).width = f.height = 128),
              (m = f.getContext("2d")).clearRect(0, 0, 128, 128),
              [
                [0, 0],
                [64, 0],
                [0, 64],
                [64, 64],
              ].forEach(([e, t], a) => {
                let o = 64 * (0.36 + (a % 2) * 0.06),
                  r = 64 * (0.78 + 0.08 * (a >> 1)),
                  n = e + 32,
                  i = t + 58.88,
                  l = m.createLinearGradient(0, i, 0, i - r);
                (l.addColorStop(0, a % 2 ? "#6b4d36" : "#7a5a40"),
                  l.addColorStop(0.55, "#8a7448"),
                  l.addColorStop(1, a >> 1 ? "#b5b060" : "#a8ad5a"),
                  (m.fillStyle = l),
                  m.beginPath(),
                  m.moveTo(n, i),
                  m.bezierCurveTo(n - 0.62 * o, i - 0.25 * r, n - 0.5 * o, i - 0.85 * r, n, i - r),
                  m.bezierCurveTo(n + 0.5 * o, i - 0.85 * r, n + 0.62 * o, i - 0.25 * r, n, i),
                  m.closePath(),
                  m.fill(),
                  (m.strokeStyle = "rgba(60,40,25,0.55)"),
                  (m.lineWidth = 1.2),
                  m.stroke(),
                  (m.fillStyle = "rgba(255,240,190,0.22)"),
                  m.beginPath(),
                  m.ellipse(n - 0.16 * o, i - 0.55 * r, 0.14 * o, 0.3 * r, 0, 0, 2 * Math.PI),
                  m.fill());
              }),
              ((p = new a.CanvasTexture(f)).colorSpace = a.SRGBColorSpace),
              (p.anisotropy = 1),
              (p.generateMipmaps = !0),
              p),
            eR = new a.ShaderMaterial({
              side: a.DoubleSide,
              uniforms: {
                map: { value: eT },
                uTime: T,
                uWind: V,
                uLag: E,
                uLand: O,
                uLandK: q,
                uInertia: { value: 1 },
                uNight: L,
                uDusk: R,
                uSunDir: { value: C },
                uSunCol: { value: B.clone().multiplyScalar(1.7) },
                uSkyCol: { value: D("#b8c9dc").multiplyScalar(0.64) },
                uGroundCol: { value: D("#6b7355").multiplyScalar(0.6) },
              },
              vertexShader: `
    attribute mat4 instanceMatrix;
    attribute vec3 aTint;
    attribute vec3 aWindI;      // phase, flex, flutter scale
    attribute vec2 aUvCell;     // which of the 4 atlas leaves this instance wears
    varying vec2 vUv; varying vec3 vTint; varying vec3 vN; varying vec3 vW;
    uniform float uTime, uWind, uInertia;
    ${F}
    void main() {
      vUv = uv * 0.5 + aUvCell; vTint = aTint;
      vec3 pos = position;
      vec3 nrm = normal;
      // flutter: hinge at the petiole (y = 0) — but EPISODIC, not constant.
      // Real aspen leaves mostly rest; individual leaves burst into trembling
      // as gust fronts travel through the canopy.
      vec3 org0 = instanceMatrix[3].xyz;
      float front = 0.70 + 0.30 * sin(uTime * 0.6 - (org0.x + org0.z) * 0.9 + aWindI.x * 0.4);
      float episode = sin(uTime * (0.45 + fract(aWindI.x * 0.618) * 0.5) + aWindI.x * 7.0);
      // activity SWELLS in across most of the cycle - no sudden wake-up tingle
      float burst = smoothstep(0.12, 0.95, episode * 0.5 + 0.5);
      float fl = uWind * (0.35 + 0.65 * aWindI.y) * aWindI.z
               * (0.30 + 0.70 * burst) * front;
      float ang = (sin(uTime * 3.1 + aWindI.x) * 0.45
                 + sin(uTime * 6.7 + aWindI.x * 1.7) * 0.25) * fl;
      // Inertia toggle: gust kick, overshoot, ringing settle - like a spring
      float tauI = fract((uTime * (0.45 + fract(aWindI.x * 0.618) * 0.5) + aWindI.x * 7.0) * 0.159155);
      float ringI = exp(-tauI * 3.2) * sin(tauI * 44.0 + aWindI.x);
      float angI = ringI * uWind * (0.35 + 0.65 * aWindI.y) * aWindI.z * front * 0.5;
      ang = mix(ang, angI, uInertia);
      // and a leaf is NEVER perfectly still: gentle ever-present breathing
      ang += sin(uTime * 1.6 + aWindI.x * 3.3) * 0.06 * uWind * (0.5 + 0.5 * aWindI.y);
      float ca = cos(ang), sa = sin(ang);
      pos = vec3(pos.x, ca * pos.y - sa * pos.z, sa * pos.y + ca * pos.z);
      nrm = vec3(nrm.x, ca * nrm.y - sa * nrm.z, sa * nrm.y + ca * nrm.z);
      vec4 wp = instanceMatrix * vec4(pos, 1.0);
      vec3 nw = normalize(mat3(instanceMatrix) * nrm);
      wp.xyz += windSway(instanceMatrix[3].xyz, aWindI.y, uTime, uWind);
      vW = wp.xyz; vN = nw;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
              fragmentShader: `
    uniform sampler2D map;
    uniform vec3 uSunDir, uSunCol, uSkyCol, uGroundCol;
    uniform float uNight, uDusk;
    varying vec2 vUv; varying vec3 vTint; varying vec3 vN; varying vec3 vW;
    void main() {
      vec4 tex = texture2D(map, vUv);
      if (tex.a < 0.5) discard;
      vec3 albedo = tex.rgb * vTint;
      vec3 N = normalize(vN);
      if (!gl_FrontFacing) {
        N = -N;
        // aspen-pale underside (kept subtle so shade stays shaded)
        albedo = albedo * vec3(1.18, 1.15, 1.06) + 0.03;
      }
      float ndl = dot(N, uSunDir);
      float diff = max(ndl, 0.0);
      float hemi = 0.5 + 0.5 * N.y;
      vec3 amb = mix(uGroundCol, uSkyCol, hemi);
      float trans = max(-ndl, 0.0);
      vec3 V = normalize(cameraPosition - vW);
      float spec = pow(max(dot(reflect(-uSunDir, N), V), 0.0), 24.0);
      vec3 col = albedo * (amb + uSunCol * diff)
               + albedo * uSunCol * trans * mix(vec3(1.0, 0.98, 0.55), vec3(0.75, 0.85, 1.0), uNight) * (mix(0.7, 0.35, uNight) + 0.35 * uDusk)
               + uSunCol * spec * mix(0.06, 0.14, uNight); // moonlight glints harder
      // sun-washed blades: strongly lit surfaces go LIGHTER and PALER,
      // like the cream highlights in the footage
      float energy = diff + trans * 0.7;
      float wash = smoothstep(0.55, 1.35, energy);
      float lumaW = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, vec3(lumaW) * 1.28 + 0.055, wash * 0.5 * (1.0 - uNight * 0.9));
      // pull toward the footage's muted khaki-olive
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(luma), col, mix(0.80, 0.55, uNight)); // moonlight drains colour
      col = mix(col, col * vec3(0.8, 0.9, 1.15), uNight * 0.6); // and what is left is blue
      gl_FragColor = vec4(col, 1.0);
    }
  `,
            }),
            eN = null,
            eP = null,
            eW = null,
            eG = null,
            eV = null,
            eE = { min: -1, max: 1, portrait: !1, cx: 0.62, zoom: 1, cy: 0 },
            eO = new a.Matrix4(),
            eq = new a.Vector3(),
            eU = new a.Vector3(),
            e_ = new a.Vector3(),
            eH = new a.Vector3(),
            ej = new a.Quaternion();
          function eK(e) {
            (eN && (M.remove(eN), eN.geometry.dispose()),
              eP && (M.remove(eP), eP.geometry.dispose()),
              eW && (M.remove(eW), eW.geometry.dispose(), (eW = null)));
            let t = (function (e) {
              let t = (function (e) {
                  let t = ey.map((t, a) => eM(t, a, e, 1, 2.2));
                  if (!ek(t)) {
                    let a = Math.tan((10.5 * Math.PI) / 180);
                    for (let o = 0; o < 6; o++) {
                      let r = (((e + 7919 * o) * 0x9e3779b1) >>> 0) / 0x100000000,
                        n = (((e + 99 + 104729 * o) * 0x9e3779b1) >>> 0) / 0x100000000,
                        i = 2.3 + 0.5 * n,
                        l = 1.78 * a * i,
                        s = [
                          (0.15 + 0.3 * r) * l,
                          0.183 * i + (eE.portrait ? -0.65 + (n - 0.5) * 0.2 : (n - 0.5) * 0.3) * a * i,
                          -i,
                        ],
                        h = [1.3 * l, s[1] + 0.1 + 0.25 * r, -i - 0.35 + 0.5 * n],
                        u = [s[0] - h[0], s[1] - h[1], s[2] - h[2]],
                        c = Math.hypot(u[0], u[1], u[2]),
                        d = eM(
                          {
                            origin: h,
                            rootDir: u.map((e) => e / c),
                            trunkLen: 1.7 * c,
                            trunkRadius: 0.012,
                            wobble: 0.22,
                            leafDensity: 0.7,
                            childrenByDepth: [3, 2, 1],
                          },
                          ey.length + 3 + o,
                          e,
                          1,
                          2.2,
                        );
                      if (ek([d]) || 5 === o) {
                        t.splice(ey.length - 1, 0, d);
                        break;
                      }
                    }
                  }
                  return t;
                })(e),
                a = (ex.has(e) || ex.set(e, -1), ex.get(e));
              (a < 0 && ((a = t.reduce((e, t) => e + t.anchors.length, 0)), ex.set(e, a)), (eb = a));
              let o = 0,
                r = 0;
              for (let e of t) ((o += e.positions.length / 3), (r += e.indices.length));
              let n = new Float32Array(3 * o),
                i = new Float32Array(3 * o),
                l = new Float32Array(3 * o),
                s = new Float32Array(o),
                h = new Float32Array(2 * o),
                u = new (o > 65535 ? Uint32Array : Uint16Array)(r),
                c = 0,
                d = 0,
                f = [];
              for (let e of t) {
                (n.set(e.positions, 3 * c),
                  i.set(e.normals, 3 * c),
                  l.set(e.colors, 3 * c),
                  s.set(e.flex, c),
                  h.set(e.uvs, 2 * c));
                for (let t = 0; t < e.indices.length; t++) u[d + t] = e.indices[t] + c;
                ((c += e.positions.length / 3), (d += e.indices.length), f.push(...e.anchors));
              }
              let { perch: m } = eS(t);
              return { pos: n, nor: i, col: l, flx: s, uv: h, ind: u, anchors: f, perch: m, parts: t };
            })(e);
            ((eV = eE.portrait
              ? (function (e) {
                  let t = null,
                    a = 0.62,
                    o = 1;
                  e: for (let r of [1, 1.15]) {
                    for (let n of [0.62, 0.7, 0.78, 0.54, 0.46, 0.86]) {
                      ((eE.zoom = r), (eE.cx = n), a7());
                      let i = eS(e);
                      if (
                        ((!t || i.pass < t.pass || (i.pass === t.pass && i.score < t.score)) &&
                          ((t = i), (a = n), (o = r)),
                        0 === i.pass)
                      )
                        break e;
                    }
                    if (t.pass <= 1) break;
                  }
                  return ((eE.zoom = o), (eE.cx = a), a7(), t.perch);
                })(t.parts)
              : t.perch),
              tW());
            let o = new a.BufferGeometry();
            (o.setAttribute("position", new a.BufferAttribute(t.pos, 3)),
              o.setAttribute("normal", new a.BufferAttribute(t.nor, 3)),
              o.setAttribute("color", new a.BufferAttribute(t.col, 3)),
              o.setAttribute("aFlex", new a.BufferAttribute(t.flx, 1)),
              o.setAttribute("uv", new a.BufferAttribute(t.uv, 2)),
              o.setIndex(new a.BufferAttribute(t.ind, 1)),
              ((eN = new a.Mesh(o, eF)).frustumCulled = !1),
              M.add(eN));
            let r = t.anchors.slice();
            {
              let t = e >>> 0 || 1,
                a = () => (t = (1664525 * t + 0x3c6ef35f) >>> 0) / 0x100000000;
              for (let e = r.length - 1; e > 0; e--) {
                let t = Math.floor(a() * (e + 1)),
                  o = r[e];
                ((r[e] = r[t]), (r[t] = o));
              }
            }
            let n = r.slice(0, Math.min(r.length, Math.round((0 * eb) / 2.2))),
              i = t.anchors;
            t.anchors = n;
            let l = t.anchors.length,
              s = new a.InstancedBufferGeometry(),
              h = (function () {
                let e = new a.PlaneGeometry(1, 1, 1, 2);
                e.translate(0, 0.5, 0);
                let t = e.attributes.position;
                for (let e = 0; e < t.count; e++) {
                  let a = t.getX(e),
                    o = t.getY(e);
                  t.setZ(e, -0.16 * o * o + 0.09 * Math.abs(a));
                }
                e.translate(0, 0.16, 0);
                let o = e.attributes.uv;
                for (let e = 0; e < o.count; e++) o.setY(e, 0.105 + 0.895 * o.getY(e));
                e.computeVertexNormals();
                let r = e.attributes.position.array,
                  n = e.attributes.normal.array,
                  i = e.attributes.uv.array,
                  l = e.index.array,
                  s = r.length / 3,
                  h = new a.BufferGeometry(),
                  u = new Float32Array(r.length + 12);
                (u.set(r), u.set([-0.02, 0, 0, 0.02, 0, 0, -0.014, 0.16, 0, 0.014, 0.16, 0], r.length));
                let c = new Float32Array(n.length + 12);
                (c.set(n), c.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], n.length));
                let d = new Float32Array(i.length + 8);
                (d.set(i), d.set([0.485, 0.01, 0.515, 0.01, 0.485, 0.095, 0.515, 0.095], i.length));
                let f = new Uint16Array(l.length + 6);
                return (
                  f.set(l),
                  f.set([s, s + 1, s + 2, s + 1, s + 3, s + 2], l.length),
                  h.setAttribute("position", new a.BufferAttribute(u, 3)),
                  h.setAttribute("normal", new a.BufferAttribute(c, 3)),
                  h.setAttribute("uv", new a.BufferAttribute(d, 2)),
                  h.setIndex(new a.BufferAttribute(f, 1)),
                  h
                );
              })();
            ((s.index = h.index),
              (s.attributes.position = h.attributes.position),
              (s.attributes.normal = h.attributes.normal),
              (s.attributes.uv = h.attributes.uv));
            let u = new Float32Array(16 * l),
              c = new Float32Array(3 * l),
              d = new Float32Array(3 * l),
              f = new Float32Array(2 * l),
              m = [
                [0, 0],
                [0.5, 0],
                [0, 0.5],
                [0.5, 0.5],
              ],
              p = new Float32Array(3 * l),
              v = new Float32Array(3 * l),
              g = new Float32Array(l);
            for (let e = 0; e < l; e++) {
              let a = t.anchors[e];
              (eU.set(a.out[0], a.out[1], a.out[2]).addScaledVector(eH.set(a.along[0], a.along[1], a.along[2]), 0.55),
                (eU.y += 0.05 - 0.6 * a.droop),
                eU.normalize(),
                eq.crossVectors(eU, eH.set(0, 1, 0)),
                1e-6 > eq.lengthSq() && eq.set(1, 0, 0),
                eq.normalize(),
                e_.crossVectors(eq, eU).normalize(),
                ej.setFromAxisAngle(eU, 0.8 * a.roll),
                e_.applyQuaternion(ej),
                p.set([eU.x, eU.y, eU.z], 3 * e),
                v.set([e_.x, e_.y, e_.z], 3 * e),
                (g[e] = a.size));
            }
            let y = new Float32Array(3 * l);
            for (let e = 0; e < l; e++) {
              let a = t.anchors[e];
              y.set([a.p[0], a.p[1], a.p[2]], 3 * e);
            }
            {
              let e = new Map(),
                t = (e, t, a) => e + "," + t + "," + a,
                a = new Float32Array(3 * l);
              for (let o = 0; o < l; o++) {
                let r = 0.094 * g[o] * 0.55;
                ((a[3 * o] = y[3 * o] + p[3 * o] * r),
                  (a[3 * o + 1] = y[3 * o + 1] + p[3 * o + 1] * r),
                  (a[3 * o + 2] = y[3 * o + 2] + p[3 * o + 2] * r));
                let n = t(
                  Math.round(a[3 * o] / 0.1034),
                  Math.round(a[3 * o + 1] / 0.1034),
                  Math.round(a[3 * o + 2] / 0.1034),
                );
                (e.has(n) || e.set(n, []), e.get(n).push(o));
              }
              for (let o = 0; o < 3; o++) {
                let r = 2 === o;
                for (let o = 0; o < l; o++) {
                  let n = Math.round(a[3 * o] / 0.1034),
                    i = Math.round(a[3 * o + 1] / 0.1034),
                    l = Math.round(a[3 * o + 2] / 0.1034);
                  for (let s = -1; s <= 1; s++)
                    for (let h = -1; h <= 1; h++)
                      for (let u = -1; u <= 1; u++) {
                        let c = e.get(t(n + s, i + h, l + u));
                        if (c)
                          for (let e of c) {
                            if (e <= o) continue;
                            let t = a[3 * e] - a[3 * o],
                              n = a[3 * e + 1] - a[3 * o + 1],
                              i = a[3 * e + 2] - a[3 * o + 2],
                              l = Math.hypot(t, n, i),
                              s = 0.1034 * (g[o] + g[e]) * 0.5;
                            if (l >= s) continue;
                            let h = 0.25 + 0.65 * (1 - l / s),
                              u =
                                v[3 * o] * v[3 * e] + v[3 * o + 1] * v[3 * e + 1] + v[3 * o + 2] * v[3 * e + 2] < 0
                                  ? -1
                                  : 1,
                              c = 0,
                              d = 0,
                              f = 0;
                            for (let t = 0; t < 3; t++) {
                              let a = v[3 * o + t],
                                r = v[3 * e + t];
                              ((v[3 * o + t] = a + r * u * h), (v[3 * e + t] = r + a * u * h));
                            }
                            let m = Math.hypot(v[3 * o], v[3 * o + 1], v[3 * o + 2]) || 1;
                            if (
                              ((c = v[3 * o] / m), (d = v[3 * o + 1] / m), (f = v[3 * o + 2] / m), r && l < 0.55 * s)
                            ) {
                              let a = t * c + n * d + i * f >= 0 ? 1 : -1,
                                r = Math.min(0.007, (0.55 * s - l) * 0.5);
                              for (let t = 0; t < 3; t++) {
                                let n = [c, d, f][t] * a * r;
                                ((y[3 * e + t] += n), (y[3 * o + t] -= n));
                              }
                              if (l < 0.3 * s) {
                                let t = g[o] < g[e] ? o : e;
                                g[t] = Math.max(0.5, 0.82 * g[t]);
                              }
                            }
                          }
                      }
                }
              }
            }
            for (let e = 0; e < l; e++) {
              let a,
                o = t.anchors[e];
              (eU.set(p[3 * e], p[3 * e + 1], p[3 * e + 2]),
                e_.set(v[3 * e], v[3 * e + 1], v[3 * e + 2]).normalize(),
                eq.crossVectors(eU, e_).normalize(),
                e_.crossVectors(eq, eU).normalize());
              let r = 0.094 * g[e],
                n = r * (0.85 + 0.3 * Math.random()),
                i = r * (0.7 + 0.9 * Math.random());
              (eO.makeBasis(eq.multiplyScalar(n), eU.multiplyScalar(r), e_.multiplyScalar(i)),
                eO.setPosition(y[3 * e], y[3 * e + 1], y[3 * e + 2]),
                u.set(eO.elements, 16 * e));
              let l = Math.random();
              a =
                l < 0.1 ? [1.14, 1.05, 0.7] : l < 0.48 ? [0.36, 0.41, 0.28] : l < 0.68 ? [0.62, 0.68, 0.5] : [1, 1, 1];
              let s = (0.85 + 0.35 * Math.random()) * (0.62 + 0.42 * o.flex) * 1;
              (c.set([a[0] * s, a[1] * s, a[2] * s], 3 * e),
                d.set([Math.random() * Math.PI * 2, o.flex, 0.5 + 0.55 * Math.random()], 3 * e),
                f.set(m[(4 * Math.random()) | 0], 2 * e));
            }
            let w = new a.InstancedBufferAttribute(u, 16);
            (s.setAttribute("instanceMatrix", w),
              s.setAttribute("aTint", new a.InstancedBufferAttribute(c, 3)),
              s.setAttribute("aWindI", new a.InstancedBufferAttribute(d, 3)),
              s.setAttribute("aUvCell", new a.InstancedBufferAttribute(f, 2)),
              (s.instanceCount = l),
              ((eP = new a.Mesh(s, eR)).frustumCulled = !1),
              M.add(eP),
              (function (e, t) {
                if (!e.length) return;
                eG || ((eG = eR.clone()).uniforms = Object.assign({}, eR.uniforms, { map: { value: eL } }));
                let o = (7 * t + 13) >>> 0 || 1,
                  r = () => (o = (1664525 * o + 0x3c6ef35f) >>> 0) / 0x100000000,
                  n = [],
                  i = Math.min(e.length, 1300) / e.length;
                for (let t of e) r() < i && n.push(t);
                let l = n.length,
                  s = new a.InstancedBufferGeometry(),
                  h = new a.PlaneGeometry(1, 1, 1, 1);
                (h.translate(0, 0.5, 0),
                  (s.index = h.index),
                  (s.attributes.position = h.attributes.position),
                  (s.attributes.normal = h.attributes.normal),
                  (s.attributes.uv = h.attributes.uv));
                let u = new Float32Array(16 * l),
                  c = new Float32Array(3 * l),
                  d = new Float32Array(3 * l),
                  f = new Float32Array(2 * l),
                  m = [
                    [0, 0],
                    [0.5, 0],
                    [0, 0.5],
                    [0.5, 0.5],
                  ];
                for (let e = 0; e < l; e++) {
                  let t = n[e];
                  (eU
                    .set(t.along[0], t.along[1], t.along[2])
                    .addScaledVector(eH.set(t.out[0], t.out[1], t.out[2]), 0.7)
                    .normalize(),
                    eq.crossVectors(eU, eH.set(0, 1, 0)),
                    1e-6 > eq.lengthSq() && eq.set(1, 0, 0),
                    eq.normalize(),
                    e_.crossVectors(eq, eU).normalize());
                  let a = 0.013 + 0.01 * r();
                  (eO.makeBasis(eq.multiplyScalar(0.55 * a), eU.multiplyScalar(a), e_.multiplyScalar(0.55 * a)),
                    eO.setPosition(t.p[0], t.p[1], t.p[2]),
                    u.set(eO.elements, 16 * e));
                  let o = 0.85 + 0.3 * r();
                  (c.set([o, o * (0.96 + 0.06 * r()), 0.9 * o], 3 * e),
                    d.set([r() * Math.PI * 2, t.flex, 0.15], 3 * e),
                    f.set(m[(4 * r()) | 0], 2 * e));
                }
                (s.setAttribute("instanceMatrix", new a.InstancedBufferAttribute(u, 16)),
                  s.setAttribute("aTint", new a.InstancedBufferAttribute(c, 3)),
                  s.setAttribute("aWindI", new a.InstancedBufferAttribute(d, 3)),
                  s.setAttribute("aUvCell", new a.InstancedBufferAttribute(f, 2)),
                  (s.instanceCount = l),
                  ((eW = new a.Mesh(s, eG)).frustumCulled = !1),
                  M.add(eW));
              })(i, e));
            let b = 0;
            for (let e of i) b += Math.hypot(e.p[0], e.p[1], e.p[2]);
            aW = Math.max(1.2, (b / Math.max(1, i.length)) * 0.92);
          }
          let eX = new a.Group();
          ((eX.visible = !1), M.add(eX));
          let eQ = [],
            eY = [0.3, 0.14, 0.06],
            eZ = !1,
            e$ = null,
            eJ = [],
            e0 = [],
            e1 = new a.TextureLoader(),
            e2 = (e, t) => {
              let o = e1.load(e, (e) => {
                try {
                  s.initTexture(e);
                } catch (e) {}
              });
              return ((o.flipY = !1), t && (o.colorSpace = a.SRGBColorSpace), (o.anisotropy = 4), o);
            },
            e3 = {
              map: e2(v("tit_diff.webp"), !0),
              normal: e2(v("tit_norm.webp"), !1),
              rough: e2(v("tit_rgh.webp"), !1),
            };
          function e5(e, t) {
            e.traverse((e) => {
              e.isMesh &&
                ((e.frustumCulled = !1),
                (e.material = new a.MeshStandardMaterial({
                  map: e3.map,
                  normalMap: e3.normal,
                  normalScale: new a.Vector2(0.45, 0.45),
                  roughnessMap: e3.rough,
                  roughness: 0.72,
                  metalness: 0,
                  alphaTest: 0.5,
                  side: a.DoubleSide,
                  emissive: new a.Color(0xffffff),
                  emissiveMap: e3.map,
                  emissiveIntensity: 0.18,
                })),
                e0.push(e.material),
                eg(ed.d, ed.n, ed.t),
                t < 1 && ((e.material.transparent = !0), (e.material.opacity = t), (e.material.depthWrite = !1)));
            });
            let o = new a.AnimationMixer(e),
              r = o.clipAction(e$.flap),
              n = o.clipAction(e$.perch),
              i = o.clipAction(e$.fold);
            return (
              r.play(),
              n.play(),
              i.play(),
              n.setEffectiveWeight(0),
              i.setEffectiveWeight(0),
              {
                root: e,
                mixer: o,
                flap: r,
                perch: n,
                fold: i,
                bones: (function (e) {
                  let t = { list: [], clean: [], cleanScale: [], rest: {} };
                  for (let a of tt) {
                    let o = e.getObjectByName(a);
                    o &&
                      (t.list.push(o),
                      t.clean.push(o.quaternion.clone()),
                      t.cleanScale.push(o.scale.clone()),
                      (t.rest[a] = o.quaternion.clone()),
                      (t[a] = o));
                  }
                  return t;
                })(e),
              }
            );
          }
          let e4 = [0, 0.085, 0.545];
          Promise.resolve(l.bird || v("tit.glb")).then((e) =>
            new o.GLTFLoader().load(e, (e) => {
              var t;
              let o,
                r,
                n,
                i = (t) => e.animations.find((e) => e.name.toLowerCase().includes(t)) || e.animations[0];
              for (let l of ((e$ = {
                flap: i("flap"),
                perch: i("perch"),
                fold: e.animations.find((e) => e.name.toLowerCase().includes("fold")) || i("perch"),
              }),
              e.scene.scale.setScalar(1.1 * (eE.portrait ? 0.82 : 1)),
              (t = e.scene),
              (o = new a.Vector3()),
              (r = new a.Vector3(...e4)),
              (n = new a.Vector3()),
              t.traverse((e) => {
                if (!e.isSkinnedMesh) return;
                let t = e.geometry.attributes.position,
                  i = e.geometry.attributes.skinIndex,
                  l = e.geometry.attributes.skinWeight,
                  s = e.skeleton.bones.map((e) => e.name);
                for (let e = 0; e < t.count; e++) {
                  let a = 0,
                    h = -1;
                  for (let t = 0; t < 4; t++) {
                    let o = l.getComponent(e, t);
                    o > h && ((h = o), (a = i.getComponent(e, t)));
                  }
                  let u = s[a];
                  if ((o.fromBufferAttribute(t, e), "body" === u || "head" === u)) {
                    let e = (o.z - 0.06) / (o.z < 0.06 ? 0.52 : 1),
                      t = Math.sqrt(Math.max(0.2, 1 - e * e));
                    ((o.x *= t), (o.y = 0.04 + (o.y - 0.04) * t));
                    let a = 0.55 * tP((o.z - 0.38) / 0.14),
                      i = o.z > 0.64 && 0.08 > Math.abs(o.x) && o.y > 0.05 && o.y < 0.17;
                    if (a > 0 && !i) {
                      n.copy(o).sub(r);
                      let e = n.length() || 1;
                      o.lerp(n.multiplyScalar(0.195 / e).add(r), a);
                    }
                  } else if ("tail" === u) {
                    let e = Math.max(0, (-0.218 - o.z) / 0.544);
                    ((o.z = -0.218 + (o.z - -0.218) * 0.85), (o.x *= 1 + (1.35 - 1) * e));
                  }
                  t.setXYZ(e, o.x, o.y, o.z);
                }
                t.needsUpdate = !0;
                let h = e.geometry;
                (h.setAttribute("normal", new a.BufferAttribute(new Float32Array(3 * t.count), 3)),
                  h.computeVertexNormals());
                let u = h.attributes.normal;
                for (let e = 0; e < u.count; e++)
                  0.5 > Math.hypot(u.getX(e), u.getY(e), u.getZ(e)) && u.setXYZ(e, 0, 1, 0);
                h.computeBoundingSphere();
              }),
              (function (e) {
                let t = new Map();
                e.traverse((e) => {
                  e.isSkinnedMesh && (t.has(e.skeleton) || t.set(e.skeleton, []), t.get(e.skeleton).push(e));
                });
                let o = new a.Matrix4(),
                  r = new a.Matrix4(),
                  n = new a.Vector3(),
                  i = new a.Vector3(),
                  l = new a.Vector3();
                for (let [e, s] of t) {
                  let t = e.bones.slice(),
                    h = e.boneInverses.map((e) => e.clone()),
                    u = s.map((e) => ({
                      mesh: e,
                      geo: e.geometry,
                      slotOf: new Int8Array(e.geometry.attributes.position.count),
                      dist: new Float32Array(e.geometry.attributes.position.count),
                    }));
                  for (let e of ["L", "R"]) {
                    let s = t.findIndex((t) => t.name === "wing" + e);
                    if (s < 0) continue;
                    let c = t[s];
                    (o.copy(h[s]).invert(), n.setFromMatrixPosition(o));
                    let d = 0;
                    for (let e of (i.copy(n), u)) {
                      let t = e.geo.attributes.position,
                        a = e.geo.attributes.skinIndex,
                        o = e.geo.attributes.skinWeight;
                      r.copy(e.mesh.bindMatrix);
                      for (let h = 0; h < t.count; h++) {
                        let u = -1;
                        for (let e = 0; e < 4; e++) a.getComponent(h, e) === s && o.getComponent(h, e) > 0 && (u = e);
                        if (((e.slotOf[h] = u), u < 0)) continue;
                        let c = (e.dist[h] = l.fromBufferAttribute(t, h).applyMatrix4(r).distanceTo(n));
                        o.getComponent(h, u) >= 0.5 && c > d && ((d = c), i.copy(l));
                      }
                    }
                    if (d < 1e-4) continue;
                    let f = new a.Bone();
                    ((f.name = "wrist" + e),
                      f.position.copy(l.copy(n).lerp(i, 0.5).applyMatrix4(h[s])),
                      c.add(f),
                      c.updateMatrixWorld(!0),
                      t.push(f),
                      h.push(o.multiply(f.matrix).clone().invert()));
                    let m = t.length - 1;
                    for (let e of u) {
                      let t = e.geo.attributes.skinIndex,
                        a = e.geo.attributes.skinWeight;
                      for (let o = 0; o < e.slotOf.length; o++) {
                        let r = e.slotOf[o];
                        if (r < 0) continue;
                        let n = tP((e.dist[o] / d - 0.39) / 0.22);
                        if (n <= 0) continue;
                        let i = a.getComponent(o, r),
                          l = -1;
                        for (let e = 0; e < 4; e++)
                          if (e !== r && 0 === a.getComponent(o, e)) {
                            l = e;
                            break;
                          }
                        if (l < 0) {
                          n > 0.5 && t.setComponent(o, r, m);
                          continue;
                        }
                        (a.setComponent(o, r, i * (1 - n)), t.setComponent(o, l, m), a.setComponent(o, l, i * n));
                      }
                      ((t.needsUpdate = !0), (a.needsUpdate = !0));
                    }
                  }
                  let c = new a.Skeleton(t, h);
                  for (let e of s) e.bind(c, e.bindMatrix);
                }
              })(e.scene),
              eX.add(e.scene),
              eJ.push(e5(e.scene, 1)),
              eY)) {
                let t = new a.Group(),
                  o = (function (e) {
                    let t = new Map(),
                      a = new Map(),
                      o = e.clone(),
                      r = (e, t, a) => {
                        a(e, t);
                        for (let o = 0; o < e.children.length; o++) r(e.children[o], t.children[o], a);
                      };
                    return (
                      r(e, o, (e, o) => {
                        (t.set(o, e), a.set(e, o));
                      }),
                      o.traverse((e) => {
                        if (!e.isSkinnedMesh) return;
                        let o = t.get(e);
                        ((e.skeleton = o.skeleton.clone()),
                          e.bindMatrix.copy(o.bindMatrix),
                          (e.skeleton.bones = o.skeleton.bones.map((e) => a.get(e))),
                          e.bind(e.skeleton, e.bindMatrix));
                      }),
                      o
                    );
                  })(e.scene);
                (t.add(o), (t.visible = !1), M.add(t), eQ.push(t), eJ.push(e5(o, l)));
              }
              let l = eX.visible;
              for (let e of ((eX.visible = !0), eQ)) e.visible = !0;
              try {
                s.compile(M, k);
              } catch (e) {}
              for (let e of ((eX.visible = l), eQ)) e.visible = !1;
              eZ = !0;
            }),
          );
          let e6 = 0.9,
            e8 = new a.Quaternion(),
            e9 = new a.Vector3(1, 0, 0),
            e7 = new a.Vector3(0, 1, 0),
            te = new a.Vector3(0, 0, 1),
            tt = ["wingL", "wingR", "wristL", "wristR", "tail", "head", "legs"],
            ta = 1,
            to = new a.Quaternion(),
            tr = (e, t, a) => e.quaternion.multiply(e8.setFromAxisAngle(t, a));
          function tn(e, t, a, o = 0) {
            let r = Math.min(1, t + o * (1 - t));
            (e.flap.setEffectiveWeight(1 - r), e.perch.setEffectiveWeight(t), e.fold.setEffectiveWeight(o * (1 - t)));
            e.flap.time = (((0.52 * a) % 1.04) + 1.04) % 1.04;
            let n = e.bones;
            for (let e = 0; e < n.list.length; e++)
              (n.list[e].quaternion.copy(n.clean[e]), n.list[e].scale.copy(n.cleanScale[e]));
            e.mixer.update(0);
            for (let e = 0; e < n.list.length; e++)
              (n.clean[e].copy(n.list[e].quaternion), n.cleanScale[e].copy(n.list[e].scale));
            let i = 0.07 * Math.sin(7.31 * Math.floor(a) + 1.7) * (1 - r),
              l = Math.min(1, Math.max(0, (1 - e6) * (1 - r) + i));
            return (
              l > 0.001 &&
                (n.wingL && n.wingL.quaternion.slerp(n.rest.wingL, l),
                n.wingR && n.wingR.quaternion.slerp(n.rest.wingR, l)),
              n.tail && (n.tail.scale.x = 1 + 1.5 * ti * (1 - t)),
              n.legs &&
                (n.legs.quaternion.slerpQuaternions(
                  n.rest.legs,
                  to.copy(n.rest.legs).multiply(e8.setFromAxisAngle(e9, 0.96)),
                  1 - ta,
                ),
                n.legs.scale.setScalar(0.55 + 0.8 * ta)),
              (1 - r) * e6
            );
          }
          let ti = 0;
          function tl(e, t, a, o, r) {
            let n = 0.7 * t[0] + 0.5 * t[2] + 0.3 * t[1] - 0.6 * a * E.value,
              i = Math.sin(1.05 * o + n),
              l = Math.sin(2.3 * o + 1.6 * n + 1.3),
              s = Math.sin(4.7 * o + 2.9 * n + 4.1) * a * a,
              h = r * a * a * (0.35 + 0.65 * a),
              u = (0.58 * i + 0.24 * l + 0.07 * s) * h * 0.085,
              c = o - O.value.w,
              d = t[0] - O.value.x,
              f = t[1] - O.value.y,
              m = t[2] - O.value.z,
              p = Math.sqrt(d * d + f * f + m * m),
              v = 1 - Math.min(1, Math.max(0, p / 0.9)) ** 2 * (3 - 2 * Math.min(1, p / 0.9)),
              g = q.value,
              y = c > 0 && c < 3 ? -Math.sin(c * g.y) * Math.exp(-c * g.z) * g.x * (0.3 + 0.7 * a) * v : 0;
            return (e.set(0.72 * u, 0.18 * u + (0.45 * l + 0.15 * s) * h * 0.028 + y, 0.55 * u), e);
          }
          let ts = "away",
            th = 0,
            tu = 0,
            tc = 0,
            td = 0,
            tf = 0,
            tm = 0,
            tp = 0,
            tv = 0,
            tg = () => ("in" === ts ? 9 : "out" === ts ? 12 : tw),
            ty = 0,
            tw = 10,
            tb = 0,
            tx = [];
          function tM(e) {
            tx = [];
            let t = 0,
              a = 0;
            for (eE.portrait, tb = 0; t < e + 2;) {
              let e = 24 + Math.floor(17 * Math.random()),
                o = e / tw,
                r = 0.09 + 0.07 * Math.random();
              (tx.push({ t0: t, on: o, off: r, beats: e, beat0: a }), (t += o + r), (a += e));
            }
          }
          let tk = () => ({ flapW: 1, beat: 0, y: 0, burst: 0 }),
            tS = tk(),
            tD = tk();
          function tC(e, t = tS) {
            tx.length || tM(6);
            let a = tx[tx.length - 1];
            for (let t of tx)
              if (e >= t.t0) a = t;
              else break;
            let o = e - a.t0,
              r = o < a.on,
              n = r ? o / a.on : Math.min(1, (o - a.on) / a.off);
            return (
              (t.flapW = Math.min(tP((o + 0.02) / 0.11), tP((a.on + 0.05 - o) / 0.16))),
              (t.beat = a.beat0 + (r ? n * a.beats : a.beats)),
              (t.y = r ? -Math.cos(n * Math.PI) : Math.cos(n * Math.PI)),
              (t.burst = r ? Math.sin(n * Math.PI) : 0),
              t
            );
          }
          let tz = 0,
            tA = 1,
            tB = 1,
            tI = new a.Vector3(),
            tF = new a.Vector3(),
            tT = new a.Vector3(),
            tL = new a.Vector3(),
            tR = new a.Vector3(),
            tN = new a.Vector3(),
            tP = (e) => (e = Math.min(1, Math.max(0, e))) * e * (3 - 2 * e);
          function tW() {
            for (let e of ((ts = "away"), (eX.visible = !1), eQ)) e.visible = !1;
            td = T.value + (T.value < 1 ? 3 : 14 + 20 * Math.random());
          }
          function tG() {
            let e = 3.55 * Math.tan((10.5 * Math.PI) / 180),
              t = eE.portrait ? 0.25 + 0.15 * Math.random() : 0.9 + 0.5 * Math.random(),
              a = 3.55 - (t < 0 ? -(0.5 * t) : 0),
              o = (e) => 0.183 * a + Math.tan((10.5 * Math.PI) / 180) * a * ((eE.portrait ? e / eE.zoom : e) + eE.cy),
              r = ea.material.uniforms.uShelterA.value,
              n = r.w > r.y ? r.y - 0.015 : 0,
              i = !eE.portrait && n - 0.13 >= 0.06,
              l = o(eE.portrait ? -0.24 : i ? 1 - 2 * n : 0.14),
              s = o(eE.portrait ? 0.1 : i ? 1 - 2 * (0.13 + 0.4 * (n - 0.13)) : 0.52),
              h = o(eE.portrait ? 0.14 : i ? 0.74 : 0.58),
              u = l + Math.random() * (s - l),
              c = l + Math.random() * (s - l),
              d = ((eE.max - eE.min) / 2) * e * (16 / 9),
              f = eE.portrait ? d : e * (eE.w / eE.h),
              m = eE.portrait ? ((eE.min + eE.max) / 2) * e * (16 / 9) : 0,
              p = f + (eE.portrait ? 0.35 : 0.5),
              v =
                (0.5 > Math.random() ? 1 : -1) * (eE.portrait ? 0.45 + 0.2 * Math.random() : 0.9 + 0.5 * Math.random());
            (tI.set(m - p, u, -3.55 - v / 2 + (Math.random() - 0.5) * 0.2),
              tT.set(m + p, c, tI.z + v),
              tF.copy(tI).lerp(tT, 0.4 + 0.2 * Math.random()),
              (tF.y = Math.min(tF.y + 0.04 + 0.12 * Math.random(), h)),
              (tF.z += -t),
              (tz = 6.28 * Math.random()),
              (tA = 0.8 + 0.5 * Math.random()),
              t$(),
              tM(6),
              (ts = "cross"),
              (tu = tX / (eE.portrait ? 1.5 : 3)),
              (th = 0),
              (eX.visible = !0),
              (tv = 0));
          }
          function tV(e, t) {
            ((ts = "perched"),
              (eX.visible = !0),
              (tv = 1),
              (ar = 0),
              (at = null),
              (ao = 0),
              (aa = e + t),
              (tc = e + 12 + 14 * Math.random()),
              (tf = e + 1.5),
              (tm = 0),
              (tp = 0));
          }
          let tE = 0.42,
            tO = -1,
            tq = new a.Quaternion(),
            tU = new a.Quaternion(),
            t_ = new a.Quaternion(),
            tH = new a.Object3D();
          function tj() {
            if (!eV) return;
            ((tO = -1),
              ai(tI),
              (at = null),
              (ao = 0),
              tF.set(tI.x + 1.1 * tO, tI.y + 0.12 + 0.06 * Math.random(), tI.z + 0.2));
            let e = tI.z - 1.4 - 0.4 * Math.random(),
              t = -e,
              a = eE.min * Math.tan((10.5 * Math.PI) / 180) * t * (16 / 9);
            (tT.set(Math.min(tI.x - 2.6, a - 0.6), tI.y + 0.75 + 0.2 * Math.random(), e),
              (tz = 6.28 * Math.random()),
              (tA = 0.8 + 0.5 * Math.random()),
              t$(),
              tM(4),
              (ts = "out"),
              (tu = 2),
              (th = 0),
              tq.copy(eX.quaternion),
              tH.position.copy(eX.position),
              tH.lookAt(tI.x + +tO, tI.y + 0.02, tI.z + 0.22),
              tH.rotateX(-0.3),
              tU.copy(tH.quaternion),
              (tE = tO < 0 ? 0.42 : 0.68));
          }
          let tK = new Float32Array(65),
            tX = 1,
            tQ = new a.Vector3(),
            tY = new a.Vector3();
          function tZ(e, t) {
            let a = 1 - t;
            return e.set(
              a * a * tI.x + 2 * a * t * tF.x + t * t * tT.x,
              a * a * tI.y + 2 * a * t * tF.y + t * t * tT.y,
              a * a * tI.z + 2 * a * t * tF.z + t * t * tT.z,
            );
          }
          function t$() {
            let e = 0;
            ((tK[0] = 0), tZ(tQ, 0));
            for (let t = 1; t <= 64; t++) (tZ(tY, t / 64), (e += tY.distanceTo(tQ)), (tK[t] = e), tQ.copy(tY));
            tX = e || 1;
            for (let e = 1; e <= 64; e++) tK[e] /= tX;
          }
          let tJ = new a.Quaternion(),
            t0 = 0,
            t1 = -10,
            t2 = 0,
            t3 = -10;
          function t5(e, t, a, o) {
            return (
              e
                .set(2 * t - 1, -(2 * a - 1), 0.5)
                .unproject(k)
                .sub(k.position)
                .normalize()
                .multiplyScalar(o)
                .add(k.position),
              e
            );
          }
          function t4() {
            if (!eV || !eZ) return;
            (tT.fromArray(eV.p), (tT.y += 0.004), ac.set(tT.x, tT.y, tT.z).project(k));
            let e = (ac.x + 1) / 2,
              t = (1 - ac.y) / 2,
              a = tT.distanceTo(k.position);
            (t5(tI, 1.1, Math.min(0.96, t + 0.17 + 0.06 * Math.random()), a + 1.1 + 0.3 * Math.random()),
              t5(
                tF,
                Math.min(0.98, e + 0.1 + 0.03 * Math.random()),
                Math.min(0.97, t + 0.1 + 0.03 * Math.random()),
                a + 0.3,
              ),
              (tz = 6.28 * Math.random()),
              (tA = 0.8 + 0.5 * Math.random()),
              t$(),
              tH.position.copy(tT),
              tH.lookAt(tT.x - 1, tT.y + 0.02, tT.z + 0.22),
              tH.rotateX(-0.3),
              tJ.copy(tH.quaternion),
              (ts = "in"),
              (tu = 1.5),
              (th = 0),
              (t0 = 0),
              (eX.visible = !0),
              (tv = 0));
          }
          function t6(e, t, a) {
            return (
              tZ(
                e,
                (function (e) {
                  if (e <= 0) return 0;
                  if (e >= 1) return 1;
                  let t = 0,
                    a = 64;
                  for (; a - t > 1;) {
                    let o = (t + a) >> 1;
                    tK[o] <= e ? (t = o) : (a = o);
                  }
                  let o = tK[a] - tK[t];
                  return (t + (o > 1e-9 ? (e - tK[t]) / o : 0)) / 64;
                })(t),
              ),
              a && (e.y += tb * a.y * ty),
              e
            );
          }
          let t8 = 0.016,
            t9 = 0,
            t7 = 0;
          function ae(e, t, a, o, r, n) {
            let i = Math.min(
                1,
                Math.max(
                  0,
                  a +
                    (0.022 * Math.sin(1.1 * n * tA + tz) * tB +
                      ("in" === ts ? 0 : 0.0015 * Math.sin(2 * o * Math.PI - 1.2))) +
                    (r ? 0 * r.y * ty : 0),
                ),
              ),
              l = r && tb > 0 ? tC(n + 0.02 * tu, tD) : r;
            (t6(tL, i, r),
              t6(tR, Math.min(1, i + 0.02), l),
              r && tb > 0 && (tR.y -= tb * (l.y - r.y) * ty * 0.55),
              (tL.z += 0),
              (tR.z += 0 + 0.03 * Math.cos(1.4 * n + tz) * 0.6 * tB),
              (tL.y += 0),
              (tR.y += 0),
              e.position.copy(tL),
              tR.distanceToSquared(tL) > 1e-9 && e.lookAt(tR),
              t6(_, Math.min(1, i + 0.06), l),
              (_.z += 0),
              (_.y += 0),
              H.copy(_).sub(tR),
              au.copy(e.quaternion).invert(),
              H.applyQuaternion(au));
            let s = Math.max(-0.26, Math.min(0.26, -(5 * (H.lengthSq() > 1e-9 ? Math.atan2(H.x, H.z) : 0)))) * (1 - t7);
            (e === eX && (t9 += (s - t9) * (1 - Math.exp(-(6 * (t8 || 0.016))))),
              e.rotateZ((e === eX ? t9 : s) + ("cross" === ts ? 0.06 : 0.05) * Math.sin(1.4 * n * tA + tz) * tB));
            let h = r ? 0.012 * r.burst * ty : 0,
              u = ((o % 1) + 1) % 1;
            (e.rotateX(-h + 0.025 * Math.sin((u - 0.23) * 2 * Math.PI) * (1 - tv)),
              "in" !== ts && (e.position.y += 0.0025 * Math.sin(2 * o * Math.PI - 0.6)));
            let c = tn(t, tv, o, r ? 0.55 * (1 - r.flapW) * ty : 0);
            if (r) {
              var d, f;
              let a;
              (!(function (e, t, a) {
                if (a <= 0.001) return;
                let o = e.bones,
                  r = o.wingL,
                  n = o.wingR;
                if (!r || !n) return;
                let i = Math.cos((t - 0.23 - 0.25) * 2 * Math.PI),
                  l = Math.max(0, -i),
                  s = (i > 0 ? -0.14 * i : 0.3 * l) * a,
                  h = 0.3 * l * a;
                if ((tr(r, te, s), tr(r, e7, h), tr(n, te, -s), tr(n, e7, -h), o.wristL && o.wristR)) {
                  let e = l * l * 0.62 * a,
                    r = 0.35 * l * a,
                    n = 0.3 * Math.sin((t - 0.23) * 2 * Math.PI) * a;
                  (tr(o.wristL, te, e), tr(o.wristL, e9, n - r), tr(o.wristR, te, -e), tr(o.wristR, e9, n - r));
                }
              })(t, (t.flap.time % 0.52) / 0.52, c),
                (d = e === eX ? t9 : s),
                (f = 1 - t7),
                (a = t.bones),
                !(f <= 0.001) &&
                  (a.head && tr(a.head, e7, -(0.65 * d) * f),
                  a.tail && (tr(a.tail, e9, -(0.5 * h) * f), tr(a.tail, te, 0.6 * d * f))));
            } else t.bones.head && t7 > 0 && tr(t.bones.head, e9, 0.55 * t7);
          }
          let at = null,
            aa = 0,
            ao = 0,
            ar = 0,
            an = new a.Vector3();
          function ai(e) {
            return (e.fromArray(eV.p), ar && eV.along && e.addScaledVector(an.fromArray(eV.along), ar), e);
          }
          function al(e) {
            return (ai(e), (e.x -= 1), (e.y += 0.02), (e.z += 0.22), e);
          }
          let as = 0,
            ah = 0,
            au = new a.Quaternion(),
            ac = new a.Vector3(),
            ad = new a.Vector3(),
            af = !1,
            am = !1,
            ap = () => {
              ((af = !0), x || ("perched" === ts && (tc = 1 / 0)));
            },
            av = () => {
              !af ||
                ((af = !1),
                x ||
                  ("perched" === ts
                    ? (tc = T.value + 12 + 14 * Math.random())
                    : "away" === ts
                      ? t4()
                      : "in" !== ts && (am = !0)));
            },
            ag = !0,
            ay = null;
          ("u" > typeof IntersectionObserver &&
            (ay = new IntersectionObserver(
              (e) => {
                for (let t of e)
                  ((ag = t.isIntersecting), t.intersectionRatio < 0.15 ? ap() : t.intersectionRatio > 0.6 && av());
              },
              { threshold: [0, 0.1, 0.15, 0.6, 0.7] },
            )).observe(e),
            y(document, "visibilitychange", () => {
              document.hidden ? ap() : av();
            }),
            y(window, "blur", ap),
            y(window, "focus", av));
          let aw = 0;
          y(
            window,
            "wheel",
            (e) => {
              (aw = Math.max(0, Math.min(1400, aw + e.deltaY))) > 800 ? ap() : aw < 120 && av();
            },
            { passive: !0 },
          );
          let ab = null,
            ax = null,
            aM = null,
            ak = null,
            aS = null,
            aD = !1,
            aC = 100,
            az = new a.ShaderMaterial({
              uniforms: { tSrc: { value: null } },
              transparent: !0,
              depthTest: !1,
              depthWrite: !1,
              blending: a.CustomBlending,
              blendSrc: a.OneFactor,
              blendDst: a.OneMinusSrcAlphaFactor,
              blendSrcAlpha: a.OneFactor,
              blendDstAlpha: a.OneMinusSrcAlphaFactor,
              vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
              fragmentShader:
                "precision highp float; varying vec2 vUv; uniform sampler2D tSrc; void main() { gl_FragColor = texture2D(tSrc, vUv); }",
            }),
            aA = `
  vec4 finite4(vec4 v) {
    uvec4 b = floatBitsToUint(v);
    uvec4 keep = (uvec4(1u) - uvec4(equal(b & uvec4(0x7F800000u), uvec4(0x7F800000u)))) * uvec4(0xFFFFFFFFu);
    return uintBitsToFloat(b & keep);
  }
`,
            aB = "",
            aI = (e, t, a) => {
              for (let o = 0; o < e; o++) {
                let r = (o / e) * Math.PI * 2 + a,
                  n = (Math.cos(r) * t).toFixed(4),
                  i = (Math.sin(r) * t).toFixed(4);
                aB += `{
      vec2 uv2 = vUv + (ROT * vec2(${n}, ${i})) * uRadNow * uTexel;
      vec4 s = texture2D(tSrc, uv2);
      s.rgb *= 1.0 + smoothstep(1.15, 2.6, dot(s.rgb, vec3(0.3333))) * 0.7;
      accum += vec4(s.rgb * s.a, s.a);
    }
`;
              }
            };
          (aI(1, 0, 0),
            aI(5, 0.16, 0.7),
            aI(8, 0.38, 0.3),
            aI(10, 0.55, 0.5),
            aI(12, 0.72, 0),
            aI(20, 0.87, 0.4),
            aI(16, 1, 0.15));
          let aF = new a.ShaderMaterial({
              depthTest: !1,
              depthWrite: !1,
              uniforms: {
                tSrc: { value: null },
                uTexel: { value: new a.Vector2() },
                uRadNow: { value: 0 },
                uMaxCoC: { value: 36 },
                uBgCap: { value: 10 },
                uFgBlur: { value: 0 },
                uBgBlur: { value: 10 },
                uExposure: { value: 1 },
                uGrain: { value: 0.028 },
                uNear: { value: 0.1 },
                uFar: { value: 700 },
                uFocus: { value: 2.4 },
                uCocScale: { value: 96 },
              },
              vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
              fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tSrc;
    uniform vec2 uTexel;
    uniform float uRadNow;
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    void main() {
      float kang = hash12(vUv * 517.3) * 6.28318;
      float kc = cos(kang), ks = sin(kang);
      mat2 ROT = mat2(kc, ks, -ks, kc);
      vec4 accum = vec4(0.0);
      ${aB}
      gl_FragColor = accum / 72.0;
    }
  `,
            }),
            aT = new a.ShaderMaterial({
              depthTest: !1,
              depthWrite: !1,
              uniforms: {
                tFol: { value: null },
                tFolB: { value: null },
                tSky: { value: null },
                tSkyB: { value: null },
                uFgBlur: aF.uniforms.uFgBlur,
                uBgBlur: aF.uniforms.uBgBlur,
                uExposure: aF.uniforms.uExposure,
                uTime: T,
                uGrain: aF.uniforms.uGrain,
                uGrainT: { value: 0.37 },
                uWrap: { value: 1 },
                uGlow: { value: 1 },
                uCA: { value: 0 },
                uNight: L,
                uDusk: R,
              },
              vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
              fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tFol, tFolB, tSky, tSkyB;
    uniform float uFgBlur, uBgBlur, uExposure, uTime, uGrain, uGrainT, uWrap, uGlow, uCA, uNight, uDusk;
    vec3 aces(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    ${aA}
    vec4 caTex(sampler2D t, vec2 uv, vec2 off) {
      return finite4(vec4(texture2D(t, uv + off).r, texture2D(t, uv).g,
                          texture2D(t, uv - off).b, texture2D(t, uv).a));
    }
    void main() {
      // Lens toggle: chromatic fringing grows toward the frame edges
      vec2 caOff = (vUv - 0.5) * uCA * 0.0011;
      float kF = smoothstep(0.25, 1.4, uFgBlur);
      float kB = smoothstep(0.25, 1.4, uBgBlur);
      vec3 bgS = caTex(tSky, vUv, caOff).rgb;
      vec4 bgB = caTex(tSkyB, vUv, caOff);
      vec3 bg = mix(bgS, bgB.rgb / max(bgB.a, 1e-4), kB);
      vec4 fS = caTex(tFol, vUv, caOff);
      vec4 fB = caTex(tFolB, vUv, caOff);
      vec3 folCol = mix(fS.rgb, fB.rgb / max(fB.a, 1e-4), kF);
      float folA = mix(fS.a, fB.a, kF);
      // Wrap toggle: bright sky optically bleeds over sharp silhouettes
      folCol += bg * (uWrap * (1.0 - kF) * 0.55 * clamp(1.0 - fB.a, 0.0, 1.0));
      vec3 col = mix(bg, folCol, clamp(folA, 0.0, 1.0));
      // Finish toggle: gentle glow from the brightest content (moon, glints)
      vec3 glowSrc = max(bgB.rgb / max(bgB.a, 1e-4) - 1.15, 0.0)
                   + max(fB.rgb / max(fB.a, 1e-4) - 1.15, 0.0);
      col += glowSrc * 0.30 * uGlow;
      col = aces(col * uExposure);
      // half-step red trim: the day sky lands exactly on #648BBA; night lifts blue instead
      col = col * 0.972 + mix(vec3(0.0074, 0.006, 0.006), vec3(0.0, 0.0015, 0.006), uNight)
          + uDusk * vec3(0.005, 0.002, 0.0); // sunset: a whisper of warmth, nothing more
      float d2 = distance(vUv, vec2(0.5));
      col *= 1.0 - smoothstep(0.42, 0.86, d2) * mix(0.15, 0.20, uNight); // a touch heavier at night, but not so much that the low corners lose their silhouettes
      float g = hash12(vUv * 913.0 + uGrainT * 517.0) - 0.5; // the grain re-seeds each frame (frozen under reduced motion)
      // grain, but not in the blacks: added flat, it pushed near-black pixels below zero, and the clamp then flipped them
      // between black and dark grey at random - a speckle of hard squares over anything dark (the bird's black head,
      // blurred to a soft blob, drew as a cloud of black squares). Film grain is multiplicative in the darks anyway
      col += g * uGrain * (1.0 - uNight * 0.45) * (0.15 + 0.85 * smoothstep(0.0, 0.1, dot(col, vec3(0.333))));
      gl_FragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), 1.0);
    }
  `,
            }),
            aL = new a.Scene(),
            aR = new a.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            aN = new a.Mesh(new a.PlaneGeometry(2, 2), aF);
          function aP(e) {
            (s.setRenderTarget(ax),
              s.setClearColor(0, 1),
              s.render(eo, k),
              ee.value > 0.001 &&
                (s.setRenderTarget(aS),
                ea.material.uniforms.uRes.value.set(aS.width, aS.height),
                s.setClearColor(0, 0),
                s.clear(),
                s.render(er, k),
                (az.uniforms.tSrc.value = aS.texture),
                (aN.material = az),
                s.setRenderTarget(ax),
                (s.autoClear = !1),
                s.render(aL, aR),
                (s.autoClear = !0)),
              s.setRenderTarget(ab),
              s.setClearColor(0, 0),
              s.render(M, k),
              (aN.material = aF),
              (aF.uniforms.tSrc.value = ab.texture),
              (aF.uniforms.uRadNow.value = aF.uniforms.uFgBlur.value),
              s.setRenderTarget(aM),
              s.render(aL, aR),
              (aF.uniforms.tSrc.value = ax.texture),
              (aF.uniforms.uRadNow.value = aF.uniforms.uBgBlur.value),
              s.setRenderTarget(ak),
              s.render(aL, aR),
              (aT.uniforms.tFol.value = ab.texture),
              (aT.uniforms.tFolB.value = aM.texture),
              (aT.uniforms.tSky.value = ax.texture),
              (aT.uniforms.tSkyB.value = ak.texture),
              (aN.material = aT),
              s.setRenderTarget(e),
              s.render(aL, aR));
          }
          aL.add(aN);
          let aW = 2.4,
            aG = Y.length();
          function aV(e, t, a) {
            (Y.set(e, t, a), J.position.copy(Y));
            let o = Y.clone().normalize();
            for (let e of [Z.material, J.material, ea.material])
              e.uniforms.uMoonDir && e.uniforms.uMoonDir.value.copy(o);
            (el.copy(o), eh.sunDir.copy(o));
          }
          let aE = 1 / aG,
            aO = 1 / aG;
          y(b, "click", (t) => {
            if (x) return;
            let a = e.getBoundingClientRect();
            "perched" === ts ? a6(t.clientX - a.left, t.clientY - a.top) && tj() : "away" === ts && tG();
          });
          let aq = e.clientWidth < e.clientHeight,
            aU = (aq ? l.seeds?.mobile : l.seeds?.desktop) || (aq ? i : n),
            a_ = l.seed || aU[Math.floor(Math.random() * aU.length)],
            aH = !x,
            aj = 1,
            aK = !0,
            aX = document.createElement("div");
          ((aX.className = w.looks), aX.setAttribute("role", "group"), aX.setAttribute("aria-label", "Time of day"));
          let aQ = {};
          for (let [e, t, a] of [
            ["day", "Noon", "#7ea9de"],
            ["night", "Night", "#1a2237"],
            ["morning", "Morning", "#dcc4b3"],
          ]) {
            let o = document.createElement("button");
            ((o.type = "button"),
              (o.className = w.look),
              o.style.setProperty("--sw", a),
              (o.title = t),
              o.setAttribute("aria-label", t),
              (o.textContent = t),
              aX.appendChild(o),
              (aQ[e] = o));
          }
          !1 !== l.looks && e.appendChild(aX);
          let aY = "day";
          function aZ(e) {
            for (let t in (aQ[e] || (e = "day"),
            (aY = e),
            (ef.d = 0),
            (ef.n = +("night" === e)),
            (ef.t = +("morning" === e)),
            aQ))
              aQ[t].classList.toggle(w.on, t === e);
            l.onLook && l.onLook(e);
          }
          for (let e in aQ) aQ[e].addEventListener("click", () => aZ(e));
          let a$ = 0,
            aJ = 0,
            a0 = 0,
            a1 = 0,
            a2 = -1,
            a3 = -1;
          y(window, "pointermove", (t) => {
            let a = e.getBoundingClientRect();
            a.width &&
              a.height &&
              ((a0 = ((t.clientX - a.left) / a.width) * 2 - 1),
              (a1 = ((t.clientY - a.top) / a.height) * 2 - 1),
              (a2 = t.clientX - a.left),
              (a3 = t.clientY - a.top));
          });
          let a5 = new a.Vector3();
          function a4() {
            return (
              a5.copy(eX.position),
              (a5.y += 0.045),
              a5.project(k),
              [((a5.x + 1) / 2) * eE.w, ((1 - a5.y) / 2) * eE.h]
            );
          }
          function a6(e, t) {
            if (!eX.visible || e < 0) return !1;
            let [a, o] = a4(),
              r = Math.max(0.5, eX.position.distanceTo(k.position)),
              n = Math.max(
                32,
                0.06 * ((eE.h / (2 * Math.tan(((k.fov / 2) * Math.PI) / 180) * r)) * (eE.portrait ? eE.zoom : 1)) + 6,
              );
            return a5.z < 1 && Math.hypot(a - e, o - t) < n;
          }
          let a8 = { w: 0, h: 0, dpr: 0 };
          function a9(t, o) {
            let r = t || e.clientWidth,
              n = o || e.clientHeight;
            if (!r || !n) return;
            let i = t ? 1 : Math.min(devicePixelRatio || 1, 1.5);
            if (r === a8.w && n === a8.h && i === a8.dpr) return;
            ((a8.w = r),
              (a8.h = n),
              (a8.dpr = i),
              s.setPixelRatio(i),
              s.setSize(r, n, !1),
              (k.aspect = r / n),
              (k.fov = 21));
            let l = eE.portrait;
            ((eE.w = r), (eE.h = n), a7(), l !== eE.portrait && void 0 !== eV && eV && !t && eK(a_));
            let h = Math.round(r * i * 1),
              u = Math.round(n * i * 1);
            u > 1150 && ((h = Math.round((1150 * h) / u)), (u = 1150));
            var c = h,
              d = u;
            for (let e of [ab, ax, aM, ak, aS]) e && e.dispose();
            let f = { type: a.HalfFloatType, minFilter: a.LinearFilter, magFilter: a.LinearFilter, depthBuffer: !0 };
            ((ab = new a.WebGLRenderTarget(c, d, f)), (ax = new a.WebGLRenderTarget(c, d, f)));
            let m = Math.max(2, c >> 1),
              p = Math.max(2, d >> 1),
              v = { type: a.HalfFloatType, minFilter: a.LinearFilter, magFilter: a.LinearFilter, depthBuffer: !1 };
            ((aM = new a.WebGLRenderTarget(m, p, v)),
              (ak = new a.WebGLRenderTarget(m, p, v)),
              (aS = new a.WebGLRenderTarget(m, p, v)),
              aF.uniforms.uTexel.value.set(1 / h, 1 / u),
              (aF.uniforms.uMaxCoC.value = 0.018 * u),
              (aF.uniforms.uBgCap.value = 0.0095 * u),
              (aC = 0.14 * u),
              (aF.uniforms.uCocScale.value = aC),
              aD && aP(null));
          }
          function a7() {
            let e = eE.w,
              t = eE.h;
            eE.portrait = e / t < 1;
            let a = eE.portrait ? eE.zoom : 1,
              o = e / t,
              r = Math.min(1, Math.max(0, (16 / 9 - o) / (16 / 9 - 1))),
              n = eE.portrait ? 0 : 0.35 * r;
            if (void 0 !== ea && ea) {
              let e = Math.min(1, Math.max(0, (1 - o) / 0.5)),
                t = (e, t, a) => e + (t - e) * a;
              ((ea.material.uniforms.uDeckFine.value = t(1 + 0.8 * r, 2, e)),
                (ea.material.uniforms.uShelterReach.value = t(0.2 + 0.06 * r, 0.18, e)),
                (ea.material.uniforms.uCoverBoost.value = t(-0.18 * r, 0.06, e)),
                (ea.material.uniforms.uWarmK.value = t(1, 1.08, e)));
            }
            if (e / t < 16 / 9) {
              let o = t * a,
                r = (16 * o) / 9,
                i = Math.max(0, Math.min(r - e, r * (eE.portrait ? eE.cx : 0.5) - e / 2)),
                l = eE.portrait ? o - t : -n * t;
              (k.setViewOffset(r, o, i, l, e, t),
                (eE.min = (i / r) * 2 - 1),
                (eE.max = ((i + e) / r) * 2 - 1),
                (eE.cy = eE.portrait ? -1 + 1 / a : 2 * n));
            } else (k.clearViewOffset(), (eE.min = -1), (eE.max = 1), (eE.cy = 0));
            (eE.portrait
              ? aV(88.4 * ((eE.min + eE.max) / 2 + 0.06), (0.66 / a + eE.cy) * 49.6 + 49, -268)
              : aV(Q[0], Q[1] + 49.6 * eE.cy, Q[2]),
              k.updateProjectionMatrix());
          }
          y(window, "resize", () => a9());
          let oe = null;
          "u" > typeof ResizeObserver && (oe = new ResizeObserver(() => a9())).observe(e);
          let ot = new a.Clock(),
            oa = new a.Quaternion();
          (k.lookAt(S), oa.copy(k.quaternion));
          let oo = new a.Euler();
          (a9(),
            eK(a_),
            aZ(l.look || "day"),
            Object.assign(ed, ef),
            (ed.d = ef.d),
            (ed.n = ef.n),
            (ed.t = ef.t),
            ev(ed.d, ed.n, ed.t),
            (ee.value = 1));
          let or = 0,
            on = 0;
          function oi(e, t, a) {
            (ea.material.uniforms.uShelterA.value.set(e[0], e[1], e[2], e[3]),
              ea.material.uniforms.uShelterB.value.set(t[0], t[1], t[2], t[3]));
            let o = a || [0, 0, 0, 0];
            ea.material.uniforms.uShelterC.value.set(o[0], o[1], o[2], o[3]);
          }
          return (
            s.setAnimationLoop((e) => {
              if (!ag || e - on < ("cross" === ts || "out" === ts || "in" === ts ? 4 : 30)) return;
              on = e;
              let t = ot.getDelta();
              t > 2.5 && T.value > 6 && !x && (ap(), av());
              let a = Math.min(t * aj, 0.05);
              T.value += a;
              let o = T.value;
              if (
                ((V.value = G * (0.62 + 0.28 * Math.sin(0.21 * o) + 0.1 * Math.sin(0.57 * o + 1.7))),
                ed.d !== ef.d || ed.n !== ef.n || ed.t !== ef.t)
              ) {
                let e = 1 - Math.exp(-a * (x ? 60 : 2.2));
                for (let t of ["d", "n", "t"])
                  ((ed[t] += (ef[t] - ed[t]) * e), 0.001 > Math.abs(ed[t] - ef[t]) && (ed[t] = ef[t]));
                ev(ed.d, ed.n, ed.t);
              }
              if (1 !== ee.value) {
                let e = ee.value + (1 - ee.value) * (1 - Math.exp(-a * (x ? 60 : 0.9)));
                (0.002 > Math.abs(e - 1) && (e = 1), (ee.value = e));
              }
              (aH && (et.value += a),
                (function (e, t) {
                  var a, o;
                  let r, n;
                  if (!eZ) return;
                  if (x) {
                    if (!eV) return;
                    ("perched" !== ts &&
                      (function () {
                        if (eV && eZ) for (let e of (tV(T.value, 2), eQ)) e.visible = !1;
                      })(),
                      ai(eX.position),
                      (eX.position.y += 0.004),
                      eX.lookAt(al(tL)),
                      eX.rotateX(-0.3),
                      eX.scale.setScalar(1),
                      (ta = 1),
                      tn(eJ[0], 1, 0));
                    return;
                  }
                  if ("away" === ts) {
                    if ((t0 && t > t0 ? t4() : t > td && tG(), "away" === ts)) return;
                    e = 0;
                  }
                  if ("out" === ts && th < tE) {
                    let a = (th += e) / tE;
                    (tl(tN, eV.p, eV.flex, t, V.value), ai(eX.position).add(tN));
                    let o = tO > 0 ? Math.min(1, a / 0.55) : 1;
                    (eX.quaternion.slerpQuaternions(tq, tU, o * o * (3 - 2 * o)),
                      (eX.position.y +=
                        0.004 + (tO > 0 ? 0.006 * Math.sin(Math.PI * o) : 0) - 0.012 * Math.sin(Math.PI * a)),
                      eX.rotateX(0.1 * Math.sin(Math.PI * a)),
                      (tv = 1 - Math.min(1, Math.max(0, (a - 0.3) / 0.7))),
                      (ta = 1),
                      tn(eJ[0], tv, 0.23),
                      th + e >= tE && tq.copy(tU));
                    return;
                  }
                  if ("cross" === ts || "out" === ts || "in" === ts) {
                    th += e;
                    let a = "out" === ts ? th - tE : th,
                      o = Math.min(1, a / tu),
                      r = o;
                    if (
                      ("out" === ts &&
                        (r = (o < 0.16 ? 0.15 * o + (0.425 * o * o) / 0.16 : 0.092 + (o - 0.16)) / 0.9319999999999999),
                      "in" === ts)
                    ) {
                      let e = o - 0.7;
                      r = (o < 0.7 ? o : 0.7 + e - (0.333 * e * e) / 0.3) / 0.9001;
                    }
                    let n = "in" === ts ? tP((o - 0.76) / 0.24) : 0;
                    tB = Math.min(1, a / 0.6) * ("cross" === ts ? 1 : 0.5 * ("out" === ts)) * (1 - n);
                    let i = "cross" === ts || "out" === ts;
                    ((ty = i ? Math.min(1, Math.max(0, (a - ("out" === ts ? 0.55 : 0.1)) / 0.5)) : 0),
                      (tv = 0),
                      (t8 = e));
                    let l = "in" === ts ? tP((o - 0.66) / 0.24) : 0;
                    ((ta = "in" === ts ? tP((o - 0.55) / 0.35) : "out" === ts ? 1 - Math.min(1, a / 0.45) : 0),
                      (t7 = l),
                      (ti =
                        "in" === ts ? 0.15 + 0.85 * l : "out" === ts ? 0.15 + 0.85 * (1 - Math.min(1, a / 0.6)) : 0.15),
                      (e6 = "in" === ts ? 0.72 + 0.26 * l : "out" === ts ? 1 - 0.09999999999999998 * ty : 0.9));
                    let s = i ? tC(a) : null,
                      h = s
                        ? s.beat * ty + a * tg() * (1 - ty)
                        : a * tg() * (1 + 0.07 * Math.sin(1.1 * a + 0.3) + 0.08 * l);
                    for (let e of ((t2 = "out" === ts ? 0.23 + h : h),
                    ae(eX, eJ[0], r, t2, s, a),
                    eX.scale.setScalar(1),
                    eQ))
                      e.scale.setScalar(1);
                    if (
                      ("in" === ts &&
                        (eX.rotateX(-0.55 * l * 1),
                        n > 0 &&
                          (tl(tN, eV.p, eV.flex, t, V.value),
                          tL.fromArray(eV.p).add(tN),
                          (tL.y += 0.004),
                          eX.position.lerp(tL, n)),
                        j.copy(eX.quaternion)),
                      "in" !== ts && (t7 = 0),
                      "out" === ts)
                    ) {
                      let e = Math.min(1, a / 0.45);
                      (t_.copy(eX.quaternion),
                        eX.quaternion.slerpQuaternions(tq, t_, e * e * (3 - 2 * e)),
                        eX.rotateX(-0.3 * e * (1 - Math.min(1, a / 0.7))),
                        tl(tN, eV.p, eV.flex, t, V.value),
                        eX.position.addScaledVector(tN, 1 - e));
                    }
                    for (let e = 0; e < eQ.length; e++) {
                      let t = eQ[e],
                        o = 0.009 * (e + 1);
                      if (((t.visible = r > o && "cross" === ts), t.visible)) {
                        let n = a - o * tu;
                        ae(t, eJ[e + 1], r - o, t2, i ? tC(n) : null, n);
                      }
                    }
                    let u = "in" === ts && (o >= 1 || (o > 0.9 && 0.05 > eX.position.distanceTo(tT))),
                      c = e > 0 ? eX.position.distanceTo(U) / e : 0;
                    (U.copy(eX.position),
                      (o >= 1 || u) &&
                        ("in" === ts
                          ? (tV(T.value, 2.5 + 2 * Math.random()), (t3 = t1 = T.value), K(eV, T.value, c))
                          : (tW(), am && ((am = !1), (t0 = T.value + 1.2 + Math.random())))));
                    return;
                  }
                  let i = at ? Math.min(1, (t - at.t0) / at.dur) : 0;
                  (at && "hop" === at.kind && (ar = at.a + (at.b - at.a) * tP(i)),
                    tl(tN, eV.p, eV.flex, t, V.value),
                    ai(eX.position).add(tN),
                    (eX.position.y += 0.004));
                  {
                    let e = t - t3;
                    e > 0 && e < 1 && (eX.position.y -= 0.004 * Math.sin(17 * e) * Math.exp(-(7 * e)));
                  }
                  (eX.lookAt(al(tL).add(tN)), eX.rotateX(-0.3));
                  let l = t - t1;
                  if (l >= 0 && l < 0.4) {
                    let e = tP(l / 0.4);
                    (t_.copy(eX.quaternion), eX.quaternion.slerpQuaternions(j, t_, e));
                  }
                  let s = tP(l / 0.28),
                    h = tP((l - 0.18) / 0.32);
                  ((ta = 1),
                    (ti = 1 - tP(l / 0.5)),
                    tn(eJ[0], h, t2, s),
                    t > tf && ((tp = (Math.random() - 0.5) * 1.2), (tf = t + 1.4 + 2.8 * Math.random())),
                    (tm += (tp - tm) * (1 - Math.exp(-(8 * e)))),
                    eX.rotateY(0.04 * tm),
                    at
                      ? ((a = i),
                        (o = t),
                        (r = at),
                        (n = eJ[0].bones),
                        "tail" === r.kind
                          ? n.tail && tr(n.tail, e9, r.a * Math.sin(a * Math.PI))
                          : "shuffle" === r.kind
                            ? (eX.rotateY(r.a * Math.sin(2 * a * Math.PI) * (1 - a)),
                              (eX.position.y -= 0.003 * Math.sin(a * Math.PI)))
                            : "peer" === r.kind
                              ? (ao = r.a * tP(a / 0.2) * tP((1 - a) / 0.25))
                              : "hop" === r.kind &&
                                ((eX.position.y += 0.022 * Math.sin(a * Math.PI)),
                                eX.rotateX(-0.22 * Math.sin(a * Math.PI))),
                        a >= 1 && ("hop" === r.kind && ((t3 = o), K(eV, o, 1)), (ao = 0), (at = null)))
                      : t > aa &&
                        t > t3 + 1.2 &&
                        t < tc - 0.8 &&
                        (function (e) {
                          let t = Math.random(),
                            a =
                              t < 0.32
                                ? "tail"
                                : t < 0.55
                                  ? "shuffle"
                                  : t < 0.82
                                    ? "peer"
                                    : eV.along
                                      ? "hop"
                                      : "shuffle";
                          if (
                            ((at = {
                              kind: a,
                              t0: e,
                              dur: "tail" === a ? 0.26 : "shuffle" === a ? 0.42 : "peer" === a ? 1.6 : 0.34,
                              a: 0,
                              b: 0,
                            }),
                            "hop" === a)
                          ) {
                            let e =
                              (0.025 + 0.02 * Math.random()) *
                              (ar > 0.01 ? -1 : ar < -0.01 ? 1 : 0.5 > Math.random() ? -1 : 1);
                            ((at.a = ar), (at.b = ar + e));
                          } else
                            "peer" === a
                              ? (at.a = 0.6 > Math.random() ? 0.26 : -0.2)
                              : "shuffle" === a
                                ? (at.a = (Math.random() - 0.5) * 0.3)
                                : (at.a = 0.3 + 0.15 * Math.random());
                          aa = e + at.dur + 2 + 4.5 * Math.random();
                        })(t),
                    (function (e) {
                      let t = eJ[0];
                      if (!t) return;
                      let a = t.bones.head;
                      if (!a) return;
                      let o = 0,
                        r = 0;
                      (a2 >= 0 &&
                        !eE.portrait &&
                        (ac
                          .set((a2 / eE.w) * 2 - 1, -((a3 / eE.h) * 2 - 1), 0.5)
                          .unproject(k)
                          .sub(k.position)
                          .normalize(),
                        ac.multiplyScalar(eX.position.distanceTo(k.position)).add(k.position),
                        eX.worldToLocal(ac),
                        a.getWorldPosition(ad),
                        eX.worldToLocal(ad),
                        ac.sub(ad),
                        (o = Math.max(-0.3, Math.min(0.3, 0.6 * Math.atan2(ac.x, ac.z))))),
                        (o += 0.5 * tm),
                        (r += ao));
                      let n = 1 - Math.exp(-(3.2 * e));
                      ((as += (o - as) * n), (ah += (r - ah) * n), tr(a, te, -(0.85 * as)), ah && tr(a, e9, ah));
                    })(e),
                    t > tc && tj());
                })(a, o),
                (aE += (aO - aE) * (1 - Math.exp(-a * (x ? 60 : 3)))),
                (aF.uniforms.uFocus.value = 1 / aE));
              let r = 1 / aW,
                n = Math.min(1, Math.max(0, (r - aE) / (r - 1 / aG)));
              ((n = Math.min(1, Math.max(0, (n - 0.02) / 0.96))),
                (aF.uniforms.uFgBlur.value = aK ? aF.uniforms.uMaxCoC.value * n : 0),
                (aF.uniforms.uBgBlur.value = aK ? aF.uniforms.uBgCap.value * (1 - n) : 0),
                (a$ += (a0 - a$) * (1 - Math.exp(-(3 * a)))),
                (aJ += (a1 - aJ) * (1 - Math.exp(-(3 * a)))));
              let i = +!x,
                l = (0.55 * Math.sin(0.062 * o) + 0.3 * Math.sin(0.151 * o + 2.1)) * 0.0022 * i - 0.0045 * a$ * i,
                s = (0.5 * Math.sin(0.083 * o + 1.2) + 0.3 * Math.sin(0.19 * o)) * 0.0018 * i - 0.00275 * aJ * i;
              (oo.set(s, l, 0, "YXZ"), k.quaternion.copy(oa).multiply(ej.setFromEuler(oo)));
              {
                let e = k.projectionMatrix,
                  t = ea.material.uniforms.uShelterShift.value;
                a5.set(0, 0, -1).applyQuaternion(t_.copy(ej).invert()).applyMatrix4(e);
                let a = a5.x,
                  o = a5.y;
                (a5.set(0, 0, -1).applyMatrix4(e), t.set((a - a5.x) * 0.5, -(0.5 * (o - a5.y))));
              }
              ((aT.uniforms.uGrainT.value = x ? 0.37 : T.value % 1),
                aP(null),
                (3 & or) == 0 && b.classList.toggle(w.overBird, a6(a2, a3)),
                or >= 2 && !aD && (eC <= 0 || performance.now() > eA) && ((aD = !0), b.classList.add(w.drawn)),
                or++);
            }),
            l.shelters && oi(...l.shelters),
            {
              setLook: aZ,
              setShelters: oi,
              dispose: function () {
                for (let [e, t, a, o] of (s.setAnimationLoop(null), g)) e.removeEventListener(t, a, o);
                for (let e of (oe && oe.disconnect(),
                ay && ay.disconnect(),
                M.traverse((e) => {
                  for (let t of (e.geometry && e.geometry.dispose(),
                  Array.isArray(e.material) ? e.material : e.material ? [e.material] : [])) {
                    for (let e in t) {
                      let a = t[e];
                      a && a.isTexture && a.dispose();
                    }
                    t.dispose();
                  }
                }),
                [ab, aM, ax, ak, aS]))
                  e && e.dispose();
                (s.dispose(), b.remove(), aX.remove(), e.classList.remove(w.host, w.night, w.dusk, w.morning));
              },
              setSpeed: function (e) {
                aj = null == e ? 1 : e;
              },
              setBlur: function (e) {
                aK = !!e;
              },
              cue: function () {
                "perched" === ts ? tj() : "away" === ts && tG();
              },
              get look() {
                return aY;
              },
              get seed() {
                return a_;
              },
              get ready() {
                return eZ;
              },
              get bird() {
                return ts;
              },
              get birdXY() {
                return eX.visible ? a4() : null;
              },
            }
          );
        },
      ],
      222197,
    );
  },
]);
