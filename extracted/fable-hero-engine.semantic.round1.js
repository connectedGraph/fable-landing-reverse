(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 222197, runtimeModule => {
  "use strict";

  var webglModule = runtimeModule.i(408560),
    THREE = runtimeModule.i(190072),
    gltfModule = runtimeModule.i(223490);
  let treeGenerator = function () {
      function createSeededRandom(e) {
        let t = e >>> 0;
        return function () {
          t |= 0;
          let e = Math.imul((t = t + 0x6d2b79f5 | 0) ^ t >>> 15, 1 | t);
          return (((e = e + Math.imul(e ^ e >>> 7, 61 | e) ^ e) ^ e >>> 14) >>> 0) / 0x100000000;
        };
      }
      let addVec3 = (e, t) => [e[0] + t[0], e[1] + t[1], e[2] + t[2]],
        scaleVec3 = (e, t) => [e[0] * t, e[1] * t, e[2] * t],
        crossVec3 = (e, t) => [e[1] * t[2] - e[2] * t[1], e[2] * t[0] - e[0] * t[2], e[0] * t[1] - e[1] * t[0]],
        dotVec3 = (e, t) => e[0] * t[0] + e[1] * t[1] + e[2] * t[2];
      function normalizeVec3(e) {
        let t = Math.hypot(e[0], e[1], e[2]) || 1;
        return [e[0] / t, e[1] / t, e[2] / t];
      }
      let lerp = (e, t, a) => e + (t - e) * a,
        clamp = (e, t, a) => Math.min(a, Math.max(t, e)),
        worldUp = [0, 1, 0];
      return {
        generate: function (seed, overrides) {
          let treeOptions = Object.assign({
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
              barkLight: [0.47, 0.395, 0.3]
            }, overrides || {}),
            random = createSeededRandom(seed),
            geometryBuffers = {
              positions: [],
              normals: [],
              colors: [],
              flex: [],
              uvs: [],
              indices: [],
              min: [1 / 0, 1 / 0, 1 / 0],
              max: [-1 / 0, -1 / 0, -1 / 0],
              vert(e, t, a, o, r) {
                this.positions.push(e[0], e[1], e[2]), this.normals.push(t[0], t[1], t[2]), this.colors.push(a[0], a[1], a[2]), this.flex.push(o || 0), this.uvs.push(r ? r[0] : 0.5, r ? r[1] : 0);
                for (let t = 0; t < 3; t++) e[t] < this.min[t] && (this.min[t] = e[t]), e[t] > this.max[t] && (this.max[t] = e[t]);
                return this.positions.length / 3 - 1;
              },
              tri(e, t, a) {
                this.indices.push(e, t, a);
              }
            },
            leafAnchors = [],
            rootDirection = treeOptions.rootDir ? normalizeVec3(treeOptions.rootDir) : normalizeVec3([0.92, 0.3, (random() - 0.5) * 0.3]);
          !function appendBranch(random, buffers, anchors, start, direction, length, radius, depth, flexStart, options, isTwig) {
            let segmentCount = clamp(Math.round(length / options.segLen), 4, 16),
              segmentLength = length / segmentCount,
              segmentCenters = [start.slice()],
              segmentDirections = [],
              branchDirection = normalizeVec3(direction),
              currentCenter = start.slice(),
              sideAxis = crossVec3(branchDirection, worldUp);
            1e-4 > Math.hypot(sideAxis[0], sideAxis[1], sideAxis[2]) && (sideAxis = [1, 0, 0]), sideAxis = scaleVec3(normalizeVec3(sideAxis), 0.5 > random() ? 1 : -1);
            let bendAmplitude = (0.02 + 0.05 * random()) * (0 === depth ? 1.5 : 1);
            for (let e = 0; e < segmentCount; e++) {
              let o = (e + 1) / segmentCount,
                r = options.wobble * (0.75 + 0.45 * depth),
                l = [(random() - 0.5) * r, (random() - 0.5) * r, (random() - 0.5) * r];
              l = addVec3(l, [0, depth >= 2 ? options.twigLift : 0 === depth ? lerp(-0.04, options.tipLift, o) : 0.01, 0]), branchDirection = normalizeVec3(addVec3(addVec3(branchDirection, l), scaleVec3(sideAxis, bendAmplitude))), currentCenter = addVec3(currentCenter, scaleVec3(branchDirection, segmentLength)), segmentCenters.push(currentCenter.slice()), segmentDirections.push(branchDirection.slice());
            }
            segmentDirections.push(segmentDirections[segmentDirections.length - 1].slice()), segmentDirections.unshift(segmentDirections[0].slice());
            let frameNormal = crossVec3(segmentDirections[0], 0.9 > Math.abs(segmentDirections[0][1]) ? worldUp : [1, 0, 0]);
            frameNormal = normalizeVec3(frameNormal);
            let frameSamples = [];
            for (let e = 0; e <= segmentCount; e++) {
              let i = segmentDirections[e];
              frameNormal = normalizeVec3(addVec3(frameNormal, scaleVec3(i, -dotVec3(i, frameNormal))));
              let l = normalizeVec3(crossVec3(i, frameNormal));
              frameSamples.push({
                t: i,
                n: frameNormal.slice(),
                b: l
              });
            }
            let isOuterBranch = depth >= options.maxDepth - 1,
              tipRadius = isOuterBranch ? Math.max(0.18 * radius, 0.0014) : 0.38 * radius,
              radiusBySegment = [];
            for (let e = 0; e <= segmentCount; e++) radiusBySegment.push(lerp(radius, tipRadius, Math.pow(e / segmentCount, 0.72)));
            let depthRatio = clamp(depth / options.maxDepth, 0, 1),
              colorVariant = random(),
              colorVariation = colorVariant < 0.35 ? [0.015, 0.05, -0.02] : colorVariant < 0.7 ? [0.055, 0.005, -0.012] : [-0.025, -0.015, 0.012],
              branchColor = [lerp(options.barkDark[0], options.barkLight[0], depthRatio) + colorVariation[0], lerp(options.barkDark[1], options.barkLight[1], depthRatio) + colorVariation[1], lerp(options.barkDark[2], options.barkLight[2], depthRatio) + colorVariation[2]];
            isTwig && (branchColor = [0.6, 0.58, 0.55]);
            let radialSegments = Math.max(4, options.radialByDepth[Math.min(depth, options.radialByDepth.length - 1)]),
              ringStartIndices = [],
              ringPhase = random() * Math.PI * 2,
              ringRipple = 0.05 + 0.06 * random(),
              ringLobes = Math.min(4 + Math.floor(4 * random()), Math.floor(radialSegments / 2)),
              ringRotation = random() * Math.PI * 2,
              ringAsymmetry = (random() - 0.5) * 2,
              ringFrequency = 0.5 + 0.8 * random(),
              radialWarp = isOuterBranch ? 0.05 : 0 === depth ? 0.17 : 0.15,
              radialNoise = 0.05 + 0.09 * random(),
              ringNoisePhase = random() * Math.PI,
              pinchSegment = Math.floor(random() * segmentCount * 2.5);
            for (let e = 0; e <= segmentCount; e++) {
              ringStartIndices.push(buffers.positions.length / 3);
              let o = frameSamples[e],
                r = e / segmentCount,
                n = flexStart + r * length,
                l = n / 0.3,
                s = 1 + ringRipple * Math.sin(1.9 * e + ringPhase) + 0.13 * Math.pow(Math.max(0, Math.sin(0.83 * e + 1.7 * ringPhase)), 10),
                h = e === pinchSegment;
              h && (s *= 0.8);
              let d = 2 * Math.PI * radiusBySegment[e] * s,
                f = 0,
                m = 0;
              for (let p = 0; p <= radialSegments; p++) {
                let v = p === radialSegments,
                  y = p / radialSegments * Math.PI * 2,
                  w = addVec3(scaleVec3(o.n, Math.cos(y)), scaleVec3(o.b, Math.sin(y))),
                  b = Math.pow(0.5 + 0.5 * Math.cos(y * ringLobes + ringAsymmetry * n * 6 + ringRotation + ringFrequency * Math.sin(9 * n + ringPhase)), 2.2),
                  x = radiusBySegment[e] * s * (1 + radialNoise * Math.cos(2 * y + ringNoisePhase)) * (1 + radialWarp * (0.55 - b)) * (1 + (random() - 0.5) * 0.1),
                  M = (random() - 0.5) * 0.05;
                0 === p && (f = x, m = M), v && (x = f, M = m);
                let S = addVec3(segmentCenters[e], scaleVec3(w, x)),
                  D = (x / (radiusBySegment[e] * s) - 1) * 1.9,
                  C = depth > 0 ? 1 - 0.3 * Math.exp(-(0.8 * e)) : 1,
                  z = M + 0.12 * D + (h ? -0.09 : 0),
                  A = [(branchColor[0] + z) * C, (branchColor[1] + z) * C, (branchColor[2] + 0.8 * z) * C];
                if (isOuterBranch) {
                  let e = 0.4 * r;
                  A = [lerp(A[0], 0.42, e), lerp(A[1], 0.48, e), lerp(A[2], 0.29, e)];
                }
                buffers.vert(S, w, A, n, [p / radialSegments * (d / 0.3), l]);
              }
            }
            for (let e = 0; e < segmentCount; e++) for (let t = 0; t < radialSegments; t++) {
              let a = ringStartIndices[e] + t,
                o = ringStartIndices[e] + t + 1,
                r = ringStartIndices[e + 1] + t,
                n = ringStartIndices[e + 1] + t + 1;
              buffers.tri(a, r, o), buffers.tri(o, r, n);
            }
            {
              let e = frameSamples[segmentCount],
                o = addVec3(segmentCenters[segmentCount], scaleVec3(e.t, 0.7 * radiusBySegment[segmentCount])),
                r = buffers.vert(o, e.t, branchColor, flexStart + length);
              for (let e = 0; e < radialSegments; e++) buffers.tri(ringStartIndices[segmentCount] + e, r, ringStartIndices[segmentCount] + e + 1);
            }
            if (0 === depth) {
              let e = frameSamples[0],
                o = scaleVec3(e.t, -1),
                r = buffers.vert(segmentCenters[0], o, [0.62, 0.52, 0.38], 0),
                n = buffers.positions.length / 3;
              for (let r = 0; r < radialSegments; r++) {
                let n = r / radialSegments * Math.PI * 2,
                  i = addVec3(scaleVec3(e.n, Math.cos(n)), scaleVec3(e.b, Math.sin(n)));
                buffers.vert(addVec3(segmentCenters[0], scaleVec3(i, radiusBySegment[0])), o, [0.58, 0.48, 0.35], 0);
              }
              for (let e = 0; e < radialSegments; e++) {
                let t = (e + 1) % radialSegments;
                buffers.tri(n + e, n + t, r);
              }
            }
            let radiusAt = e => lerp(radius, tipRadius, Math.pow(e, 0.72)),
              frameAt = e => frameSamples[clamp(Math.round(e * segmentCount), 0, segmentCount)],
              centerAt = e => {
                let o = e * segmentCount,
                  r = clamp(Math.floor(o), 0, segmentCount - 1),
                  n = o - r;
                return addVec3(scaleVec3(segmentCenters[r], 1 - n), scaleVec3(segmentCenters[r + 1], n));
              };
            anchors.perches || (anchors.perches = []);
            {
              let e = Math.max(1, Math.round(length / 0.06));
              for (let t = 0; t < e; t++) {
                let a = 0.15 + 0.7 * (1 === e ? 0.5 : t / (e - 1)),
                  o = frameAt(a);
                anchors.perches.push({
                  c: centerAt(a),
                  r: radiusAt(a),
                  along: o.t,
                  d: depth,
                  t: a,
                  flex: flexStart + a * length
                });
              }
            }
            if (!isTwig && depth <= 1) {
              let e = +(0.32 > random());
              for (let o = 0; o < e; o++) {
                let e = 0.15 + 0.7 * random(),
                  o = random() * Math.PI * 2,
                  r = frameAt(e),
                  i = addVec3(scaleVec3(r.n, Math.cos(o)), scaleVec3(r.b, Math.sin(o))),
                  l = 0.9 + 0.5 * random(),
                  s = normalizeVec3(addVec3(addVec3(scaleVec3(r.t, Math.cos(l)), scaleVec3(i, Math.sin(l))), [0, -0.15 * random(), 0]));
                appendBranch(random, buffers, anchors, centerAt(e), s, 0.035 + 0.05 * random(), Math.max(0.42 * radiusAt(e), 0.0015), options.maxDepth, flexStart + e * length, options, !0);
              }
            }
            if (!isTwig && depth < options.maxDepth) {
              let e = Math.max(0, Math.round(options.childrenByDepth[Math.min(depth, options.childrenByDepth.length - 1)] + (random() - 0.5) * 1.5)),
                o = random() * Math.PI * 2;
              for (let r = 0; r < e; r++) {
                let s = clamp(0.14 + 0.78 * ((r + 0.8 * random()) / Math.max(1, e)), 0.12, 0.92);
                o += 2.39996323 + (random() - 0.5) * 0.9;
                let f = frameAt(s),
                  m = addVec3(scaleVec3(f.n, Math.cos(o)), scaleVec3(f.b, Math.sin(o))),
                  v = lerp(options.childAngle[0], options.childAngle[1], random()),
                  b = normalizeVec3(addVec3(scaleVec3(f.t, Math.cos(v)), scaleVec3(m, Math.sin(v)))),
                  x = length * lerp(0.4, 0.62, random()) * (1.25 - 0.55 * s),
                  M = Math.max(Math.min(0.72 * radiusAt(s), radiusAt(s) * (0.5 + 0.25 * random())), 0.0022),
                  k = addVec3(centerAt(s), scaleVec3(m, 0.6 * radiusAt(s)));
                x > 2.2 * options.segLen && appendBranch(random, buffers, anchors, k, b, x, M, depth + 1, flexStart + s * length, options);
              }
              if (depth <= options.maxDepth - 2) {
                let e = 1 + Math.round(1.5 * random());
                for (let r = 0; r < e; r++) {
                  let e = clamp(0.1 + 0.85 * random(), 0.1, 0.95);
                  o += 4.079937491 + (random() - 0.5);
                  let r = frameAt(e),
                    s = addVec3(scaleVec3(r.n, Math.cos(o)), scaleVec3(r.b, Math.sin(o))),
                    f = lerp(0.7, 1.15, random()),
                    m = normalizeVec3(addVec3(scaleVec3(r.t, Math.cos(f)), scaleVec3(s, Math.sin(f)))),
                    v = length * lerp(0.1, 0.2, random());
                  v > 1.6 * options.segLen && appendBranch(random, buffers, anchors, addVec3(centerAt(e), scaleVec3(s, 0.6 * radiusAt(e))), m, v, Math.max(0.3 * radiusAt(e), 0.0016), options.maxDepth - 1, flexStart + e * length, options);
                }
              }
            }
            if (!isTwig && depth >= 1) {
              let o = createSeededRandom(Math.floor(0xffffffff * random())),
                r = depth >= (null != options.leafOuterDepth ? options.leafOuterDepth : options.maxDepth - 1),
                n = r ? options.leafDensity : 0.26 * options.leafDensity,
                s = r ? 0.12 : 0.5,
                h = Math.round(length / 0.05 * n),
                c = o() * Math.PI * 2;
              for (let e = 0; e < h; e++) {
                let r = clamp(s + (1 - s) * Math.pow(e / Math.max(1, h - 1), 0.78), 0, 1);
                c += 2.39996323 + (o() - 0.5) * 0.5;
                let n = 0.35 > o() ? 3 : 0.75 > o() ? 2 : 1;
                for (let e = 0; e < n; e++) {
                  let s = clamp(r + (e - (n - 1) / 2) * 0.055, 0.05, 1),
                    h = frameAt(s),
                    u = c + e * (2.4 + 0.6 * o()),
                    f = addVec3(scaleVec3(h.n, Math.cos(u)), scaleVec3(h.b, Math.sin(u)));
                  anchors.push({
                    p: addVec3(addVec3(centerAt(s), scaleVec3(f, 0.8 * radiusAt(s))), scaleVec3(h.t, (o() - 0.5) * 0.02)),
                    out: f,
                    along: h.t,
                    c: centerAt(s),
                    r: radiusAt(s),
                    d: depth,
                    t: s,
                    size: lerp(0.75, 1.15, o()) * (1.05 - 0.25 * s),
                    flex: flexStart + s * length,
                    roll: (o() - 0.5) * 2,
                    droop: o()
                  });
                }
              }
              let f = frameSamples[segmentCount];
              anchors.push({
                p: addVec3(segmentCenters[segmentCount], scaleVec3(f.t, radiusBySegment[segmentCount])),
                out: f.n,
                along: f.t,
                c: segmentCenters[segmentCount],
                r: radiusBySegment[segmentCount],
                d: depth,
                t: 1,
                size: lerp(0.85, 1.1, o()),
                flex: flexStart + length,
                roll: (o() - 0.5) * 2,
                droop: o()
              });
            }
          }(random, geometryBuffers, leafAnchors, treeOptions.origin.slice(), rootDirection, treeOptions.trunkLen, treeOptions.trunkRadius, 0, 0, treeOptions);
          let v = 1e-6;
          for (let e of geometryBuffers.flex) e > v && (v = e);
          for (let e of leafAnchors) e.flex > v && (v = e.flex);
          let g = new Float32Array(geometryBuffers.flex.length);
          for (let e = 0; e < geometryBuffers.flex.length; e++) g[e] = Math.pow(geometryBuffers.flex[e] / v, 1.4);
          for (let e of leafAnchors) e.flex = Math.pow(e.flex / v, 1.4);
          for (let e of leafAnchors.perches || []) e.flex = Math.min(1, Math.pow(e.flex / v, 1.4));
          let y = geometryBuffers.positions.length / 3,
            w = y > 65535 ? Uint32Array : Uint16Array,
            b = [(geometryBuffers.min[0] + geometryBuffers.max[0]) / 2, (geometryBuffers.min[1] + geometryBuffers.max[1]) / 2, (geometryBuffers.min[2] + geometryBuffers.max[2]) / 2],
            x = 0.5 * Math.hypot(geometryBuffers.max[0] - geometryBuffers.min[0], geometryBuffers.max[1] - geometryBuffers.min[1], geometryBuffers.max[2] - geometryBuffers.min[2]);
          return {
            positions: new Float32Array(geometryBuffers.positions),
            normals: new Float32Array(geometryBuffers.normals),
            colors: new Float32Array(geometryBuffers.colors),
            flex: g,
            uvs: new Float32Array(geometryBuffers.uvs),
            indices: new w(geometryBuffers.indices),
            anchors: leafAnchors,
            perches: leafAnchors.perches || [],
            bounds: {
              center: b,
              radius: x
            },
            stats: {
              vertices: y,
              triangles: geometryBuffers.indices.length / 3,
              leaves: leafAnchors.length,
              seed: seed
            }
          };
        }
      };
    }(),
    desktopSeeds = [0x326eb8d5, 0x794e9d91],
    mobileSeeds = [0xc2ed8dc, 0x371915ac, 0x641e7af9, 0x52d2dd4a];
  runtimeModule.s(["createFableHero", 0, function (hostElement, options = {}) {
    let renderer,
      leafAtlasCanvas,
      leafAtlasContext,
      leafAtlasKinds,
      atlasTextureTemp,
      leafShapeCanvas,
      leafShapeContext,
      shapeTextureTemp,
      assetUrl = e => (options.assets || "") + e,
      eventListeners = [],
      listen = (e, t, a, o) => {
        e.addEventListener(t, a, o), eventListeners.push([e, t, a, o]);
      },
      cssClasses = Object.assign({
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
        unsupported: "fx-hero--unsupported"
      }, options.classes);
    hostElement.classList.add(cssClasses.host);
    let canvas = document.createElement("canvas");
    canvas.className = cssClasses.canvas, canvas.setAttribute("aria-hidden", "true"), hostElement.prepend(canvas);
    let reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      (renderer = new webglModule.WebGLRenderer({
        canvas: canvas,
        antialias: !1,
        alpha: !1,
        powerPreference: "high-performance"
      })).getContext().getExtension("EXT_color_buffer_float"), renderer.getContext().getExtension("OES_texture_float_linear");
    } catch (t) {
      return canvas.remove(), hostElement.classList.add(cssClasses.unsupported), options.onUnsupported && options.onUnsupported(t), null;
    }
    renderer.toneMapping = THREE.NoToneMapping, renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    let scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(21, 1, 0.1, 700);
    camera.position.set(0, 0, 0);
    let cameraTarget = new THREE.Vector3(0, 0.55, -3),
      toColor = e => new THREE.Color(e),
      sunDirection = new THREE.Vector3(0.45, 0.6, 0.42).normalize(),
      zenithColor = toColor("#6180c3"),
      horizonColor = toColor("#6483c6"),
      sunColor = toColor("#fff3dc"),
      sunGlowColor = toColor("#ffe9c4"),
      barkVertexShader = `
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
      timeUniform = {
        value: 0
      },
      nightUniform = {
        value: 0
      },
      duskUniform = {
        value: 0
      },
      morningUniform = {
        value: 0
      },
      duskMidColor = new THREE.Color("#e89a88"),
      duskFarColor = new THREE.Color("#9aa6bc"),
      baseWindStrength = 0.42 * !reducedMotion,
      windUniform = {
        value: baseWindStrength
      },
      lagUniform = {
        value: 1
      },
      landingUniform = {
        value: new THREE.Vector4(0, 0, 0, -100)
      },
      landingSpringUniform = {
        value: new THREE.Vector3(0.02, 15, 3.4)
      },
      tmpVecA = new THREE.Vector3(),
      tmpVecB = new THREE.Vector3(),
      tmpVecC = new THREE.Vector3(),
      tmpQuaternion = new THREE.Quaternion();
    function setLandingSpring(e, t, a = 1.4) {
      let o = e.flex,
        r = Math.max(0.8, Math.min(1.2, a / 1.4));
      landingUniform.value.set(e.p[0], e.p[1], e.p[2], t), landingSpringUniform.value.set((0.006 + 0.01 * o) * r, 2 * Math.PI * (5 - 1.2 * o), 6 + 2 * (1 - o));
    }
    let skyColorShader = `
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
      moonPositionArray = [48, 74, -268],
      moonPosition = new THREE.Vector3(...moonPositionArray),
      skyMesh = new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          uZenith: {
            value: zenithColor
          },
          uHorizon: {
            value: horizonColor
          },
          uSunDir: {
            value: sunDirection
          },
          uSunGlow: {
            value: sunGlowColor
          },
          uSkyVar: {
            value: 1
          },
          uMoonDir: {
            value: moonPosition.clone().normalize()
          },
          uNight: nightUniform,
          uDusk: duskUniform,
          uTime: timeUniform,
          uDuskMid: {
            value: duskMidColor
          },
          uDuskFar: {
            value: duskFarColor
          }
        },
        vertexShader: `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
        fragmentShader: `
      varying vec3 vDir;
      uniform float uTime;
      ${skyColorShader}
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
    `
      }));
    scene.add(skyMesh);
    let moonLightDirection = new THREE.Vector3(-0.86, 0.34, 0.18).normalize(),
      moonMesh = new THREE.Mesh(new THREE.SphereGeometry(10.2, 48, 32), new THREE.ShaderMaterial({
        transparent: !0,
        depthWrite: !0,
        uniforms: {
          uMoonLight: {
            value: moonLightDirection
          },
          uZenith: {
            value: zenithColor
          },
          uHorizon: {
            value: horizonColor
          },
          uSunDir: {
            value: sunDirection
          },
          uSunGlow: {
            value: sunGlowColor
          },
          uMoonGain: {
            value: 1
          },
          uSkyVar: {
            value: 1
          },
          uMoonDir: {
            value: moonPosition.clone().normalize()
          },
          uNight: nightUniform,
          uDusk: duskUniform,
          uDuskMid: {
            value: duskMidColor
          },
          uDuskFar: {
            value: duskFarColor
          }
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
      ${skyColorShader}
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
    `
      }));
    moonMesh.position.copy(moonPosition), scene.add(moonMesh);
    let cloudStrengthUniform = {
        value: 0
      },
      cloudTimeUniform = {
        value: 0
      },
      cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(200, 48, 24), new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: !0,
        depthWrite: !1,
        uniforms: {
          uClouds: cloudStrengthUniform,
          uCover: {
            value: 0.7
          },
          uCloudT: cloudTimeUniform,
          uNight: nightUniform,
          uDusk: duskUniform,
          uMorn: morningUniform,
          uDeckFine: {
            value: 1
          },
          uCoverBoost: {
            value: 0
          },
          uWarmK: {
            value: 1
          },
          uShelterReach: {
            value: 0.2
          },
          uShelterA: {
            value: new THREE.Vector4(0, 0, 0, 0)
          },
          uShelterB: {
            value: new THREE.Vector4(0, 0, 0, 0)
          },
          uShelterC: {
            value: new THREE.Vector4(0, 0, 0, 0)
          },
          uShelterShift: {
            value: new THREE.Vector2(0, 0)
          },
          uRes: {
            value: new THREE.Vector2(1, 1)
          },
          uSunDir: {
            value: sunDirection
          },
          uSunGlow: {
            value: sunGlowColor
          },
          uMoonDir: {
            value: moonPosition.clone().normalize()
          }
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
    `
      })),
      skyScene = new THREE.Scene();
    skyScene.add(skyMesh), skyScene.add(moonMesh);
    let cloudScene = new THREE.Scene();
    cloudScene.add(cloudMesh);
    let sunLight = new THREE.DirectionalLight(sunColor, 2.4);
    sunLight.position.copy(sunDirection).multiplyScalar(10), scene.add(sunLight);
    let hemisphereLight = new THREE.HemisphereLight(toColor("#bcd6f7"), toColor("#5d7050"), 1);
    scene.add(hemisphereLight);
    let nightSunDirection = moonPosition.clone().normalize(),
      morningLook = {
        zenith: zenithColor.clone(),
        horizon: horizonColor.clone(),
        glow: sunGlowColor.clone(),
        sunDir: sunDirection.clone(),
        sunCol: sunColor.clone(),
        sunInt: 2.4,
        hemiSky: toColor("#bcd6f7"),
        hemiGround: toColor("#6e6252"),
        hemiInt: 1.1,
        leafSun: sunColor.clone().multiplyScalar(1.7),
        leafSky: toColor("#b8c9dc").multiplyScalar(0.64),
        leafGround: toColor("#6b7355").multiplyScalar(0.6)
      },
      nightLook = {
        zenith: toColor("#030818"),
        horizon: toColor("#0a1631"),
        glow: toColor("#9fb0d4"),
        sunDir: nightSunDirection.clone(),
        sunCol: toColor("#9fb3d8"),
        sunInt: 0.1,
        hemiSky: toColor("#182a4a"),
        hemiGround: toColor("#070b14"),
        hemiInt: 0.08,
        leafSun: toColor("#b4c6e6").multiplyScalar(0.45),
        leafSky: toColor("#3a5a8c").multiplyScalar(0.16),
        leafGround: toColor("#1a2436").multiplyScalar(0.12)
      },
      duskLook = {
        zenith: toColor("#4a6cab"),
        horizon: toColor("#e59558"),
        glow: toColor("#ffb871"),
        sunDir: new THREE.Vector3(0.66, 0.05, -0.75).normalize(),
        sunCol: toColor("#f3c9a4"),
        sunInt: 1.35,
        hemiSky: toColor("#c3adb0"),
        hemiGround: toColor("#5a4a44"),
        hemiInt: 0.75,
        leafSun: toColor("#ffc188").multiplyScalar(1.7),
        leafSky: toColor("#b9a9b4").multiplyScalar(0.55),
        leafGround: toColor("#5a4a44").multiplyScalar(0.5)
      },
      dayLook = {
        zenith: toColor("#5f7aa4"),
        horizon: toColor("#a29aa6"),
        glow: toColor("#e8bcae"),
        sunDir: new THREE.Vector3(0.8, 0.22, 0.3).normalize(),
        sunCol: toColor("#ffd8b8"),
        sunInt: 2.2,
        hemiSky: toColor("#d8dcea"),
        hemiGround: toColor("#a08c84"),
        hemiInt: 1.7,
        leafSun: toColor("#ffe4b4").multiplyScalar(1.6),
        leafSky: toColor("#d0dcea").multiplyScalar(0.7),
        leafGround: toColor("#7c8462").multiplyScalar(0.62),
        duskK: 0,
        nightK: 0
      },
      lookTransition = {
        d: 0,
        n: 0,
        t: 0
      },
      lookTarget = {
        d: 0,
        n: 0,
        t: 0
      },
      blendColor = (e, t, a, o, r, n, i, l) => {
        let s = 1 - n - i - l;
        return e.setRGB(t.r * s + a.r * n + o.r * i + r.r * l, t.g * s + a.g * n + o.g * i + r.g * l, t.b * s + a.b * n + o.b * i + r.b * l);
      },
      blendScalar = (e, t, a, o, r, n, i) => e * (1 - r - n - i) + t * r + a * n + o * i;
    function applyLookUniforms(t, a, o) {
      duskUniform.value = t + o * dayLook.duskK, nightUniform.value = a + o * dayLook.nightK, morningUniform.value = o, blendColor(zenithColor, morningLook.zenith, duskLook.zenith, nightLook.zenith, dayLook.zenith, t, a, o), blendColor(horizonColor, morningLook.horizon, duskLook.horizon, nightLook.horizon, dayLook.horizon, t, a, o), blendColor(sunGlowColor, morningLook.glow, duskLook.glow, nightLook.glow, dayLook.glow, t, a, o), sunDirection.set(0, 0, 0).addScaledVector(morningLook.sunDir, 1 - t - a - o).addScaledVector(duskLook.sunDir, t).addScaledVector(nightLook.sunDir, a).addScaledVector(dayLook.sunDir, o).normalize(), sunLight.position.copy(sunDirection).multiplyScalar(10), blendColor(sunLight.color, morningLook.sunCol, duskLook.sunCol, nightLook.sunCol, dayLook.sunCol, t, a, o), sunLight.intensity = blendScalar(morningLook.sunInt, duskLook.sunInt, nightLook.sunInt, dayLook.sunInt, t, a, o), blendColor(hemisphereLight.color, morningLook.hemiSky, duskLook.hemiSky, nightLook.hemiSky, dayLook.hemiSky, t, a, o), blendColor(hemisphereLight.groundColor, morningLook.hemiGround, duskLook.hemiGround, nightLook.hemiGround, dayLook.hemiGround, t, a, o), hemisphereLight.intensity = blendScalar(morningLook.hemiInt, duskLook.hemiInt, nightLook.hemiInt, dayLook.hemiInt, t, a, o), blendColor(leafMaterial.uniforms.uSunCol.value, morningLook.leafSun, duskLook.leafSun, nightLook.leafSun, dayLook.leafSun, t, a, o), blendColor(leafMaterial.uniforms.uSkyCol.value, morningLook.leafSky, duskLook.leafSky, nightLook.leafSky, dayLook.leafSky, t, a, o), blendColor(leafMaterial.uniforms.uGroundCol.value, morningLook.leafGround, duskLook.leafGround, nightLook.leafGround, dayLook.leafGround, t, a, o), hostElement.classList.toggle(cssClasses.night, a > 0.5), hostElement.classList.toggle(cssClasses.dusk, t > 0.5), hostElement.classList.toggle(cssClasses.morning, o > 0.5), applyLeafLook(t, a, o);
    }
    function applyLeafLook(e, t, a) {
      for (let o of birdMaterials) o.emissiveIntensity = 0.12 * (1 - 0.88 * t) + 0.05 * e + 0.02 * a, o.color.setRGB(1 - 0.4 * t + 0.06 * e + 0.03 * a, 1 - 0.34 * t - 0.06 * e, 1 - 0.16 * t - 0.2 * e - 0.05 * a);
    }
    let treePresets = [{
        origin: [-1.35, -1.6, -2.55],
        rootDir: [0.62, 1, 0.08],
        trunkLen: 2,
        trunkRadius: 0.017,
        portraitDrop: 0.35
      }, {
        origin: [1.4, -1.78, -2.8],
        rootDir: [-0.5, 1, -0.02],
        trunkLen: 2.1,
        trunkRadius: 0.019,
        portraitDrop: 0.35
      }, {
        origin: [0.35, -1.9, -3.15],
        rootDir: [0.22, 1, 0.25],
        trunkLen: 1.7,
        trunkRadius: 0.015,
        portraitDrop: 0.35
      }, {
        origin: [1.75, -0.15, -2.3],
        rootDir: [-1, 0.3, 0.08],
        trunkLen: 1.9,
        trunkRadius: 0.034,
        leafDensity: 0.5,
        childrenByDepth: [4, 3, 2],
        portraitDrop: 0.5
      }],
      treeDefaults = {
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
        barkLight: [1.66, 1.54, 1.5]
      },
      treeSeedOffset = 0,
      treeCache = new Map();
    function generateSceneTree(e, t, a, o, n) {
      let i = Object.assign({}, treeDefaults, e);
      viewportState.portrait && e.portraitDrop && (i.origin = [e.origin[0], e.origin[1] - e.portraitDrop, e.origin[2]]), i.leafDensity = i.leafDensity * n;
      let l = Math.pow(o, 0.55);
      return i.childrenByDepth = i.childrenByDepth.map((e, t) => Math.max(+(0 === t), e * l)), i.maxDepth = 4, i.leafOuterDepth = 2, i.childrenByDepth = i.childrenByDepth.concat([(o - 1) * 1.5 - 0.3]), treeGenerator.generate(a + 101 * t, i);
    }
    function hasUsablePerch(e) {
      let t = Math.tan(10.5 * Math.PI / 180);
      for (let a of e) for (let e of a.perches || []) {
        if (e.r < 0.0045 || e.t > 0.85 || Math.abs(e.along[1]) > 0.7) continue;
        let a = -e.c[2];
        if (a < 1.85 || a > 4.2) continue;
        let o = e.c[0] / (1.78 * t * a),
          r = (e.c[1] - 0.183 * a) / (t * a),
          n = viewportState.portrait ? -0.95 : -0.58,
          i = viewportState.portrait ? -0.35 : 0.45;
        if (o > -0.3 && o < 0.9 && r > n && r < i) return !0;
      }
      return !1;
    }
    function selectBirdPerch(e) {
      let t = null,
        a = 1e9,
        o = 3,
        r = Math.tan(10.5 * Math.PI / 180),
        n = e => {
          if (!e.c) return {
            p: e.p.slice(),
            flex: e.flex
          };
          let t = e.along,
            a = t[1],
            o = -t[0] * a,
            r = 1 - t[1] * a,
            n = -t[2] * a,
            i = Math.hypot(o, r, n) || 1;
          o /= i, r /= i, n /= i;
          let l = 0.92 * e.r - 0.0025;
          return {
            p: [e.c[0] + o * l, e.c[1] + r * l, e.c[2] + n * l],
            flex: e.flex,
            along: t.slice(),
            r: e.r
          };
        },
        i = o => {
          let i = 0 === o,
            l = o >= 2,
            s = i ? 0.0045 : 1 === o ? 0.0035 : 2 === o ? 0.0025 : 0.0015;
          for (let o = 0; o < e.length; o++) {
            let h = 0.15 * (o !== e.length - 1);
            for (let u of e[o].perches || e[o].anchors) {
              if (null != u.r && u.r < s || null != u.t && u.t > 0.85) continue;
              let e = u.along ? Math.abs(u.along[1]) : 0;
              if (e > (i ? 0.5 : l ? 0.8 : 0.7)) continue;
              let o = u.p || u.c,
                c = -o[2],
                d = null != u.r && u.r >= 0.0045,
                f = d ? 1.85 : 2.4;
              if (i && (c < f || c > 3.8) || !i && !l && (c < Math.min(f, 2.2) || c > 4.2) || l && (c < 1.7 || c > 4.6)) continue;
              let m = o[0] / (1.78 * r * c),
                p = ((o[1] - 0.183 * c) / (r * c) - viewportState.cy) * (viewportState.portrait ? viewportState.zoom : 1),
                v = i ? 0.28 : 0.08,
                g = viewportState.max - viewportState.min;
              if (!(m > viewportState.min + v * g / 2 && m < viewportState.max - v * g / 2)) continue;
              if (viewportState.portrait) {
                if (i && (p < -0.82 || p > -0.45) || !i && !l && (p < -0.9 || p > -0.35) || l && (p < -0.94 || p > -0.3)) continue;
              } else if (i && (p < -0.55 || p > 0.62)) continue;
              if (!i && Math.abs(p) > 0.88) continue;
              let y = null != u.r ? Math.max(0, 0.011 - u.r) / 0.006 : 0,
                w = (viewportState.min + viewportState.max) / 2,
                b = (viewportState.max - viewportState.min) / 2,
                x = ((m - (w + (viewportState.portrait ? 0.1 : 0.42) * b)) / b) ** 2 + (p - (viewportState.portrait ? -0.62 : -0.05)) ** 2 + h + 0.3 * y * y + 0.5 * e * e + 0.25 * (c - (d ? 2.5 : 3)) ** 2;
              x < a && (a = x, t = n(u));
            }
          }
        };
      if (i(0), t && (o = 0), !t && (i(1), t && (o = 1)), !t && (i(2), t && (o = 2)), !t && (i(3), t && (o = 3)), !t) for (let o of e.flatMap(e => e.perches || e.anchors)) {
        let e = o.p || o.c;
        if (1.8 > -e[2]) continue;
        let r = null != o.r ? Math.max(0, 0.007 - o.r) / 0.004 : 0,
          i = o.along ? Math.abs(o.along[1]) : 0,
          l = e[0] * e[0] + (e[1] - 0.3) ** 2 + (e[2] + 2.6) ** 2 + 2 * r * r + 3 * i * i + 4 * (null != o.t && o.t > 0.85);
        l < a && (a = l, t = n(o));
      }
      if (!t) {
        let a = e.flatMap(e => e.perches || e.anchors);
        t = a.length ? n(a[0]) : {
          p: [0.4, 0.3, -2.6],
          flex: 0.5
        };
      }
      return {
        perch: t,
        pass: o,
        score: a
      };
    }
    let textureLoader = new THREE.TextureLoader(),
      pendingTextureLoads = 2,
      onTextureLoaded = () => {
        pendingTextureLoads--;
      },
      textureTimeoutAt = performance.now() + 2500,
      barkDiffuseTexture = textureLoader.load(assetUrl("bark_diff.webp"), onTextureLoaded, void 0, onTextureLoaded);
    barkDiffuseTexture.colorSpace = THREE.SRGBColorSpace, barkDiffuseTexture.wrapS = barkDiffuseTexture.wrapT = THREE.RepeatWrapping, barkDiffuseTexture.anisotropy = 2;
    let barkNormalTexture = textureLoader.load(assetUrl("bark_nor.webp"), onTextureLoaded, void 0, onTextureLoaded);
    barkNormalTexture.wrapS = barkNormalTexture.wrapT = THREE.RepeatWrapping, barkNormalTexture.anisotropy = 1;
    let barkMaterial = new THREE.MeshStandardMaterial({
      vertexColors: !0,
      roughness: 0.82,
      metalness: 0,
      map: barkDiffuseTexture,
      normalMap: barkNormalTexture,
      normalScale: new THREE.Vector2(0.55, 0.55)
    });
    barkMaterial.onBeforeCompile = e => {
      e.uniforms.uTime = timeUniform, e.uniforms.uWind = windUniform, e.uniforms.uLag = lagUniform, e.uniforms.uLand = landingUniform, e.uniforms.uLandK = landingSpringUniform, e.vertexShader = "attribute float aFlex;\nuniform float uTime;\nuniform float uWind;\n" + barkVertexShader + e.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += windSway(position, aFlex, uTime, uWind);");
    };
    let leafAtlasTexture = ((leafAtlasCanvas = document.createElement("canvas")).width = leafAtlasCanvas.height = 256, (leafAtlasContext = leafAtlasCanvas.getContext("2d")).clearRect(0, 0, 256, 256), leafAtlasKinds = ["h", "h", "y", "d"], [[0, 0], [128, 0], [0, 128], [128, 128]].forEach(([e, t], a) => function (e, t, a, o) {
        let r = t + 64 + (Math.random() - 0.5) * 8,
          n = a + 16,
          i = a + 128 - 26,
          l = i - n,
          s = 0.42 + 0.08 * Math.random(),
          h = e => 128 * s * Math.pow(Math.sin(Math.PI * Math.pow(Math.max(e, 0.01), 0.45) * 0.9), 1.1) * (1 - 0.85 * Math.pow(e, 2.5)),
          u = 8 + Math.floor(4 * Math.random()),
          c = 0.11 + 0.05 * Math.random(),
          d = (Math.random() - 0.5) * 0.16,
          f = () => Array.from({
            length: 24
          }, () => 0.55 + 0.9 * Math.random()),
          m = f(),
          p = f(),
          v = Math.random(),
          g = Math.random(),
          y = (e, t, a) => {
            let o = e * u + t,
              r = (Math.floor(o) % 24 + 24) % 24,
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
          M = e => Math.round(e * x).toString(16).padStart(2, "0");
        "y" === o ? (b.addColorStop(0, "#a89a4e"), b.addColorStop(0.55, "#8f8145"), b.addColorStop(1, "#7a6f3c")) : (b.addColorStop(0, "#" + M(139) + M(143) + M(92)), b.addColorStop(0.55, "#" + M(112) + M(120) + M(74)), b.addColorStop(1, "#" + M(91) + M(101) + M(64))), e.fillStyle = b, e.fill(), e.save(), e.clip();
        for (let a = 0; a < 40; a++) {
          let a = t + 128 * Math.random(),
            o = n + Math.random() * l,
            r = 5 + 18 * Math.random();
          e.fillStyle = 0.5 > Math.random() ? "rgba(70,102,44,0.10)" : "rgba(178,204,110,0.10)", e.beginPath(), e.arc(a, o, r, 0, 7), e.fill();
        }
        let k = (t, a, o, r, n) => {
          e.strokeStyle = "rgba(58,84,36,0.55)", e.lineWidth = n + 0.8, e.beginPath(), e.moveTo(t, a), e.quadraticCurveTo((t + o) / 2 + (o - t) * 0.12, (a + r) / 2, o, r), e.stroke(), e.strokeStyle = "rgba(196,216,140,0.8)", e.lineWidth = n, e.beginPath(), e.moveTo(t, a), e.quadraticCurveTo((t + o) / 2 + (o - t) * 0.12, (a + r) / 2, o, r), e.stroke();
        };
        k(r, i + 8, r, n + 4, 1.6);
        for (let e = 0; e < 6; e++) {
          let t = 0.12 + 0.15 * e,
            a = i - t * l,
            o = 0.94 * h(t);
          k(r, a, r + o, a - 0.13 * l, 1), k(r, a, r - o, a - 0.13 * l, 1);
        }
        if (e.restore(), "d" === o) for (let t = 0; t < 3; t++) {
          let a = 0.22 + 0.6 * Math.random(),
            o = 2 === t,
            i = 0.5 > Math.random() ? 1 : -1,
            s = o ? r + (Math.random() - 0.5) * h(0.5) : r + i * h(1 - a) * 0.85,
            u = n + a * l,
            c = o ? 3 + 4 * Math.random() : 6 + 9 * Math.random();
          e.fillStyle = "rgba(122,84,44,0.6)", e.beginPath(), e.arc(s, u, c + 2.5, 0, 7), e.fill(), e.globalCompositeOperation = "destination-out", e.beginPath(), e.arc(s, u, c, 0, 7), e.fill(), e.globalCompositeOperation = "source-over";
        }
        e.strokeStyle = "#7d7a4a", e.lineWidth = 7, e.lineCap = "round", e.beginPath(), e.moveTo(r, i + 2), e.lineTo(r, a + 128 - 3), e.stroke(), e.strokeStyle = "#96905c", e.lineWidth = 3, e.beginPath(), e.moveTo(r, i + 2), e.lineTo(r, a + 128 - 3), e.stroke();
      }(leafAtlasContext, e, t, leafAtlasKinds[a])), (atlasTextureTemp = new THREE.CanvasTexture(leafAtlasCanvas)).colorSpace = THREE.SRGBColorSpace, atlasTextureTemp.anisotropy = 1, atlasTextureTemp.generateMipmaps = !0, atlasTextureTemp),
      leafShapeTexture = ((leafShapeCanvas = document.createElement("canvas")).width = leafShapeCanvas.height = 128, (leafShapeContext = leafShapeCanvas.getContext("2d")).clearRect(0, 0, 128, 128), [[0, 0], [64, 0], [0, 64], [64, 64]].forEach(([e, t], a) => {
        let o = 64 * (0.36 + a % 2 * 0.06),
          r = 64 * (0.78 + 0.08 * (a >> 1)),
          n = e + 32,
          i = t + 58.88,
          l = leafShapeContext.createLinearGradient(0, i, 0, i - r);
        l.addColorStop(0, a % 2 ? "#6b4d36" : "#7a5a40"), l.addColorStop(0.55, "#8a7448"), l.addColorStop(1, a >> 1 ? "#b5b060" : "#a8ad5a"), leafShapeContext.fillStyle = l, leafShapeContext.beginPath(), leafShapeContext.moveTo(n, i), leafShapeContext.bezierCurveTo(n - 0.62 * o, i - 0.25 * r, n - 0.5 * o, i - 0.85 * r, n, i - r), leafShapeContext.bezierCurveTo(n + 0.5 * o, i - 0.85 * r, n + 0.62 * o, i - 0.25 * r, n, i), leafShapeContext.closePath(), leafShapeContext.fill(), leafShapeContext.strokeStyle = "rgba(60,40,25,0.55)", leafShapeContext.lineWidth = 1.2, leafShapeContext.stroke(), leafShapeContext.fillStyle = "rgba(255,240,190,0.22)", leafShapeContext.beginPath(), leafShapeContext.ellipse(n - 0.16 * o, i - 0.55 * r, 0.14 * o, 0.3 * r, 0, 0, 2 * Math.PI), leafShapeContext.fill();
      }), (shapeTextureTemp = new THREE.CanvasTexture(leafShapeCanvas)).colorSpace = THREE.SRGBColorSpace, shapeTextureTemp.anisotropy = 1, shapeTextureTemp.generateMipmaps = !0, shapeTextureTemp),
      leafMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          map: {
            value: leafAtlasTexture
          },
          uTime: timeUniform,
          uWind: windUniform,
          uLag: lagUniform,
          uLand: landingUniform,
          uLandK: landingSpringUniform,
          uInertia: {
            value: 1
          },
          uNight: nightUniform,
          uDusk: duskUniform,
          uSunDir: {
            value: sunDirection
          },
          uSunCol: {
            value: sunColor.clone().multiplyScalar(1.7)
          },
          uSkyCol: {
            value: toColor("#b8c9dc").multiplyScalar(0.64)
          },
          uGroundCol: {
            value: toColor("#6b7355").multiplyScalar(0.6)
          }
        },
        vertexShader: `
    attribute mat4 instanceMatrix;
    attribute vec3 aTint;
    attribute vec3 aWindI;      // phase, flex, flutter scale
    attribute vec2 aUvCell;     // which of the 4 atlas leaves this instance wears
    varying vec2 vUv; varying vec3 vTint; varying vec3 vN; varying vec3 vW;
    uniform float uTime, uWind, uInertia;
    ${barkVertexShader}
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
  `
      }),
      treeMesh = null,
      leafMesh = null,
      sparseLeafMesh = null,
      sparseLeafMaterial = null,
      selectedPerch = null,
      viewportState = {
        min: -1,
        max: 1,
        portrait: !1,
        cx: 0.62,
        zoom: 1,
        cy: 0
      },
      leafMatrix = new THREE.Matrix4(),
      leafBasis = new THREE.Vector3(),
      leafUp = new THREE.Vector3(),
      leafForward = new THREE.Vector3(),
      leafTangent = new THREE.Vector3(),
      leafRotation = new THREE.Quaternion();
    function rebuildTrees(e) {
      treeMesh && (scene.remove(treeMesh), treeMesh.geometry.dispose()), leafMesh && (scene.remove(leafMesh), leafMesh.geometry.dispose()), sparseLeafMesh && (scene.remove(sparseLeafMesh), sparseLeafMesh.geometry.dispose(), sparseLeafMesh = null);
      let t = function (e) {
        let t = function (e) {
            let t = treePresets.map((t, a) => generateSceneTree(t, a, e, 1, 2.2));
            if (!hasUsablePerch(t)) {
              let a = Math.tan(10.5 * Math.PI / 180);
              for (let o = 0; o < 6; o++) {
                let r = ((e + 7919 * o) * 0x9e3779b1 >>> 0) / 0x100000000,
                  n = ((e + 99 + 104729 * o) * 0x9e3779b1 >>> 0) / 0x100000000,
                  i = 2.3 + 0.5 * n,
                  l = 1.78 * a * i,
                  s = [(0.15 + 0.3 * r) * l, 0.183 * i + (viewportState.portrait ? -0.65 + (n - 0.5) * 0.2 : (n - 0.5) * 0.3) * a * i, -i],
                  h = [1.3 * l, s[1] + 0.1 + 0.25 * r, -i - 0.35 + 0.5 * n],
                  u = [s[0] - h[0], s[1] - h[1], s[2] - h[2]],
                  c = Math.hypot(u[0], u[1], u[2]),
                  d = generateSceneTree({
                    origin: h,
                    rootDir: u.map(e => e / c),
                    trunkLen: 1.7 * c,
                    trunkRadius: 0.012,
                    wobble: 0.22,
                    leafDensity: 0.7,
                    childrenByDepth: [3, 2, 1]
                  }, treePresets.length + 3 + o, e, 1, 2.2);
                if (hasUsablePerch([d]) || 5 === o) {
                  t.splice(treePresets.length - 1, 0, d);
                  break;
                }
              }
            }
            return t;
          }(e),
          a = (treeCache.has(e) || treeCache.set(e, -1), treeCache.get(e));
        a < 0 && (a = t.reduce((e, t) => e + t.anchors.length, 0), treeCache.set(e, a)), treeSeedOffset = a;
        let o = 0,
          r = 0;
        for (let e of t) o += e.positions.length / 3, r += e.indices.length;
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
          n.set(e.positions, 3 * c), i.set(e.normals, 3 * c), l.set(e.colors, 3 * c), s.set(e.flex, c), h.set(e.uvs, 2 * c);
          for (let t = 0; t < e.indices.length; t++) u[d + t] = e.indices[t] + c;
          c += e.positions.length / 3, d += e.indices.length, f.push(...e.anchors);
        }
        let {
          perch: m
        } = selectBirdPerch(t);
        return {
          pos: n,
          nor: i,
          col: l,
          flx: s,
          uv: h,
          ind: u,
          anchors: f,
          perch: m,
          parts: t
        };
      }(e);
      selectedPerch = viewportState.portrait ? function (e) {
        let t = null,
          a = 0.62,
          o = 1;
        e: for (let r of [1, 1.15]) {
          for (let n of [0.62, 0.7, 0.78, 0.54, 0.46, 0.86]) {
            viewportState.zoom = r, viewportState.cx = n, updateCameraFraming();
            let i = selectBirdPerch(e);
            if ((!t || i.pass < t.pass || i.pass === t.pass && i.score < t.score) && (t = i, a = n, o = r), 0 === i.pass) break e;
          }
          if (t.pass <= 1) break;
        }
        return viewportState.zoom = o, viewportState.cx = a, updateCameraFraming(), t.perch;
      }(t.parts) : t.perch, hideBird();
      let o = new THREE.BufferGeometry();
      o.setAttribute("position", new THREE.BufferAttribute(t.pos, 3)), o.setAttribute("normal", new THREE.BufferAttribute(t.nor, 3)), o.setAttribute("color", new THREE.BufferAttribute(t.col, 3)), o.setAttribute("aFlex", new THREE.BufferAttribute(t.flx, 1)), o.setAttribute("uv", new THREE.BufferAttribute(t.uv, 2)), o.setIndex(new THREE.BufferAttribute(t.ind, 1)), (treeMesh = new THREE.Mesh(o, barkMaterial)).frustumCulled = !1, scene.add(treeMesh);
      let r = t.anchors.slice();
      {
        let t = e >>> 0 || 1,
          a = () => (t = 1664525 * t + 0x3c6ef35f >>> 0) / 0x100000000;
        for (let e = r.length - 1; e > 0; e--) {
          let t = Math.floor(a() * (e + 1)),
            o = r[e];
          r[e] = r[t], r[t] = o;
        }
      }
      let n = r.slice(0, Math.min(r.length, Math.round(0 * treeSeedOffset / 2.2))),
        i = t.anchors;
      t.anchors = n;
      let l = t.anchors.length,
        s = new THREE.InstancedBufferGeometry(),
        h = function () {
          let e = new THREE.PlaneGeometry(1, 1, 1, 2);
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
            h = new THREE.BufferGeometry(),
            u = new Float32Array(r.length + 12);
          u.set(r), u.set([-0.02, 0, 0, 0.02, 0, 0, -0.014, 0.16, 0, 0.014, 0.16, 0], r.length);
          let c = new Float32Array(n.length + 12);
          c.set(n), c.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], n.length);
          let d = new Float32Array(i.length + 8);
          d.set(i), d.set([0.485, 0.01, 0.515, 0.01, 0.485, 0.095, 0.515, 0.095], i.length);
          let f = new Uint16Array(l.length + 6);
          return f.set(l), f.set([s, s + 1, s + 2, s + 1, s + 3, s + 2], l.length), h.setAttribute("position", new THREE.BufferAttribute(u, 3)), h.setAttribute("normal", new THREE.BufferAttribute(c, 3)), h.setAttribute("uv", new THREE.BufferAttribute(d, 2)), h.setIndex(new THREE.BufferAttribute(f, 1)), h;
        }();
      s.index = h.index, s.attributes.position = h.attributes.position, s.attributes.normal = h.attributes.normal, s.attributes.uv = h.attributes.uv;
      let u = new Float32Array(16 * l),
        c = new Float32Array(3 * l),
        d = new Float32Array(3 * l),
        f = new Float32Array(2 * l),
        m = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]],
        p = new Float32Array(3 * l),
        v = new Float32Array(3 * l),
        g = new Float32Array(l);
      for (let e = 0; e < l; e++) {
        let a = t.anchors[e];
        leafUp.set(a.out[0], a.out[1], a.out[2]).addScaledVector(leafTangent.set(a.along[0], a.along[1], a.along[2]), 0.55), leafUp.y += 0.05 - 0.6 * a.droop, leafUp.normalize(), leafBasis.crossVectors(leafUp, leafTangent.set(0, 1, 0)), 1e-6 > leafBasis.lengthSq() && leafBasis.set(1, 0, 0), leafBasis.normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize(), leafRotation.setFromAxisAngle(leafUp, 0.8 * a.roll), leafForward.applyQuaternion(leafRotation), p.set([leafUp.x, leafUp.y, leafUp.z], 3 * e), v.set([leafForward.x, leafForward.y, leafForward.z], 3 * e), g[e] = a.size;
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
          a[3 * o] = y[3 * o] + p[3 * o] * r, a[3 * o + 1] = y[3 * o + 1] + p[3 * o + 1] * r, a[3 * o + 2] = y[3 * o + 2] + p[3 * o + 2] * r;
          let n = t(Math.round(a[3 * o] / 0.1034), Math.round(a[3 * o + 1] / 0.1034), Math.round(a[3 * o + 2] / 0.1034));
          e.has(n) || e.set(n, []), e.get(n).push(o);
        }
        for (let o = 0; o < 3; o++) {
          let r = 2 === o;
          for (let o = 0; o < l; o++) {
            let n = Math.round(a[3 * o] / 0.1034),
              i = Math.round(a[3 * o + 1] / 0.1034),
              l = Math.round(a[3 * o + 2] / 0.1034);
            for (let s = -1; s <= 1; s++) for (let h = -1; h <= 1; h++) for (let u = -1; u <= 1; u++) {
              let c = e.get(t(n + s, i + h, l + u));
              if (c) for (let e of c) {
                if (e <= o) continue;
                let t = a[3 * e] - a[3 * o],
                  n = a[3 * e + 1] - a[3 * o + 1],
                  i = a[3 * e + 2] - a[3 * o + 2],
                  l = Math.hypot(t, n, i),
                  s = 0.1034 * (g[o] + g[e]) * 0.5;
                if (l >= s) continue;
                let h = 0.25 + 0.65 * (1 - l / s),
                  u = v[3 * o] * v[3 * e] + v[3 * o + 1] * v[3 * e + 1] + v[3 * o + 2] * v[3 * e + 2] < 0 ? -1 : 1,
                  c = 0,
                  d = 0,
                  f = 0;
                for (let t = 0; t < 3; t++) {
                  let a = v[3 * o + t],
                    r = v[3 * e + t];
                  v[3 * o + t] = a + r * u * h, v[3 * e + t] = r + a * u * h;
                }
                let m = Math.hypot(v[3 * o], v[3 * o + 1], v[3 * o + 2]) || 1;
                if (c = v[3 * o] / m, d = v[3 * o + 1] / m, f = v[3 * o + 2] / m, r && l < 0.55 * s) {
                  let a = t * c + n * d + i * f >= 0 ? 1 : -1,
                    r = Math.min(0.007, (0.55 * s - l) * 0.5);
                  for (let t = 0; t < 3; t++) {
                    let n = [c, d, f][t] * a * r;
                    y[3 * e + t] += n, y[3 * o + t] -= n;
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
        leafUp.set(p[3 * e], p[3 * e + 1], p[3 * e + 2]), leafForward.set(v[3 * e], v[3 * e + 1], v[3 * e + 2]).normalize(), leafBasis.crossVectors(leafUp, leafForward).normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize();
        let r = 0.094 * g[e],
          n = r * (0.85 + 0.3 * Math.random()),
          i = r * (0.7 + 0.9 * Math.random());
        leafMatrix.makeBasis(leafBasis.multiplyScalar(n), leafUp.multiplyScalar(r), leafForward.multiplyScalar(i)), leafMatrix.setPosition(y[3 * e], y[3 * e + 1], y[3 * e + 2]), u.set(leafMatrix.elements, 16 * e);
        let l = Math.random();
        a = l < 0.1 ? [1.14, 1.05, 0.7] : l < 0.48 ? [0.36, 0.41, 0.28] : l < 0.68 ? [0.62, 0.68, 0.5] : [1, 1, 1];
        let s = (0.85 + 0.35 * Math.random()) * (0.62 + 0.42 * o.flex) * 1;
        c.set([a[0] * s, a[1] * s, a[2] * s], 3 * e), d.set([Math.random() * Math.PI * 2, o.flex, 0.5 + 0.55 * Math.random()], 3 * e), f.set(m[4 * Math.random() | 0], 2 * e);
      }
      let w = new THREE.InstancedBufferAttribute(u, 16);
      s.setAttribute("instanceMatrix", w), s.setAttribute("aTint", new THREE.InstancedBufferAttribute(c, 3)), s.setAttribute("aWindI", new THREE.InstancedBufferAttribute(d, 3)), s.setAttribute("aUvCell", new THREE.InstancedBufferAttribute(f, 2)), s.instanceCount = l, (leafMesh = new THREE.Mesh(s, leafMaterial)).frustumCulled = !1, scene.add(leafMesh), function (e, t) {
        if (!e.length) return;
        sparseLeafMaterial || ((sparseLeafMaterial = leafMaterial.clone()).uniforms = Object.assign({}, leafMaterial.uniforms, {
          map: {
            value: leafShapeTexture
          }
        }));
        let o = 7 * t + 13 >>> 0 || 1,
          r = () => (o = 1664525 * o + 0x3c6ef35f >>> 0) / 0x100000000,
          n = [],
          i = Math.min(e.length, 1300) / e.length;
        for (let t of e) r() < i && n.push(t);
        let l = n.length,
          s = new THREE.InstancedBufferGeometry(),
          h = new THREE.PlaneGeometry(1, 1, 1, 1);
        h.translate(0, 0.5, 0), s.index = h.index, s.attributes.position = h.attributes.position, s.attributes.normal = h.attributes.normal, s.attributes.uv = h.attributes.uv;
        let u = new Float32Array(16 * l),
          c = new Float32Array(3 * l),
          d = new Float32Array(3 * l),
          f = new Float32Array(2 * l),
          m = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]];
        for (let e = 0; e < l; e++) {
          let t = n[e];
          leafUp.set(t.along[0], t.along[1], t.along[2]).addScaledVector(leafTangent.set(t.out[0], t.out[1], t.out[2]), 0.7).normalize(), leafBasis.crossVectors(leafUp, leafTangent.set(0, 1, 0)), 1e-6 > leafBasis.lengthSq() && leafBasis.set(1, 0, 0), leafBasis.normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize();
          let a = 0.013 + 0.01 * r();
          leafMatrix.makeBasis(leafBasis.multiplyScalar(0.55 * a), leafUp.multiplyScalar(a), leafForward.multiplyScalar(0.55 * a)), leafMatrix.setPosition(t.p[0], t.p[1], t.p[2]), u.set(leafMatrix.elements, 16 * e);
          let o = 0.85 + 0.3 * r();
          c.set([o, o * (0.96 + 0.06 * r()), 0.9 * o], 3 * e), d.set([r() * Math.PI * 2, t.flex, 0.15], 3 * e), f.set(m[4 * r() | 0], 2 * e);
        }
        s.setAttribute("instanceMatrix", new THREE.InstancedBufferAttribute(u, 16)), s.setAttribute("aTint", new THREE.InstancedBufferAttribute(c, 3)), s.setAttribute("aWindI", new THREE.InstancedBufferAttribute(d, 3)), s.setAttribute("aUvCell", new THREE.InstancedBufferAttribute(f, 2)), s.instanceCount = l, (sparseLeafMesh = new THREE.Mesh(s, sparseLeafMaterial)).frustumCulled = !1, scene.add(sparseLeafMesh);
      }(i, e);
      let b = 0;
      for (let e of i) b += Math.hypot(e.p[0], e.p[1], e.p[2]);
      focusDistance = Math.max(1.2, b / Math.max(1, i.length) * 0.92);
    }
    let birdGroup = new THREE.Group();
    birdGroup.visible = !1, scene.add(birdGroup);
    let birdClones = [],
      birdCloneOpacity = [0.3, 0.14, 0.06],
      birdReady = !1,
      birdAnimations = null,
      birdActors = [],
      birdMaterials = [],
      birdTextureLoader = new THREE.TextureLoader(),
      loadBirdTexture = (e, t) => {
        let o = birdTextureLoader.load(e, e => {
          try {
            renderer.initTexture(e);
          } catch (e) {}
        });
        return o.flipY = !1, t && (o.colorSpace = THREE.SRGBColorSpace), o.anisotropy = 4, o;
      },
      birdTextures = {
        map: loadBirdTexture(assetUrl("tit_diff.webp"), !0),
        normal: loadBirdTexture(assetUrl("tit_norm.webp"), !1),
        rough: loadBirdTexture(assetUrl("tit_rgh.webp"), !1)
      };
    function setupBirdActor(e, t) {
      e.traverse(e => {
        e.isMesh && (e.frustumCulled = !1, e.material = new THREE.MeshStandardMaterial({
          map: birdTextures.map,
          normalMap: birdTextures.normal,
          normalScale: new THREE.Vector2(0.45, 0.45),
          roughnessMap: birdTextures.rough,
          roughness: 0.72,
          metalness: 0,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: birdTextures.map,
          emissiveIntensity: 0.18
        }), birdMaterials.push(e.material), applyLeafLook(lookTransition.d, lookTransition.n, lookTransition.t), t < 1 && (e.material.transparent = !0, e.material.opacity = t, e.material.depthWrite = !1));
      });
      let o = new THREE.AnimationMixer(e),
        r = o.clipAction(birdAnimations.flap),
        n = o.clipAction(birdAnimations.perch),
        i = o.clipAction(birdAnimations.fold);
      return r.play(), n.play(), i.play(), n.setEffectiveWeight(0), i.setEffectiveWeight(0), {
        root: e,
        mixer: o,
        flap: r,
        perch: n,
        fold: i,
        bones: function (e) {
          let t = {
            list: [],
            clean: [],
            cleanScale: [],
            rest: {}
          };
          for (let a of boneNames) {
            let o = e.getObjectByName(a);
            o && (t.list.push(o), t.clean.push(o.quaternion.clone()), t.cleanScale.push(o.scale.clone()), t.rest[a] = o.quaternion.clone(), t[a] = o);
          }
          return t;
        }(e)
      };
    }
    let birdRootOffset = [0, 0.085, 0.545];
    Promise.resolve(options.bird || assetUrl("tit.glb")).then(e => new gltfModule.GLTFLoader().load(e, e => {
      var t;
      let o,
        r,
        n,
        i = t => e.animations.find(e => e.name.toLowerCase().includes(t)) || e.animations[0];
      for (let l of (birdAnimations = {
        flap: i("flap"),
        perch: i("perch"),
        fold: e.animations.find(e => e.name.toLowerCase().includes("fold")) || i("perch")
      }, e.scene.scale.setScalar(1.1 * (viewportState.portrait ? 0.82 : 1)), t = e.scene, o = new THREE.Vector3(), r = new THREE.Vector3(...birdRootOffset), n = new THREE.Vector3(), t.traverse(e => {
        if (!e.isSkinnedMesh) return;
        let t = e.geometry.attributes.position,
          i = e.geometry.attributes.skinIndex,
          l = e.geometry.attributes.skinWeight,
          s = e.skeleton.bones.map(e => e.name);
        for (let e = 0; e < t.count; e++) {
          let a = 0,
            h = -1;
          for (let t = 0; t < 4; t++) {
            let o = l.getComponent(e, t);
            o > h && (h = o, a = i.getComponent(e, t));
          }
          let u = s[a];
          if (o.fromBufferAttribute(t, e), "body" === u || "head" === u) {
            let e = (o.z - 0.06) / (o.z < 0.06 ? 0.52 : 1),
              t = Math.sqrt(Math.max(0.2, 1 - e * e));
            o.x *= t, o.y = 0.04 + (o.y - 0.04) * t;
            let a = 0.55 * smoothstep((o.z - 0.38) / 0.14),
              i = o.z > 0.64 && 0.08 > Math.abs(o.x) && o.y > 0.05 && o.y < 0.17;
            if (a > 0 && !i) {
              n.copy(o).sub(r);
              let e = n.length() || 1;
              o.lerp(n.multiplyScalar(0.195 / e).add(r), a);
            }
          } else if ("tail" === u) {
            let e = Math.max(0, (-0.218 - o.z) / 0.544);
            o.z = -0.218 + (o.z - -0.218) * 0.85, o.x *= 1 + (1.35 - 1) * e;
          }
          t.setXYZ(e, o.x, o.y, o.z);
        }
        t.needsUpdate = !0;
        let h = e.geometry;
        h.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(3 * t.count), 3)), h.computeVertexNormals();
        let u = h.attributes.normal;
        for (let e = 0; e < u.count; e++) 0.5 > Math.hypot(u.getX(e), u.getY(e), u.getZ(e)) && u.setXYZ(e, 0, 1, 0);
        h.computeBoundingSphere();
      }), function (e) {
        let t = new Map();
        e.traverse(e => {
          e.isSkinnedMesh && (t.has(e.skeleton) || t.set(e.skeleton, []), t.get(e.skeleton).push(e));
        });
        let o = new THREE.Matrix4(),
          r = new THREE.Matrix4(),
          n = new THREE.Vector3(),
          i = new THREE.Vector3(),
          l = new THREE.Vector3();
        for (let [e, s] of t) {
          let t = e.bones.slice(),
            h = e.boneInverses.map(e => e.clone()),
            u = s.map(e => ({
              mesh: e,
              geo: e.geometry,
              slotOf: new Int8Array(e.geometry.attributes.position.count),
              dist: new Float32Array(e.geometry.attributes.position.count)
            }));
          for (let e of ["L", "R"]) {
            let s = t.findIndex(t => t.name === "wing" + e);
            if (s < 0) continue;
            let c = t[s];
            o.copy(h[s]).invert(), n.setFromMatrixPosition(o);
            let d = 0;
            for (let e of (i.copy(n), u)) {
              let t = e.geo.attributes.position,
                a = e.geo.attributes.skinIndex,
                o = e.geo.attributes.skinWeight;
              r.copy(e.mesh.bindMatrix);
              for (let h = 0; h < t.count; h++) {
                let u = -1;
                for (let e = 0; e < 4; e++) a.getComponent(h, e) === s && o.getComponent(h, e) > 0 && (u = e);
                if (e.slotOf[h] = u, u < 0) continue;
                let c = e.dist[h] = l.fromBufferAttribute(t, h).applyMatrix4(r).distanceTo(n);
                o.getComponent(h, u) >= 0.5 && c > d && (d = c, i.copy(l));
              }
            }
            if (d < 1e-4) continue;
            let f = new THREE.Bone();
            f.name = "wrist" + e, f.position.copy(l.copy(n).lerp(i, 0.5).applyMatrix4(h[s])), c.add(f), c.updateMatrixWorld(!0), t.push(f), h.push(o.multiply(f.matrix).clone().invert());
            let m = t.length - 1;
            for (let e of u) {
              let t = e.geo.attributes.skinIndex,
                a = e.geo.attributes.skinWeight;
              for (let o = 0; o < e.slotOf.length; o++) {
                let r = e.slotOf[o];
                if (r < 0) continue;
                let n = smoothstep((e.dist[o] / d - 0.39) / 0.22);
                if (n <= 0) continue;
                let i = a.getComponent(o, r),
                  l = -1;
                for (let e = 0; e < 4; e++) if (e !== r && 0 === a.getComponent(o, e)) {
                  l = e;
                  break;
                }
                if (l < 0) {
                  n > 0.5 && t.setComponent(o, r, m);
                  continue;
                }
                a.setComponent(o, r, i * (1 - n)), t.setComponent(o, l, m), a.setComponent(o, l, i * n);
              }
              t.needsUpdate = !0, a.needsUpdate = !0;
            }
          }
          let c = new THREE.Skeleton(t, h);
          for (let e of s) e.bind(c, e.bindMatrix);
        }
      }(e.scene), birdGroup.add(e.scene), birdActors.push(setupBirdActor(e.scene, 1)), birdCloneOpacity)) {
        let t = new THREE.Group(),
          o = function (e) {
            let t = new Map(),
              a = new Map(),
              o = e.clone(),
              r = (e, t, a) => {
                a(e, t);
                for (let o = 0; o < e.children.length; o++) r(e.children[o], t.children[o], a);
              };
            return r(e, o, (e, o) => {
              t.set(o, e), a.set(e, o);
            }), o.traverse(e => {
              if (!e.isSkinnedMesh) return;
              let o = t.get(e);
              e.skeleton = o.skeleton.clone(), e.bindMatrix.copy(o.bindMatrix), e.skeleton.bones = o.skeleton.bones.map(e => a.get(e)), e.bind(e.skeleton, e.bindMatrix);
            }), o;
          }(e.scene);
        t.add(o), t.visible = !1, scene.add(t), birdClones.push(t), birdActors.push(setupBirdActor(o, l));
      }
      let l = birdGroup.visible;
      for (let e of (birdGroup.visible = !0, birdClones)) e.visible = !0;
      try {
        renderer.compile(scene, camera);
      } catch (e) {}
      for (let e of (birdGroup.visible = l, birdClones)) e.visible = !1;
      birdReady = !0;
    }));
    let wingRelaxation = 0.9,
      boneRotation = new THREE.Quaternion(),
      axisX = new THREE.Vector3(1, 0, 0),
      axisY = new THREE.Vector3(0, 1, 0),
      axisZ = new THREE.Vector3(0, 0, 1),
      boneNames = ["wingL", "wingR", "wristL", "wristR", "tail", "head", "legs"],
      perchBlend = 1,
      boneTempRotation = new THREE.Quaternion(),
      rotateBone = (e, t, a) => e.quaternion.multiply(boneRotation.setFromAxisAngle(t, a));
    function applyBirdAnimation(e, t, a, o = 0) {
      let r = Math.min(1, t + o * (1 - t));
      e.flap.setEffectiveWeight(1 - r), e.perch.setEffectiveWeight(t), e.fold.setEffectiveWeight(o * (1 - t));
      e.flap.time = (0.52 * a % 1.04 + 1.04) % 1.04;
      let n = e.bones;
      for (let e = 0; e < n.list.length; e++) n.list[e].quaternion.copy(n.clean[e]), n.list[e].scale.copy(n.cleanScale[e]);
      e.mixer.update(0);
      for (let e = 0; e < n.list.length; e++) n.clean[e].copy(n.list[e].quaternion), n.cleanScale[e].copy(n.list[e].scale);
      let i = 0.07 * Math.sin(7.31 * Math.floor(a) + 1.7) * (1 - r),
        l = Math.min(1, Math.max(0, (1 - wingRelaxation) * (1 - r) + i));
      return l > 0.001 && (n.wingL && n.wingL.quaternion.slerp(n.rest.wingL, l), n.wingR && n.wingR.quaternion.slerp(n.rest.wingR, l)), n.tail && (n.tail.scale.x = 1 + 1.5 * headTurnAmount * (1 - t)), n.legs && (n.legs.quaternion.slerpQuaternions(n.rest.legs, boneTempRotation.copy(n.rest.legs).multiply(boneRotation.setFromAxisAngle(axisX, 0.96)), 1 - perchBlend), n.legs.scale.setScalar(0.55 + 0.8 * perchBlend)), (1 - r) * wingRelaxation;
    }
    let headTurnAmount = 0;
    function computeWindOffset(e, t, a, o, r) {
      let n = 0.7 * t[0] + 0.5 * t[2] + 0.3 * t[1] - 0.6 * a * lagUniform.value,
        i = Math.sin(1.05 * o + n),
        l = Math.sin(2.3 * o + 1.6 * n + 1.3),
        s = Math.sin(4.7 * o + 2.9 * n + 4.1) * a * a,
        h = r * a * a * (0.35 + 0.65 * a),
        u = (0.58 * i + 0.24 * l + 0.07 * s) * h * 0.085,
        c = o - landingUniform.value.w,
        d = t[0] - landingUniform.value.x,
        f = t[1] - landingUniform.value.y,
        m = t[2] - landingUniform.value.z,
        p = Math.sqrt(d * d + f * f + m * m),
        v = 1 - Math.min(1, Math.max(0, p / 0.9)) ** 2 * (3 - 2 * Math.min(1, p / 0.9)),
        g = landingSpringUniform.value,
        y = c > 0 && c < 3 ? -Math.sin(c * g.y) * Math.exp(-c * g.z) * g.x * (0.3 + 0.7 * a) * v : 0;
      return e.set(0.72 * u, 0.18 * u + (0.45 * l + 0.15 * s) * h * 0.028 + y, 0.55 * u), e;
    }
    let birdState = "away",
      flightElapsed = 0,
      flightDuration = 0,
      nextDepartureAt = 0,
      nextFlightAt = 0,
      wingFlutterAt = 0,
      bodySway = 0,
      targetBodySway = 0,
      foldAmount = 0,
      flapRate = () => "in" === birdState ? 9 : "out" === birdState ? 12 : flapScheduleBeats,
      landingBounce = 0,
      flapScheduleBeats = 10,
      wingBeatPhase = 0,
      flapSchedule = [];
    function buildFlapSchedule(e) {
      flapSchedule = [];
      let t = 0,
        a = 0;
      for (viewportState.portrait, wingBeatPhase = 0; t < e + 2;) {
        let e = 24 + Math.floor(17 * Math.random()),
          o = e / flapScheduleBeats,
          r = 0.09 + 0.07 * Math.random();
        flapSchedule.push({
          t0: t,
          on: o,
          off: r,
          beats: e,
          beat0: a
        }), t += o + r, a += e;
      }
    }
    let createFlapState = () => ({
        flapW: 1,
        beat: 0,
        y: 0,
        burst: 0
      }),
      flapStateA = createFlapState(),
      flapStateB = createFlapState();
    function sampleFlapSchedule(e, t = flapStateA) {
      flapSchedule.length || buildFlapSchedule(6);
      let a = flapSchedule[flapSchedule.length - 1];
      for (let t of flapSchedule) if (e >= t.t0) a = t;else break;
      let o = e - a.t0,
        r = o < a.on,
        n = r ? o / a.on : Math.min(1, (o - a.on) / a.off);
      return t.flapW = Math.min(smoothstep((o + 0.02) / 0.11), smoothstep((a.on + 0.05 - o) / 0.16)), t.beat = a.beat0 + (r ? n * a.beats : a.beats), t.y = r ? -Math.cos(n * Math.PI) : Math.cos(n * Math.PI), t.burst = r ? Math.sin(n * Math.PI) : 0, t;
    }
    let flightPathPhase = 0,
      flightPathScale = 1,
      flightPathWobble = 1,
      flightStart = new THREE.Vector3(),
      flightControl = new THREE.Vector3(),
      flightEnd = new THREE.Vector3(),
      flightPosition = new THREE.Vector3(),
      flightLookAt = new THREE.Vector3(),
      flightOffset = new THREE.Vector3(),
      smoothstep = e => (e = Math.min(1, Math.max(0, e))) * e * (3 - 2 * e);
    function hideBird() {
      for (let e of (birdState = "away", birdGroup.visible = !1, birdClones)) e.visible = !1;
      nextFlightAt = timeUniform.value + (timeUniform.value < 1 ? 3 : 14 + 20 * Math.random());
    }
    function startBirdCrossing() {
      let e = 3.55 * Math.tan(10.5 * Math.PI / 180),
        t = viewportState.portrait ? 0.25 + 0.15 * Math.random() : 0.9 + 0.5 * Math.random(),
        a = 3.55 - (t < 0 ? -(0.5 * t) : 0),
        o = e => 0.183 * a + Math.tan(10.5 * Math.PI / 180) * a * ((viewportState.portrait ? e / viewportState.zoom : e) + viewportState.cy),
        r = cloudMesh.material.uniforms.uShelterA.value,
        n = r.w > r.y ? r.y - 0.015 : 0,
        i = !viewportState.portrait && n - 0.13 >= 0.06,
        l = o(viewportState.portrait ? -0.24 : i ? 1 - 2 * n : 0.14),
        s = o(viewportState.portrait ? 0.1 : i ? 1 - 2 * (0.13 + 0.4 * (n - 0.13)) : 0.52),
        h = o(viewportState.portrait ? 0.14 : i ? 0.74 : 0.58),
        u = l + Math.random() * (s - l),
        c = l + Math.random() * (s - l),
        d = (viewportState.max - viewportState.min) / 2 * e * (16 / 9),
        f = viewportState.portrait ? d : e * (viewportState.w / viewportState.h),
        m = viewportState.portrait ? (viewportState.min + viewportState.max) / 2 * e * (16 / 9) : 0,
        p = f + (viewportState.portrait ? 0.35 : 0.5),
        v = (0.5 > Math.random() ? 1 : -1) * (viewportState.portrait ? 0.45 + 0.2 * Math.random() : 0.9 + 0.5 * Math.random());
      flightStart.set(m - p, u, -3.55 - v / 2 + (Math.random() - 0.5) * 0.2), flightEnd.set(m + p, c, flightStart.z + v), flightControl.copy(flightStart).lerp(flightEnd, 0.4 + 0.2 * Math.random()), flightControl.y = Math.min(flightControl.y + 0.04 + 0.12 * Math.random(), h), flightControl.z += -t, flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), buildFlapSchedule(6), birdState = "cross", flightDuration = pathLength / (viewportState.portrait ? 1.5 : 3), flightElapsed = 0, birdGroup.visible = !0, foldAmount = 0;
    }
    function perchBird(e, t) {
      birdState = "perched", birdGroup.visible = !0, foldAmount = 1, hopYaw = 0, microMotion = null, headTurnOffset = 0, nextMicroMotionAt = e + t, nextDepartureAt = e + 12 + 14 * Math.random(), wingFlutterAt = e + 1.5, bodySway = 0, targetBodySway = 0;
    }
    let departureLift = 0.42,
      departureSide = -1,
      departureStartQuat = new THREE.Quaternion(),
      departureEndQuat = new THREE.Quaternion(),
      savedBirdQuat = new THREE.Quaternion(),
      flightLookObject = new THREE.Object3D();
    function departBird() {
      if (!selectedPerch) return;
      departureSide = -1, getPerchPosition(flightStart), microMotion = null, headTurnOffset = 0, flightControl.set(flightStart.x + 1.1 * departureSide, flightStart.y + 0.12 + 0.06 * Math.random(), flightStart.z + 0.2);
      let e = flightStart.z - 1.4 - 0.4 * Math.random(),
        t = -e,
        a = viewportState.min * Math.tan(10.5 * Math.PI / 180) * t * (16 / 9);
      flightEnd.set(Math.min(flightStart.x - 2.6, a - 0.6), flightStart.y + 0.75 + 0.2 * Math.random(), e), flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), buildFlapSchedule(4), birdState = "out", flightDuration = 2, flightElapsed = 0, departureStartQuat.copy(birdGroup.quaternion), flightLookObject.position.copy(birdGroup.position), flightLookObject.lookAt(flightStart.x + +departureSide, flightStart.y + 0.02, flightStart.z + 0.22), flightLookObject.rotateX(-0.3), departureEndQuat.copy(flightLookObject.quaternion), departureLift = departureSide < 0 ? 0.42 : 0.68;
    }
    let pathLengthTable = new Float32Array(65),
      pathLength = 1,
      pathPointA = new THREE.Vector3(),
      pathPointB = new THREE.Vector3();
    function sampleBezierPath(e, t) {
      let a = 1 - t;
      return e.set(a * a * flightStart.x + 2 * a * t * flightControl.x + t * t * flightEnd.x, a * a * flightStart.y + 2 * a * t * flightControl.y + t * t * flightEnd.y, a * a * flightStart.z + 2 * a * t * flightControl.z + t * t * flightEnd.z);
    }
    function buildPathLengthTable() {
      let e = 0;
      pathLengthTable[0] = 0, sampleBezierPath(pathPointA, 0);
      for (let t = 1; t <= 64; t++) sampleBezierPath(pathPointB, t / 64), e += pathPointB.distanceTo(pathPointA), pathLengthTable[t] = e, pathPointA.copy(pathPointB);
      pathLength = e || 1;
      for (let e = 1; e <= 64; e++) pathLengthTable[e] /= pathLength;
    }
    let arrivalQuat = new THREE.Quaternion(),
      arrivalDelay = 0,
      lastPerchAt = -10,
      pathTime = 0,
      lastFlightAt = -10;
    function screenToWorld(e, t, a, o) {
      return e.set(2 * t - 1, -(2 * a - 1), 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(o).add(camera.position), e;
    }
    function startBirdArrival() {
      if (!selectedPerch || !birdReady) return;
      flightEnd.fromArray(selectedPerch.p), flightEnd.y += 0.004, pointerRay.set(flightEnd.x, flightEnd.y, flightEnd.z).project(camera);
      let e = (pointerRay.x + 1) / 2,
        t = (1 - pointerRay.y) / 2,
        a = flightEnd.distanceTo(camera.position);
      screenToWorld(flightStart, 1.1, Math.min(0.96, t + 0.17 + 0.06 * Math.random()), a + 1.1 + 0.3 * Math.random()), screenToWorld(flightControl, Math.min(0.98, e + 0.1 + 0.03 * Math.random()), Math.min(0.97, t + 0.1 + 0.03 * Math.random()), a + 0.3), flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), flightLookObject.position.copy(flightEnd), flightLookObject.lookAt(flightEnd.x - 1, flightEnd.y + 0.02, flightEnd.z + 0.22), flightLookObject.rotateX(-0.3), arrivalQuat.copy(flightLookObject.quaternion), birdState = "in", flightDuration = 1.5, flightElapsed = 0, arrivalDelay = 0, birdGroup.visible = !0, foldAmount = 0;
    }
    function sampleFlightPath(e, t, a) {
      return sampleBezierPath(e, function (e) {
        if (e <= 0) return 0;
        if (e >= 1) return 1;
        let t = 0,
          a = 64;
        for (; a - t > 1;) {
          let o = t + a >> 1;
          pathLengthTable[o] <= e ? t = o : a = o;
        }
        let o = pathLengthTable[a] - pathLengthTable[t];
        return (t + (o > 1e-9 ? (e - pathLengthTable[t]) / o : 0)) / 64;
      }(t)), a && (e.y += wingBeatPhase * a.y * landingBounce), e;
    }
    let frameDelta = 0.016,
      birdRoll = 0,
      arrivalWingFold = 0;
    function animateBirdAlongPath(e, t, a, o, r, n) {
      let i = Math.min(1, Math.max(0, a + (0.022 * Math.sin(1.1 * n * flightPathScale + flightPathPhase) * flightPathWobble + ("in" === birdState ? 0 : 0.0015 * Math.sin(2 * o * Math.PI - 1.2))) + (r ? 0 * r.y * landingBounce : 0))),
        l = r && wingBeatPhase > 0 ? sampleFlapSchedule(n + 0.02 * flightDuration, flapStateB) : r;
      sampleFlightPath(flightPosition, i, r), sampleFlightPath(flightLookAt, Math.min(1, i + 0.02), l), r && wingBeatPhase > 0 && (flightLookAt.y -= wingBeatPhase * (l.y - r.y) * landingBounce * 0.55), flightPosition.z += 0, flightLookAt.z += 0 + 0.03 * Math.cos(1.4 * n + flightPathPhase) * 0.6 * flightPathWobble, flightPosition.y += 0, flightLookAt.y += 0, e.position.copy(flightPosition), flightLookAt.distanceToSquared(flightPosition) > 1e-9 && e.lookAt(flightLookAt), sampleFlightPath(tmpVecB, Math.min(1, i + 0.06), l), tmpVecB.z += 0, tmpVecB.y += 0, tmpVecC.copy(tmpVecB).sub(flightLookAt), inverseBirdQuat.copy(e.quaternion).invert(), tmpVecC.applyQuaternion(inverseBirdQuat);
      let s = Math.max(-0.26, Math.min(0.26, -(5 * (tmpVecC.lengthSq() > 1e-9 ? Math.atan2(tmpVecC.x, tmpVecC.z) : 0)))) * (1 - arrivalWingFold);
      e === birdGroup && (birdRoll += (s - birdRoll) * (1 - Math.exp(-(6 * (frameDelta || 0.016))))), e.rotateZ((e === birdGroup ? birdRoll : s) + ("cross" === birdState ? 0.06 : 0.05) * Math.sin(1.4 * n * flightPathScale + flightPathPhase) * flightPathWobble);
      let h = r ? 0.012 * r.burst * landingBounce : 0,
        u = (o % 1 + 1) % 1;
      e.rotateX(-h + 0.025 * Math.sin((u - 0.23) * 2 * Math.PI) * (1 - foldAmount)), "in" !== birdState && (e.position.y += 0.0025 * Math.sin(2 * o * Math.PI - 0.6));
      let c = applyBirdAnimation(t, foldAmount, o, r ? 0.55 * (1 - r.flapW) * landingBounce : 0);
      if (r) {
        var d, f;
        let a;
        !function (e, t, a) {
          if (a <= 0.001) return;
          let o = e.bones,
            r = o.wingL,
            n = o.wingR;
          if (!r || !n) return;
          let i = Math.cos((t - 0.23 - 0.25) * 2 * Math.PI),
            l = Math.max(0, -i),
            s = (i > 0 ? -0.14 * i : 0.3 * l) * a,
            h = 0.3 * l * a;
          if (rotateBone(r, axisZ, s), rotateBone(r, axisY, h), rotateBone(n, axisZ, -s), rotateBone(n, axisY, -h), o.wristL && o.wristR) {
            let e = l * l * 0.62 * a,
              r = 0.35 * l * a,
              n = 0.3 * Math.sin((t - 0.23) * 2 * Math.PI) * a;
            rotateBone(o.wristL, axisZ, e), rotateBone(o.wristL, axisX, n - r), rotateBone(o.wristR, axisZ, -e), rotateBone(o.wristR, axisX, n - r);
          }
        }(t, t.flap.time % 0.52 / 0.52, c), d = e === birdGroup ? birdRoll : s, f = 1 - arrivalWingFold, a = t.bones, !(f <= 0.001) && (a.head && rotateBone(a.head, axisY, -(0.65 * d) * f), a.tail && (rotateBone(a.tail, axisX, -(0.5 * h) * f), rotateBone(a.tail, axisZ, 0.6 * d * f)));
      } else t.bones.head && arrivalWingFold > 0 && rotateBone(t.bones.head, axisX, 0.55 * arrivalWingFold);
    }
    let microMotion = null,
      nextMicroMotionAt = 0,
      headTurnOffset = 0,
      hopYaw = 0,
      perchTangent = new THREE.Vector3();
    function getPerchPosition(e) {
      return e.fromArray(selectedPerch.p), hopYaw && selectedPerch.along && e.addScaledVector(perchTangent.fromArray(selectedPerch.along), hopYaw), e;
    }
    function getPerchLookAt(e) {
      return getPerchPosition(e), e.x -= 1, e.y += 0.02, e.z += 0.22, e;
    }
    let headYaw = 0,
      headPitch = 0,
      inverseBirdQuat = new THREE.Quaternion(),
      pointerRay = new THREE.Vector3(),
      headWorldPosition = new THREE.Vector3(),
      pagePaused = !1,
      departAfterResume = !1,
      pauseAnimation = () => {
        pagePaused = !0, reducedMotion || "perched" === birdState && (nextDepartureAt = 1 / 0);
      },
      resumeAnimation = () => {
        !pagePaused || (pagePaused = !1, reducedMotion || ("perched" === birdState ? nextDepartureAt = timeUniform.value + 12 + 14 * Math.random() : "away" === birdState ? startBirdArrival() : "in" !== birdState && (departAfterResume = !0)));
      },
      inViewport = !0,
      intersectionObserver = null;
    "u" > typeof IntersectionObserver && (intersectionObserver = new IntersectionObserver(e => {
      for (let t of e) inViewport = t.isIntersecting, t.intersectionRatio < 0.15 ? pauseAnimation() : t.intersectionRatio > 0.6 && resumeAnimation();
    }, {
      threshold: [0, 0.1, 0.15, 0.6, 0.7]
    })).observe(hostElement), listen(document, "visibilitychange", () => {
      document.hidden ? pauseAnimation() : resumeAnimation();
    }), listen(window, "blur", pauseAnimation), listen(window, "focus", resumeAnimation);
    let wheelDelta = 0;
    listen(window, "wheel", e => {
      (wheelDelta = Math.max(0, Math.min(1400, wheelDelta + e.deltaY))) > 800 ? pauseAnimation() : wheelDelta < 120 && resumeAnimation();
    }, {
      passive: !0
    });
    let sceneRenderTarget = null,
      skyRenderTarget = null,
      foregroundBlurTarget = null,
      backgroundBlurTarget = null,
      cloudRenderTarget = null,
      postprocessReady = !1,
      cocScale = 100,
      cloudCompositeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tSrc: {
            value: null
          }
        },
        transparent: !0,
        depthTest: !1,
        depthWrite: !1,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
        fragmentShader: "precision highp float; varying vec2 vUv; uniform sampler2D tSrc; void main() { gl_FragColor = texture2D(tSrc, vUv); }"
      }),
      postprocessShader = `
  vec4 finite4(vec4 v) {
    uvec4 b = floatBitsToUint(v);
    uvec4 keep = (uvec4(1u) - uvec4(equal(b & uvec4(0x7F800000u), uvec4(0x7F800000u)))) * uvec4(0xFFFFFFFFu);
    return uintBitsToFloat(b & keep);
  }
`,
      blurKernel = "",
      addKernelSample = (e, t, a) => {
        for (let o = 0; o < e; o++) {
          let r = o / e * Math.PI * 2 + a,
            n = (Math.cos(r) * t).toFixed(4),
            i = (Math.sin(r) * t).toFixed(4);
          blurKernel += `{
      vec2 uv2 = vUv + (ROT * vec2(${n}, ${i})) * uRadNow * uTexel;
      vec4 s = texture2D(tSrc, uv2);
      s.rgb *= 1.0 + smoothstep(1.15, 2.6, dot(s.rgb, vec3(0.3333))) * 0.7;
      accum += vec4(s.rgb * s.a, s.a);
    }
`;
        }
      };
    addKernelSample(1, 0, 0), addKernelSample(5, 0.16, 0.7), addKernelSample(8, 0.38, 0.3), addKernelSample(10, 0.55, 0.5), addKernelSample(12, 0.72, 0), addKernelSample(20, 0.87, 0.4), addKernelSample(16, 1, 0.15);
    let dofMaterial = new THREE.ShaderMaterial({
        depthTest: !1,
        depthWrite: !1,
        uniforms: {
          tSrc: {
            value: null
          },
          uTexel: {
            value: new THREE.Vector2()
          },
          uRadNow: {
            value: 0
          },
          uMaxCoC: {
            value: 36
          },
          uBgCap: {
            value: 10
          },
          uFgBlur: {
            value: 0
          },
          uBgBlur: {
            value: 10
          },
          uExposure: {
            value: 1
          },
          uGrain: {
            value: 0.028
          },
          uNear: {
            value: 0.1
          },
          uFar: {
            value: 700
          },
          uFocus: {
            value: 2.4
          },
          uCocScale: {
            value: 96
          }
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
      ${blurKernel}
      gl_FragColor = accum / 72.0;
    }
  `
      }),
      gradeMaterial = new THREE.ShaderMaterial({
        depthTest: !1,
        depthWrite: !1,
        uniforms: {
          tFol: {
            value: null
          },
          tFolB: {
            value: null
          },
          tSky: {
            value: null
          },
          tSkyB: {
            value: null
          },
          uFgBlur: dofMaterial.uniforms.uFgBlur,
          uBgBlur: dofMaterial.uniforms.uBgBlur,
          uExposure: dofMaterial.uniforms.uExposure,
          uTime: timeUniform,
          uGrain: dofMaterial.uniforms.uGrain,
          uGrainT: {
            value: 0.37
          },
          uWrap: {
            value: 1
          },
          uGlow: {
            value: 1
          },
          uCA: {
            value: 0
          },
          uNight: nightUniform,
          uDusk: duskUniform
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
    ${postprocessShader}
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
  `
      }),
      postScene = new THREE.Scene(),
      postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
      postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), dofMaterial);
    function renderPostprocess(e) {
      renderer.setRenderTarget(skyRenderTarget), renderer.setClearColor(0, 1), renderer.render(skyScene, camera), cloudStrengthUniform.value > 0.001 && (renderer.setRenderTarget(cloudRenderTarget), cloudMesh.material.uniforms.uRes.value.set(cloudRenderTarget.width, cloudRenderTarget.height), renderer.setClearColor(0, 0), renderer.clear(), renderer.render(cloudScene, camera), cloudCompositeMaterial.uniforms.tSrc.value = cloudRenderTarget.texture, postQuad.material = cloudCompositeMaterial, renderer.setRenderTarget(skyRenderTarget), renderer.autoClear = !1, renderer.render(postScene, postCamera), renderer.autoClear = !0), renderer.setRenderTarget(sceneRenderTarget), renderer.setClearColor(0, 0), renderer.render(scene, camera), postQuad.material = dofMaterial, dofMaterial.uniforms.tSrc.value = sceneRenderTarget.texture, dofMaterial.uniforms.uRadNow.value = dofMaterial.uniforms.uFgBlur.value, renderer.setRenderTarget(foregroundBlurTarget), renderer.render(postScene, postCamera), dofMaterial.uniforms.tSrc.value = skyRenderTarget.texture, dofMaterial.uniforms.uRadNow.value = dofMaterial.uniforms.uBgBlur.value, renderer.setRenderTarget(backgroundBlurTarget), renderer.render(postScene, postCamera), gradeMaterial.uniforms.tFol.value = sceneRenderTarget.texture, gradeMaterial.uniforms.tFolB.value = foregroundBlurTarget.texture, gradeMaterial.uniforms.tSky.value = skyRenderTarget.texture, gradeMaterial.uniforms.tSkyB.value = backgroundBlurTarget.texture, postQuad.material = gradeMaterial, renderer.setRenderTarget(e), renderer.render(postScene, postCamera);
    }
    postScene.add(postQuad);
    let focusDistance = 2.4,
      moonDistance = moonPosition.length();
    function setCameraPosition(e, t, a) {
      moonPosition.set(e, t, a), moonMesh.position.copy(moonPosition);
      let o = moonPosition.clone().normalize();
      for (let e of [skyMesh.material, moonMesh.material, cloudMesh.material]) e.uniforms.uMoonDir && e.uniforms.uMoonDir.value.copy(o);
      nightSunDirection.copy(o), nightLook.sunDir.copy(o);
    }
    let currentFocusDistance = 1 / moonDistance,
      targetFocusDistance = 1 / moonDistance;
    listen(canvas, "click", t => {
      if (reducedMotion) return;
      let a = hostElement.getBoundingClientRect();
      "perched" === birdState ? isPointerOverBird(t.clientX - a.left, t.clientY - a.top) && departBird() : "away" === birdState && startBirdCrossing();
    });
    let isPortrait = hostElement.clientWidth < hostElement.clientHeight,
      seedPool = (isPortrait ? options.seeds?.mobile : options.seeds?.desktop) || (isPortrait ? mobileSeeds : desktopSeeds),
      seed = options.seed || seedPool[Math.floor(Math.random() * seedPool.length)],
      animationEnabled = !reducedMotion,
      speedMultiplier = 1,
      blurEnabled = !0,
      lookControl = document.createElement("div");
    lookControl.className = cssClasses.looks, lookControl.setAttribute("role", "group"), lookControl.setAttribute("aria-label", "Time of day");
    let lookButtons = {};
    for (let [e, t, a] of [["day", "Noon", "#7ea9de"], ["night", "Night", "#1a2237"], ["morning", "Morning", "#dcc4b3"]]) {
      let o = document.createElement("button");
      o.type = "button", o.className = cssClasses.look, o.style.setProperty("--sw", a), o.title = t, o.setAttribute("aria-label", t), o.textContent = t, lookControl.appendChild(o), lookButtons[e] = o;
    }
    !1 !== options.looks && hostElement.appendChild(lookControl);
    let currentLook = "day";
    function setLook(e) {
      for (let t in lookButtons[e] || (e = "day"), currentLook = e, lookTarget.d = 0, lookTarget.n = +("night" === e), lookTarget.t = +("morning" === e), lookButtons) lookButtons[t].classList.toggle(cssClasses.on, t === e);
      options.onLook && options.onLook(e);
    }
    for (let e in lookButtons) lookButtons[e].addEventListener("click", () => setLook(e));
    let cameraSwayX = 0,
      cameraSwayY = 0,
      targetCameraSwayX = 0,
      targetCameraSwayY = 0,
      pointerX = -1,
      pointerY = -1;
    listen(window, "pointermove", t => {
      let a = hostElement.getBoundingClientRect();
      a.width && a.height && (targetCameraSwayX = (t.clientX - a.left) / a.width * 2 - 1, targetCameraSwayY = (t.clientY - a.top) / a.height * 2 - 1, pointerX = t.clientX - a.left, pointerY = t.clientY - a.top);
    });
    let projectedBird = new THREE.Vector3();
    function getBirdXY() {
      return projectedBird.copy(birdGroup.position), projectedBird.y += 0.045, projectedBird.project(camera), [(projectedBird.x + 1) / 2 * viewportState.w, (1 - projectedBird.y) / 2 * viewportState.h];
    }
    function isPointerOverBird(e, t) {
      if (!birdGroup.visible || e < 0) return !1;
      let [a, o] = getBirdXY(),
        r = Math.max(0.5, birdGroup.position.distanceTo(camera.position)),
        n = Math.max(32, 0.06 * (viewportState.h / (2 * Math.tan(camera.fov / 2 * Math.PI / 180) * r) * (viewportState.portrait ? viewportState.zoom : 1)) + 6);
      return projectedBird.z < 1 && Math.hypot(a - e, o - t) < n;
    }
    let viewport = {
      w: 0,
      h: 0,
      dpr: 0
    };
    function resize(t, o) {
      let r = t || hostElement.clientWidth,
        n = o || hostElement.clientHeight;
      if (!r || !n) return;
      let i = t ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      if (r === viewport.w && n === viewport.h && i === viewport.dpr) return;
      viewport.w = r, viewport.h = n, viewport.dpr = i, renderer.setPixelRatio(i), renderer.setSize(r, n, !1), camera.aspect = r / n, camera.fov = 21;
      let l = viewportState.portrait;
      viewportState.w = r, viewportState.h = n, updateCameraFraming(), l !== viewportState.portrait && void 0 !== selectedPerch && selectedPerch && !t && rebuildTrees(seed);
      let h = Math.round(r * i * 1),
        u = Math.round(n * i * 1);
      u > 1150 && (h = Math.round(1150 * h / u), u = 1150);
      var c = h,
        d = u;
      for (let e of [sceneRenderTarget, skyRenderTarget, foregroundBlurTarget, backgroundBlurTarget, cloudRenderTarget]) e && e.dispose();
      let f = {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: !0
      };
      sceneRenderTarget = new THREE.WebGLRenderTarget(c, d, f), skyRenderTarget = new THREE.WebGLRenderTarget(c, d, f);
      let m = Math.max(2, c >> 1),
        p = Math.max(2, d >> 1),
        v = {
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: !1
        };
      foregroundBlurTarget = new THREE.WebGLRenderTarget(m, p, v), backgroundBlurTarget = new THREE.WebGLRenderTarget(m, p, v), cloudRenderTarget = new THREE.WebGLRenderTarget(m, p, v), dofMaterial.uniforms.uTexel.value.set(1 / h, 1 / u), dofMaterial.uniforms.uMaxCoC.value = 0.018 * u, dofMaterial.uniforms.uBgCap.value = 0.0095 * u, cocScale = 0.14 * u, dofMaterial.uniforms.uCocScale.value = cocScale, postprocessReady && renderPostprocess(null);
    }
    function updateCameraFraming() {
      let e = viewportState.w,
        t = viewportState.h;
      viewportState.portrait = e / t < 1;
      let a = viewportState.portrait ? viewportState.zoom : 1,
        o = e / t,
        r = Math.min(1, Math.max(0, (16 / 9 - o) / (16 / 9 - 1))),
        n = viewportState.portrait ? 0 : 0.35 * r;
      if (void 0 !== cloudMesh && cloudMesh) {
        let e = Math.min(1, Math.max(0, (1 - o) / 0.5)),
          t = (e, t, a) => e + (t - e) * a;
        cloudMesh.material.uniforms.uDeckFine.value = t(1 + 0.8 * r, 2, e), cloudMesh.material.uniforms.uShelterReach.value = t(0.2 + 0.06 * r, 0.18, e), cloudMesh.material.uniforms.uCoverBoost.value = t(-0.18 * r, 0.06, e), cloudMesh.material.uniforms.uWarmK.value = t(1, 1.08, e);
      }
      if (e / t < 16 / 9) {
        let o = t * a,
          r = 16 * o / 9,
          i = Math.max(0, Math.min(r - e, r * (viewportState.portrait ? viewportState.cx : 0.5) - e / 2)),
          l = viewportState.portrait ? o - t : -n * t;
        camera.setViewOffset(r, o, i, l, e, t), viewportState.min = i / r * 2 - 1, viewportState.max = (i + e) / r * 2 - 1, viewportState.cy = viewportState.portrait ? -1 + 1 / a : 2 * n;
      } else camera.clearViewOffset(), viewportState.min = -1, viewportState.max = 1, viewportState.cy = 0;
      viewportState.portrait ? setCameraPosition(88.4 * ((viewportState.min + viewportState.max) / 2 + 0.06), (0.66 / a + viewportState.cy) * 49.6 + 49, -268) : setCameraPosition(moonPositionArray[0], moonPositionArray[1] + 49.6 * viewportState.cy, moonPositionArray[2]), camera.updateProjectionMatrix();
    }
    listen(window, "resize", () => resize());
    let resizeObserver = null;
    "u" > typeof ResizeObserver && (resizeObserver = new ResizeObserver(() => resize())).observe(hostElement);
    let clock = new THREE.Clock(),
      baseCameraQuaternion = new THREE.Quaternion();
    camera.lookAt(cameraTarget), baseCameraQuaternion.copy(camera.quaternion);
    let cameraEuler = new THREE.Euler();
    resize(), rebuildTrees(seed), setLook(options.look || "day"), Object.assign(lookTransition, lookTarget), lookTransition.d = lookTarget.d, lookTransition.n = lookTarget.n, lookTransition.t = lookTarget.t, applyLookUniforms(lookTransition.d, lookTransition.n, lookTransition.t), cloudStrengthUniform.value = 1;
    let frameCounter = 0,
      lastFrameTime = 0;
    function setShelters(e, t, a) {
      cloudMesh.material.uniforms.uShelterA.value.set(e[0], e[1], e[2], e[3]), cloudMesh.material.uniforms.uShelterB.value.set(t[0], t[1], t[2], t[3]);
      let o = a || [0, 0, 0, 0];
      cloudMesh.material.uniforms.uShelterC.value.set(o[0], o[1], o[2], o[3]);
    }
    return renderer.setAnimationLoop(e => {
      if (!inViewport || e - lastFrameTime < ("cross" === birdState || "out" === birdState || "in" === birdState ? 4 : 30)) return;
      lastFrameTime = e;
      let t = clock.getDelta();
      t > 2.5 && timeUniform.value > 6 && !reducedMotion && (pauseAnimation(), resumeAnimation());
      let a = Math.min(t * speedMultiplier, 0.05);
      timeUniform.value += a;
      let o = timeUniform.value;
      if (windUniform.value = baseWindStrength * (0.62 + 0.28 * Math.sin(0.21 * o) + 0.1 * Math.sin(0.57 * o + 1.7)), lookTransition.d !== lookTarget.d || lookTransition.n !== lookTarget.n || lookTransition.t !== lookTarget.t) {
        let e = 1 - Math.exp(-a * (reducedMotion ? 60 : 2.2));
        for (let t of ["d", "n", "t"]) lookTransition[t] += (lookTarget[t] - lookTransition[t]) * e, 0.001 > Math.abs(lookTransition[t] - lookTarget[t]) && (lookTransition[t] = lookTarget[t]);
        applyLookUniforms(lookTransition.d, lookTransition.n, lookTransition.t);
      }
      if (1 !== cloudStrengthUniform.value) {
        let e = cloudStrengthUniform.value + (1 - cloudStrengthUniform.value) * (1 - Math.exp(-a * (reducedMotion ? 60 : 0.9)));
        0.002 > Math.abs(e - 1) && (e = 1), cloudStrengthUniform.value = e;
      }
      animationEnabled && (cloudTimeUniform.value += a), function (e, t) {
        var a, o;
        let r, n;
        if (!birdReady) return;
        if (reducedMotion) {
          if (!selectedPerch) return;
          "perched" !== birdState && function () {
            if (selectedPerch && birdReady) for (let e of (perchBird(timeUniform.value, 2), birdClones)) e.visible = !1;
          }(), getPerchPosition(birdGroup.position), birdGroup.position.y += 0.004, birdGroup.lookAt(getPerchLookAt(flightPosition)), birdGroup.rotateX(-0.3), birdGroup.scale.setScalar(1), perchBlend = 1, applyBirdAnimation(birdActors[0], 1, 0);
          return;
        }
        if ("away" === birdState) {
          if (arrivalDelay && t > arrivalDelay ? startBirdArrival() : t > nextFlightAt && startBirdCrossing(), "away" === birdState) return;
          e = 0;
        }
        if ("out" === birdState && flightElapsed < departureLift) {
          let a = (flightElapsed += e) / departureLift;
          computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, t, windUniform.value), getPerchPosition(birdGroup.position).add(flightOffset);
          let o = departureSide > 0 ? Math.min(1, a / 0.55) : 1;
          birdGroup.quaternion.slerpQuaternions(departureStartQuat, departureEndQuat, o * o * (3 - 2 * o)), birdGroup.position.y += 0.004 + (departureSide > 0 ? 0.006 * Math.sin(Math.PI * o) : 0) - 0.012 * Math.sin(Math.PI * a), birdGroup.rotateX(0.1 * Math.sin(Math.PI * a)), foldAmount = 1 - Math.min(1, Math.max(0, (a - 0.3) / 0.7)), perchBlend = 1, applyBirdAnimation(birdActors[0], foldAmount, 0.23), flightElapsed + e >= departureLift && departureStartQuat.copy(departureEndQuat);
          return;
        }
        if ("cross" === birdState || "out" === birdState || "in" === birdState) {
          flightElapsed += e;
          let a = "out" === birdState ? flightElapsed - departureLift : flightElapsed,
            o = Math.min(1, a / flightDuration),
            r = o;
          if ("out" === birdState && (r = (o < 0.16 ? 0.15 * o + 0.425 * o * o / 0.16 : 0.092 + (o - 0.16)) / 0.9319999999999999), "in" === birdState) {
            let e = o - 0.7;
            r = (o < 0.7 ? o : 0.7 + e - 0.333 * e * e / 0.3) / 0.9001;
          }
          let n = "in" === birdState ? smoothstep((o - 0.76) / 0.24) : 0;
          flightPathWobble = Math.min(1, a / 0.6) * ("cross" === birdState ? 1 : 0.5 * ("out" === birdState)) * (1 - n);
          let i = "cross" === birdState || "out" === birdState;
          landingBounce = i ? Math.min(1, Math.max(0, (a - ("out" === birdState ? 0.55 : 0.1)) / 0.5)) : 0, foldAmount = 0, frameDelta = e;
          let l = "in" === birdState ? smoothstep((o - 0.66) / 0.24) : 0;
          perchBlend = "in" === birdState ? smoothstep((o - 0.55) / 0.35) : "out" === birdState ? 1 - Math.min(1, a / 0.45) : 0, arrivalWingFold = l, headTurnAmount = "in" === birdState ? 0.15 + 0.85 * l : "out" === birdState ? 0.15 + 0.85 * (1 - Math.min(1, a / 0.6)) : 0.15, wingRelaxation = "in" === birdState ? 0.72 + 0.26 * l : "out" === birdState ? 1 - 0.09999999999999998 * landingBounce : 0.9;
          let s = i ? sampleFlapSchedule(a) : null,
            h = s ? s.beat * landingBounce + a * flapRate() * (1 - landingBounce) : a * flapRate() * (1 + 0.07 * Math.sin(1.1 * a + 0.3) + 0.08 * l);
          for (let e of (pathTime = "out" === birdState ? 0.23 + h : h, animateBirdAlongPath(birdGroup, birdActors[0], r, pathTime, s, a), birdGroup.scale.setScalar(1), birdClones)) e.scale.setScalar(1);
          if ("in" === birdState && (birdGroup.rotateX(-0.55 * l * 1), n > 0 && (computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, t, windUniform.value), flightPosition.fromArray(selectedPerch.p).add(flightOffset), flightPosition.y += 0.004, birdGroup.position.lerp(flightPosition, n)), tmpQuaternion.copy(birdGroup.quaternion)), "in" !== birdState && (arrivalWingFold = 0), "out" === birdState) {
            let e = Math.min(1, a / 0.45);
            savedBirdQuat.copy(birdGroup.quaternion), birdGroup.quaternion.slerpQuaternions(departureStartQuat, savedBirdQuat, e * e * (3 - 2 * e)), birdGroup.rotateX(-0.3 * e * (1 - Math.min(1, a / 0.7))), computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, t, windUniform.value), birdGroup.position.addScaledVector(flightOffset, 1 - e);
          }
          for (let e = 0; e < birdClones.length; e++) {
            let t = birdClones[e],
              o = 0.009 * (e + 1);
            if (t.visible = r > o && "cross" === birdState, t.visible) {
              let n = a - o * flightDuration;
              animateBirdAlongPath(t, birdActors[e + 1], r - o, pathTime, i ? sampleFlapSchedule(n) : null, n);
            }
          }
          let u = "in" === birdState && (o >= 1 || o > 0.9 && 0.05 > birdGroup.position.distanceTo(flightEnd)),
            c = e > 0 ? birdGroup.position.distanceTo(tmpVecA) / e : 0;
          tmpVecA.copy(birdGroup.position), (o >= 1 || u) && ("in" === birdState ? (perchBird(timeUniform.value, 2.5 + 2 * Math.random()), lastFlightAt = lastPerchAt = timeUniform.value, setLandingSpring(selectedPerch, timeUniform.value, c)) : (hideBird(), departAfterResume && (departAfterResume = !1, arrivalDelay = timeUniform.value + 1.2 + Math.random())));
          return;
        }
        let i = microMotion ? Math.min(1, (t - microMotion.t0) / microMotion.dur) : 0;
        microMotion && "hop" === microMotion.kind && (hopYaw = microMotion.a + (microMotion.b - microMotion.a) * smoothstep(i)), computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, t, windUniform.value), getPerchPosition(birdGroup.position).add(flightOffset), birdGroup.position.y += 0.004;
        {
          let e = t - lastFlightAt;
          e > 0 && e < 1 && (birdGroup.position.y -= 0.004 * Math.sin(17 * e) * Math.exp(-(7 * e)));
        }
        birdGroup.lookAt(getPerchLookAt(flightPosition).add(flightOffset)), birdGroup.rotateX(-0.3);
        let l = t - lastPerchAt;
        if (l >= 0 && l < 0.4) {
          let e = smoothstep(l / 0.4);
          savedBirdQuat.copy(birdGroup.quaternion), birdGroup.quaternion.slerpQuaternions(tmpQuaternion, savedBirdQuat, e);
        }
        let s = smoothstep(l / 0.28),
          h = smoothstep((l - 0.18) / 0.32);
        perchBlend = 1, headTurnAmount = 1 - smoothstep(l / 0.5), applyBirdAnimation(birdActors[0], h, pathTime, s), t > wingFlutterAt && (targetBodySway = (Math.random() - 0.5) * 1.2, wingFlutterAt = t + 1.4 + 2.8 * Math.random()), bodySway += (targetBodySway - bodySway) * (1 - Math.exp(-(8 * e))), birdGroup.rotateY(0.04 * bodySway), microMotion ? (a = i, o = t, r = microMotion, n = birdActors[0].bones, "tail" === r.kind ? n.tail && rotateBone(n.tail, axisX, r.a * Math.sin(a * Math.PI)) : "shuffle" === r.kind ? (birdGroup.rotateY(r.a * Math.sin(2 * a * Math.PI) * (1 - a)), birdGroup.position.y -= 0.003 * Math.sin(a * Math.PI)) : "peer" === r.kind ? headTurnOffset = r.a * smoothstep(a / 0.2) * smoothstep((1 - a) / 0.25) : "hop" === r.kind && (birdGroup.position.y += 0.022 * Math.sin(a * Math.PI), birdGroup.rotateX(-0.22 * Math.sin(a * Math.PI))), a >= 1 && ("hop" === r.kind && (lastFlightAt = o, setLandingSpring(selectedPerch, o, 1)), headTurnOffset = 0, microMotion = null)) : t > nextMicroMotionAt && t > lastFlightAt + 1.2 && t < nextDepartureAt - 0.8 && function (e) {
          let t = Math.random(),
            a = t < 0.32 ? "tail" : t < 0.55 ? "shuffle" : t < 0.82 ? "peer" : selectedPerch.along ? "hop" : "shuffle";
          if (microMotion = {
            kind: a,
            t0: e,
            dur: "tail" === a ? 0.26 : "shuffle" === a ? 0.42 : "peer" === a ? 1.6 : 0.34,
            a: 0,
            b: 0
          }, "hop" === a) {
            let e = (0.025 + 0.02 * Math.random()) * (hopYaw > 0.01 ? -1 : hopYaw < -0.01 ? 1 : 0.5 > Math.random() ? -1 : 1);
            microMotion.a = hopYaw, microMotion.b = hopYaw + e;
          } else "peer" === a ? microMotion.a = 0.6 > Math.random() ? 0.26 : -0.2 : "shuffle" === a ? microMotion.a = (Math.random() - 0.5) * 0.3 : microMotion.a = 0.3 + 0.15 * Math.random();
          nextMicroMotionAt = e + microMotion.dur + 2 + 4.5 * Math.random();
        }(t), function (e) {
          let t = birdActors[0];
          if (!t) return;
          let a = t.bones.head;
          if (!a) return;
          let o = 0,
            r = 0;
          pointerX >= 0 && !viewportState.portrait && (pointerRay.set(pointerX / viewportState.w * 2 - 1, -(pointerY / viewportState.h * 2 - 1), 0.5).unproject(camera).sub(camera.position).normalize(), pointerRay.multiplyScalar(birdGroup.position.distanceTo(camera.position)).add(camera.position), birdGroup.worldToLocal(pointerRay), a.getWorldPosition(headWorldPosition), birdGroup.worldToLocal(headWorldPosition), pointerRay.sub(headWorldPosition), o = Math.max(-0.3, Math.min(0.3, 0.6 * Math.atan2(pointerRay.x, pointerRay.z)))), o += 0.5 * bodySway, r += headTurnOffset;
          let n = 1 - Math.exp(-(3.2 * e));
          headYaw += (o - headYaw) * n, headPitch += (r - headPitch) * n, rotateBone(a, axisZ, -(0.85 * headYaw)), headPitch && rotateBone(a, axisX, headPitch);
        }(e), t > nextDepartureAt && departBird();
      }(a, o), currentFocusDistance += (targetFocusDistance - currentFocusDistance) * (1 - Math.exp(-a * (reducedMotion ? 60 : 3))), dofMaterial.uniforms.uFocus.value = 1 / currentFocusDistance;
      let r = 1 / focusDistance,
        n = Math.min(1, Math.max(0, (r - currentFocusDistance) / (r - 1 / moonDistance)));
      n = Math.min(1, Math.max(0, (n - 0.02) / 0.96)), dofMaterial.uniforms.uFgBlur.value = blurEnabled ? dofMaterial.uniforms.uMaxCoC.value * n : 0, dofMaterial.uniforms.uBgBlur.value = blurEnabled ? dofMaterial.uniforms.uBgCap.value * (1 - n) : 0, cameraSwayX += (targetCameraSwayX - cameraSwayX) * (1 - Math.exp(-(3 * a))), cameraSwayY += (targetCameraSwayY - cameraSwayY) * (1 - Math.exp(-(3 * a)));
      let i = +!reducedMotion,
        l = (0.55 * Math.sin(0.062 * o) + 0.3 * Math.sin(0.151 * o + 2.1)) * 0.0022 * i - 0.0045 * cameraSwayX * i,
        s = (0.5 * Math.sin(0.083 * o + 1.2) + 0.3 * Math.sin(0.19 * o)) * 0.0018 * i - 0.00275 * cameraSwayY * i;
      cameraEuler.set(s, l, 0, "YXZ"), camera.quaternion.copy(baseCameraQuaternion).multiply(leafRotation.setFromEuler(cameraEuler));
      {
        let e = camera.projectionMatrix,
          t = cloudMesh.material.uniforms.uShelterShift.value;
        projectedBird.set(0, 0, -1).applyQuaternion(savedBirdQuat.copy(leafRotation).invert()).applyMatrix4(e);
        let a = projectedBird.x,
          o = projectedBird.y;
        projectedBird.set(0, 0, -1).applyMatrix4(e), t.set((a - projectedBird.x) * 0.5, -(0.5 * (o - projectedBird.y)));
      }
      gradeMaterial.uniforms.uGrainT.value = reducedMotion ? 0.37 : timeUniform.value % 1, renderPostprocess(null), (3 & frameCounter) == 0 && canvas.classList.toggle(cssClasses.overBird, isPointerOverBird(pointerX, pointerY)), frameCounter >= 2 && !postprocessReady && (pendingTextureLoads <= 0 || performance.now() > textureTimeoutAt) && (postprocessReady = !0, canvas.classList.add(cssClasses.drawn)), frameCounter++;
    }), options.shelters && setShelters(...options.shelters), {
      setLook: setLook,
      setShelters: setShelters,
      dispose: function () {
        for (let [e, t, a, o] of (renderer.setAnimationLoop(null), eventListeners)) e.removeEventListener(t, a, o);
        for (let e of (resizeObserver && resizeObserver.disconnect(), intersectionObserver && intersectionObserver.disconnect(), scene.traverse(e => {
          for (let t of (e.geometry && e.geometry.dispose(), Array.isArray(e.material) ? e.material : e.material ? [e.material] : [])) {
            for (let e in t) {
              let a = t[e];
              a && a.isTexture && a.dispose();
            }
            t.dispose();
          }
        }), [sceneRenderTarget, foregroundBlurTarget, skyRenderTarget, backgroundBlurTarget, cloudRenderTarget])) e && e.dispose();
        renderer.dispose(), canvas.remove(), lookControl.remove(), hostElement.classList.remove(cssClasses.host, cssClasses.night, cssClasses.dusk, cssClasses.morning);
      },
      setSpeed: function (e) {
        speedMultiplier = null == e ? 1 : e;
      },
      setBlur: function (e) {
        blurEnabled = !!e;
      },
      cue: function () {
        "perched" === birdState ? departBird() : "away" === birdState && startBirdCrossing();
      },
      get look() {
        return currentLook;
      },
      get seed() {
        return seed;
      },
      get ready() {
        return birdReady;
      },
      get bird() {
        return birdState;
      },
      get birdXY() {
        return birdGroup.visible ? getBirdXY() : null;
      }
    };
  }], 222197);
}]);
