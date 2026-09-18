(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["object" == typeof document ? document.currentScript : void 0, 222197, runtimeModule => {
  "use strict";

  var webglModule = runtimeModule.i(408560),
    THREE = runtimeModule.i(190072),
    gltfModule = runtimeModule.i(223490);
  let treeGenerator = function () {
      function createSeededRandom(seed) {
        let state = seed >>> 0;
        return function () {
          state |= 0;
          let mixedValue = Math.imul((state = state + 0x6d2b79f5 | 0) ^ state >>> 15, 1 | state);
          return (((mixedValue = mixedValue + Math.imul(mixedValue ^ mixedValue >>> 7, 61 | mixedValue) ^ mixedValue) ^ mixedValue >>> 14) >>> 0) / 0x100000000;
        };
      }
      let addVec3 = (left, right) => [left[0] + right[0], left[1] + right[1], left[2] + right[2]],
        scaleVec3 = (vector, scalar) => [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar],
        crossVec3 = (left, right) => [left[1] * right[2] - left[2] * right[1], left[2] * right[0] - left[0] * right[2], left[0] * right[1] - left[1] * right[0]],
        dotVec3 = (left, right) => left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
      function normalizeVec3(vector) {
        let length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
        return [vector[0] / length, vector[1] / length, vector[2] / length];
      }
      let lerp = (start, end, amount) => start + (end - start) * amount,
        clamp = (value, min, max) => Math.min(max, Math.max(min, value)),
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
              vert(position, normal, color, flex, uv) {
                this.positions.push(position[0], position[1], position[2]), this.normals.push(normal[0], normal[1], normal[2]), this.colors.push(color[0], color[1], color[2]), this.flex.push(flex || 0), this.uvs.push(uv ? uv[0] : 0.5, uv ? uv[1] : 0);
                for (let component = 0; component < 3; component++) position[component] < this.min[component] && (this.min[component] = position[component]), position[component] > this.max[component] && (this.max[component] = position[component]);
                return this.positions.length / 3 - 1;
              },
              tri(indexA, indexB, indexC) {
                this.indices.push(indexA, indexB, indexC);
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
            for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
              let segmentRatio = (segmentIndex + 1) / segmentCount,
                wobbleScale = options.wobble * (0.75 + 0.45 * depth),
                jitterOffset = [(random() - 0.5) * wobbleScale, (random() - 0.5) * wobbleScale, (random() - 0.5) * wobbleScale];
              jitterOffset = addVec3(jitterOffset, [0, depth >= 2 ? options.twigLift : 0 === depth ? lerp(-0.04, options.tipLift, segmentRatio) : 0.01, 0]), branchDirection = normalizeVec3(addVec3(addVec3(branchDirection, jitterOffset), scaleVec3(sideAxis, bendAmplitude))), currentCenter = addVec3(currentCenter, scaleVec3(branchDirection, segmentLength)), segmentCenters.push(currentCenter.slice()), segmentDirections.push(branchDirection.slice());
            }
            segmentDirections.push(segmentDirections[segmentDirections.length - 1].slice()), segmentDirections.unshift(segmentDirections[0].slice());
            let frameNormal = crossVec3(segmentDirections[0], 0.9 > Math.abs(segmentDirections[0][1]) ? worldUp : [1, 0, 0]);
            frameNormal = normalizeVec3(frameNormal);
            let frameSamples = [];
            for (let segmentIndex = 0; segmentIndex <= segmentCount; segmentIndex++) {
              let segmentDirection = segmentDirections[segmentIndex];
              frameNormal = normalizeVec3(addVec3(frameNormal, scaleVec3(segmentDirection, -dotVec3(segmentDirection, frameNormal))));
              let projectedSide = normalizeVec3(crossVec3(segmentDirection, frameNormal));
              frameSamples.push({
                t: segmentDirection,
                n: frameNormal.slice(),
                b: projectedSide
              });
            }
            let isOuterBranch = depth >= options.maxDepth - 1,
              tipRadius = isOuterBranch ? Math.max(0.18 * radius, 0.0014) : 0.38 * radius,
              radiusBySegment = [];
            for (let segmentIndex = 0; segmentIndex <= segmentCount; segmentIndex++) radiusBySegment.push(lerp(radius, tipRadius, Math.pow(segmentIndex / segmentCount, 0.72)));
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
            for (let segmentIndex = 0; segmentIndex <= segmentCount; segmentIndex++) {
              ringStartIndices.push(buffers.positions.length / 3);
              let frameSample = frameSamples[segmentIndex],
                segmentRatio = segmentIndex / segmentCount,
                flexValue = flexStart + segmentRatio * length,
                normalizedFlex = flexValue / 0.3,
                ringScale = 1 + ringRipple * Math.sin(1.9 * segmentIndex + ringPhase) + 0.13 * Math.pow(Math.max(0, Math.sin(0.83 * segmentIndex + 1.7 * ringPhase)), 10),
                isPinch = segmentIndex === pinchSegment;
              isPinch && (ringScale *= 0.8);
              let ringCircumference = 2 * Math.PI * radiusBySegment[segmentIndex] * ringScale,
                firstRadius = 0,
                firstWobble = 0;
              for (let radialIndex = 0; radialIndex <= radialSegments; radialIndex++) {
                let isSeam = radialIndex === radialSegments,
                  angle = radialIndex / radialSegments * Math.PI * 2,
                  radialDir = addVec3(scaleVec3(frameSample.n, Math.cos(angle)), scaleVec3(frameSample.b, Math.sin(angle))),
                  lobePattern = Math.pow(0.5 + 0.5 * Math.cos(angle * ringLobes + ringAsymmetry * flexValue * 6 + ringRotation + ringFrequency * Math.sin(9 * flexValue + ringPhase)), 2.2),
                  vertexRadius = radiusBySegment[segmentIndex] * ringScale * (1 + radialNoise * Math.cos(2 * angle + ringNoisePhase)) * (1 + radialWarp * (0.55 - lobePattern)) * (1 + (random() - 0.5) * 0.1),
                  wobble = (random() - 0.5) * 0.05;
                0 === radialIndex && (firstRadius = vertexRadius, firstWobble = wobble), isSeam && (vertexRadius = firstRadius, wobble = firstWobble);
                let vertexPos = addVec3(segmentCenters[segmentIndex], scaleVec3(radialDir, vertexRadius)),
                  radialWarpFactor = (vertexRadius / (radiusBySegment[segmentIndex] * ringScale) - 1) * 1.9,
                  depthFade = depth > 0 ? 1 - 0.3 * Math.exp(-(0.8 * segmentIndex)) : 1,
                  brightness = wobble + 0.12 * radialWarpFactor + (isPinch ? -0.09 : 0),
                  vertexColor = [(branchColor[0] + brightness) * depthFade, (branchColor[1] + brightness) * depthFade, (branchColor[2] + 0.8 * brightness) * depthFade];
                if (isOuterBranch) {
                  let outerFade = 0.4 * segmentRatio;
                  vertexColor = [lerp(vertexColor[0], 0.42, outerFade), lerp(vertexColor[1], 0.48, outerFade), lerp(vertexColor[2], 0.29, outerFade)];
                }
                buffers.vert(vertexPos, radialDir, vertexColor, flexValue, [radialIndex / radialSegments * (ringCircumference / 0.3), normalizedFlex]);
              }
            }
            for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) for (let radialIndex = 0; radialIndex < radialSegments; radialIndex++) {
              let quadA = ringStartIndices[segmentIndex] + radialIndex,
                quadB = ringStartIndices[segmentIndex] + radialIndex + 1,
                quadC = ringStartIndices[segmentIndex + 1] + radialIndex,
                quadD = ringStartIndices[segmentIndex + 1] + radialIndex + 1;
              buffers.tri(quadA, quadC, quadB), buffers.tri(quadB, quadC, quadD);
            }
            {
              let tipFrame = frameSamples[segmentCount],
                tipCenter = addVec3(segmentCenters[segmentCount], scaleVec3(tipFrame.t, 0.7 * radiusBySegment[segmentCount])),
                tipVertexIndex = buffers.vert(tipCenter, tipFrame.t, branchColor, flexStart + length);
              for (let radialIndex = 0; radialIndex < radialSegments; radialIndex++) buffers.tri(ringStartIndices[segmentCount] + radialIndex, tipVertexIndex, ringStartIndices[segmentCount] + radialIndex + 1);
            }
            if (0 === depth) {
              let rootFrame = frameSamples[0],
                rootNormal = scaleVec3(rootFrame.t, -1),
                rootVertexIndex = buffers.vert(segmentCenters[0], rootNormal, [0.62, 0.52, 0.38], 0),
                rootIndexOffset = buffers.positions.length / 3;
              for (let radialIndex = 0; radialIndex < radialSegments; radialIndex++) {
                let angle = radialIndex / radialSegments * Math.PI * 2,
                  radialDir = addVec3(scaleVec3(rootFrame.n, Math.cos(angle)), scaleVec3(rootFrame.b, Math.sin(angle)));
                buffers.vert(addVec3(segmentCenters[0], scaleVec3(radialDir, radiusBySegment[0])), rootNormal, [0.58, 0.48, 0.35], 0);
              }
              for (let radialIndex = 0; radialIndex < radialSegments; radialIndex++) {
                let nextRadial = (radialIndex + 1) % radialSegments;
                buffers.tri(rootIndexOffset + radialIndex, rootIndexOffset + nextRadial, rootVertexIndex);
              }
            }
            let radiusAt = progressT => lerp(radius, tipRadius, Math.pow(progressT, 0.72)),
              frameAt = progressT => frameSamples[clamp(Math.round(progressT * segmentCount), 0, segmentCount)],
              centerAt = progressT => {
                let scaledIndex = progressT * segmentCount,
                  lowerIndex = clamp(Math.floor(scaledIndex), 0, segmentCount - 1),
                  frac = scaledIndex - lowerIndex;
                return addVec3(scaleVec3(segmentCenters[lowerIndex], 1 - frac), scaleVec3(segmentCenters[lowerIndex + 1], frac));
              };
            anchors.perches || (anchors.perches = []);
            {
              let perchCount = Math.max(1, Math.round(length / 0.06));
              for (let perchIndex = 0; perchIndex < perchCount; perchIndex++) {
                let perchT = 0.15 + 0.7 * (1 === perchCount ? 0.5 : perchIndex / (perchCount - 1)),
                  perchFrame = frameAt(perchT);
                anchors.perches.push({
                  c: centerAt(perchT),
                  r: radiusAt(perchT),
                  along: perchFrame.t,
                  d: depth,
                  t: perchT,
                  flex: flexStart + perchT * length
                });
              }
            }
            if (!isTwig && depth <= 1) {
              let branchCount = +(0.32 > random());
              for (let branchIndex = 0; branchIndex < branchCount; branchIndex++) {
                let branchT = 0.15 + 0.7 * random(),
                  branchAngle = random() * Math.PI * 2,
                  branchFrame = frameAt(branchT),
                  branchRadialDir = addVec3(scaleVec3(branchFrame.n, Math.cos(branchAngle)), scaleVec3(branchFrame.b, Math.sin(branchAngle))),
                  branchTiltAngle = 0.9 + 0.5 * random(),
                  branchDir = normalizeVec3(addVec3(addVec3(scaleVec3(branchFrame.t, Math.cos(branchTiltAngle)), scaleVec3(branchRadialDir, Math.sin(branchTiltAngle))), [0, -0.15 * random(), 0]));
                appendBranch(random, buffers, anchors, centerAt(branchT), branchDir, 0.035 + 0.05 * random(), Math.max(0.42 * radiusAt(branchT), 0.0015), options.maxDepth, flexStart + branchT * length, options, !0);
              }
            }
            if (!isTwig && depth < options.maxDepth) {
              let childCount = Math.max(0, Math.round(options.childrenByDepth[Math.min(depth, options.childrenByDepth.length - 1)] + (random() - 0.5) * 1.5)),
                childAngleAccum = random() * Math.PI * 2;
              for (let childIndex = 0; childIndex < childCount; childIndex++) {
                let childT = clamp(0.14 + 0.78 * ((childIndex + 0.8 * random()) / Math.max(1, childCount)), 0.12, 0.92);
                childAngleAccum += 2.39996323 + (random() - 0.5) * 0.9;
                let childFrame = frameAt(childT),
                  childRadialDir = addVec3(scaleVec3(childFrame.n, Math.cos(childAngleAccum)), scaleVec3(childFrame.b, Math.sin(childAngleAccum))),
                  childTilt = lerp(options.childAngle[0], options.childAngle[1], random()),
                  childDir = normalizeVec3(addVec3(scaleVec3(childFrame.t, Math.cos(childTilt)), scaleVec3(childRadialDir, Math.sin(childTilt)))),
                  childLength = length * lerp(0.4, 0.62, random()) * (1.25 - 0.55 * childT),
                  childRadius = Math.max(Math.min(0.72 * radiusAt(childT), radiusAt(childT) * (0.5 + 0.25 * random())), 0.0022),
                  childOrigin = addVec3(centerAt(childT), scaleVec3(childRadialDir, 0.6 * radiusAt(childT)));
                childLength > 2.2 * options.segLen && appendBranch(random, buffers, anchors, childOrigin, childDir, childLength, childRadius, depth + 1, flexStart + childT * length, options);
              }
              if (depth <= options.maxDepth - 2) {
                let twigCount = 1 + Math.round(1.5 * random());
                for (let twigIndex = 0; twigIndex < twigCount; twigIndex++) {
                  let twigT = clamp(0.1 + 0.85 * random(), 0.1, 0.95);
                  childAngleAccum += 4.079937491 + (random() - 0.5);
                  let twigFrame = frameAt(twigT),
                    twigRadialDir = addVec3(scaleVec3(twigFrame.n, Math.cos(childAngleAccum)), scaleVec3(twigFrame.b, Math.sin(childAngleAccum))),
                    twigTiltAngle = lerp(0.7, 1.15, random()),
                    twigDir = normalizeVec3(addVec3(scaleVec3(twigFrame.t, Math.cos(twigTiltAngle)), scaleVec3(twigRadialDir, Math.sin(twigTiltAngle)))),
                    twigLength = length * lerp(0.1, 0.2, random());
                  twigLength > 1.6 * options.segLen && appendBranch(random, buffers, anchors, addVec3(centerAt(twigT), scaleVec3(twigRadialDir, 0.6 * radiusAt(twigT))), twigDir, twigLength, Math.max(0.3 * radiusAt(twigT), 0.0016), options.maxDepth - 1, flexStart + twigT * length, options);
                }
              }
            }
            if (!isTwig && depth >= 1) {
              let leafRandom = createSeededRandom(Math.floor(0xffffffff * random())),
                isOuterLeafZone = depth >= (null != options.leafOuterDepth ? options.leafOuterDepth : options.maxDepth - 1),
                leafDensity = isOuterLeafZone ? options.leafDensity : 0.26 * options.leafDensity,
                leafStartT = isOuterLeafZone ? 0.12 : 0.5,
                leafCount = Math.round(length / 0.05 * leafDensity),
                leafAngleAccum = leafRandom() * Math.PI * 2;
              for (let leafIndex = 0; leafIndex < leafCount; leafIndex++) {
                let leafT = clamp(leafStartT + (1 - leafStartT) * Math.pow(leafIndex / Math.max(1, leafCount - 1), 0.78), 0, 1);
                leafAngleAccum += 2.39996323 + (leafRandom() - 0.5) * 0.5;
                let leavesPerPoint = 0.35 > leafRandom() ? 3 : 0.75 > leafRandom() ? 2 : 1;
                for (let leafSubIndex = 0; leafSubIndex < leavesPerPoint; leafSubIndex++) {
                  let leafOffsetT = clamp(leafT + (leafSubIndex - (leavesPerPoint - 1) / 2) * 0.055, 0.05, 1),
                    leafFrame = frameAt(leafOffsetT),
                    leafAngle = leafAngleAccum + leafSubIndex * (2.4 + 0.6 * leafRandom()),
                    leafRadialDir = addVec3(scaleVec3(leafFrame.n, Math.cos(leafAngle)), scaleVec3(leafFrame.b, Math.sin(leafAngle)));
                  anchors.push({
                    p: addVec3(addVec3(centerAt(leafOffsetT), scaleVec3(leafRadialDir, 0.8 * radiusAt(leafOffsetT))), scaleVec3(leafFrame.t, (leafRandom() - 0.5) * 0.02)),
                    out: leafRadialDir,
                    along: leafFrame.t,
                    c: centerAt(leafOffsetT),
                    r: radiusAt(leafOffsetT),
                    d: depth,
                    t: leafOffsetT,
                    size: lerp(0.75, 1.15, leafRandom()) * (1.05 - 0.25 * leafOffsetT),
                    flex: flexStart + leafOffsetT * length,
                    roll: (leafRandom() - 0.5) * 2,
                    droop: leafRandom()
                  });
                }
              }
              let tipFrame = frameSamples[segmentCount];
              anchors.push({
                p: addVec3(segmentCenters[segmentCount], scaleVec3(tipFrame.t, radiusBySegment[segmentCount])),
                out: tipFrame.n,
                along: tipFrame.t,
                c: segmentCenters[segmentCount],
                r: radiusBySegment[segmentCount],
                d: depth,
                t: 1,
                size: lerp(0.85, 1.1, leafRandom()),
                flex: flexStart + length,
                roll: (leafRandom() - 0.5) * 2,
                droop: leafRandom()
              });
            }
          }(random, geometryBuffers, leafAnchors, treeOptions.origin.slice(), rootDirection, treeOptions.trunkLen, treeOptions.trunkRadius, 0, 0, treeOptions);
          let maxFlex = 1e-6;
          for (let flexItem of geometryBuffers.flex) flexItem > maxFlex && (maxFlex = flexItem);
          for (let anchorItem of leafAnchors) anchorItem.flex > maxFlex && (maxFlex = anchorItem.flex);
          let normalizedFlex = new Float32Array(geometryBuffers.flex.length);
          for (let flexIndex = 0; flexIndex < geometryBuffers.flex.length; flexIndex++) normalizedFlex[flexIndex] = Math.pow(geometryBuffers.flex[flexIndex] / maxFlex, 1.4);
          for (let anchorItem of leafAnchors) anchorItem.flex = Math.pow(anchorItem.flex / maxFlex, 1.4);
          for (let perchItem of leafAnchors.perches || []) perchItem.flex = Math.min(1, Math.pow(perchItem.flex / maxFlex, 1.4));
          let vertexCount = geometryBuffers.positions.length / 3,
            indexArrayType = vertexCount > 65535 ? Uint32Array : Uint16Array,
            boundsCenter = [(geometryBuffers.min[0] + geometryBuffers.max[0]) / 2, (geometryBuffers.min[1] + geometryBuffers.max[1]) / 2, (geometryBuffers.min[2] + geometryBuffers.max[2]) / 2],
            boundsRadius = 0.5 * Math.hypot(geometryBuffers.max[0] - geometryBuffers.min[0], geometryBuffers.max[1] - geometryBuffers.min[1], geometryBuffers.max[2] - geometryBuffers.min[2]);
          return {
            positions: new Float32Array(geometryBuffers.positions),
            normals: new Float32Array(geometryBuffers.normals),
            colors: new Float32Array(geometryBuffers.colors),
            flex: normalizedFlex,
            uvs: new Float32Array(geometryBuffers.uvs),
            indices: new indexArrayType(geometryBuffers.indices),
            anchors: leafAnchors,
            perches: leafAnchors.perches || [],
            bounds: {
              center: boundsCenter,
              radius: boundsRadius
            },
            stats: {
              vertices: vertexCount,
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
      assetUrl = url => (options.assets || "") + url,
      eventListeners = [],
      listen = (target, type, listener, options) => {
        target.addEventListener(type, listener, options), eventListeners.push([target, type, listener, options]);
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
    } catch (error) {
      return canvas.remove(), hostElement.classList.add(cssClasses.unsupported), options.onUnsupported && options.onUnsupported(error), null;
    }
    renderer.toneMapping = THREE.NoToneMapping, renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    let scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(21, 1, 0.1, 700);
    camera.position.set(0, 0, 0);
    let cameraTarget = new THREE.Vector3(0, 0.55, -3),
      toColor = hex => new THREE.Color(hex),
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
    function setLandingSpring(perch, landingTime, weightScale = 1.4) {
      let flex = perch.flex,
        weightClamp = Math.max(0.8, Math.min(1.2, weightScale / 1.4));
      landingUniform.value.set(perch.p[0], perch.p[1], perch.p[2], landingTime), landingSpringUniform.value.set((0.006 + 0.01 * flex) * weightClamp, 2 * Math.PI * (5 - 1.2 * flex), 6 + 2 * (1 - flex));
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
      blendColor = (targetColor, morningColor, duskColor, nightColor, dayColor, duskWeight, nightWeight, morningWeight) => {
        let dayWeight = 1 - duskWeight - nightWeight - morningWeight;
        return targetColor.setRGB(morningColor.r * dayWeight + duskColor.r * duskWeight + nightColor.r * nightWeight + dayColor.r * morningWeight, morningColor.g * dayWeight + duskColor.g * duskWeight + nightColor.g * nightWeight + dayColor.g * morningWeight, morningColor.b * dayWeight + duskColor.b * duskWeight + nightColor.b * nightWeight + dayColor.b * morningWeight);
      },
      blendScalar = (morningValue, duskValue, nightValue, dayValue, duskWeight, nightWeight, morningWeight) => morningValue * (1 - duskWeight - nightWeight - morningWeight) + duskValue * duskWeight + nightValue * nightWeight + dayValue * morningWeight;
    function applyLookUniforms(duskAmount, nightAmount, morningAmount) {
      duskUniform.value = duskAmount + morningAmount * dayLook.duskK, nightUniform.value = nightAmount + morningAmount * dayLook.nightK, morningUniform.value = morningAmount, blendColor(zenithColor, morningLook.zenith, duskLook.zenith, nightLook.zenith, dayLook.zenith, duskAmount, nightAmount, morningAmount), blendColor(horizonColor, morningLook.horizon, duskLook.horizon, nightLook.horizon, dayLook.horizon, duskAmount, nightAmount, morningAmount), blendColor(sunGlowColor, morningLook.glow, duskLook.glow, nightLook.glow, dayLook.glow, duskAmount, nightAmount, morningAmount), sunDirection.set(0, 0, 0).addScaledVector(morningLook.sunDir, 1 - duskAmount - nightAmount - morningAmount).addScaledVector(duskLook.sunDir, duskAmount).addScaledVector(nightLook.sunDir, nightAmount).addScaledVector(dayLook.sunDir, morningAmount).normalize(), sunLight.position.copy(sunDirection).multiplyScalar(10), blendColor(sunLight.color, morningLook.sunCol, duskLook.sunCol, nightLook.sunCol, dayLook.sunCol, duskAmount, nightAmount, morningAmount), sunLight.intensity = blendScalar(morningLook.sunInt, duskLook.sunInt, nightLook.sunInt, dayLook.sunInt, duskAmount, nightAmount, morningAmount), blendColor(hemisphereLight.color, morningLook.hemiSky, duskLook.hemiSky, nightLook.hemiSky, dayLook.hemiSky, duskAmount, nightAmount, morningAmount), blendColor(hemisphereLight.groundColor, morningLook.hemiGround, duskLook.hemiGround, nightLook.hemiGround, dayLook.hemiGround, duskAmount, nightAmount, morningAmount), hemisphereLight.intensity = blendScalar(morningLook.hemiInt, duskLook.hemiInt, nightLook.hemiInt, dayLook.hemiInt, duskAmount, nightAmount, morningAmount), blendColor(leafMaterial.uniforms.uSunCol.value, morningLook.leafSun, duskLook.leafSun, nightLook.leafSun, dayLook.leafSun, duskAmount, nightAmount, morningAmount), blendColor(leafMaterial.uniforms.uSkyCol.value, morningLook.leafSky, duskLook.leafSky, nightLook.leafSky, dayLook.leafSky, duskAmount, nightAmount, morningAmount), blendColor(leafMaterial.uniforms.uGroundCol.value, morningLook.leafGround, duskLook.leafGround, nightLook.leafGround, dayLook.leafGround, duskAmount, nightAmount, morningAmount), hostElement.classList.toggle(cssClasses.night, nightAmount > 0.5), hostElement.classList.toggle(cssClasses.dusk, duskAmount > 0.5), hostElement.classList.toggle(cssClasses.morning, morningAmount > 0.5), applyLeafLook(duskAmount, nightAmount, morningAmount);
    }
    function applyLeafLook(duskAmount, nightAmount, morningAmount) {
      for (let material of birdMaterials) material.emissiveIntensity = 0.12 * (1 - 0.88 * nightAmount) + 0.05 * duskAmount + 0.02 * morningAmount, material.color.setRGB(1 - 0.4 * nightAmount + 0.06 * duskAmount + 0.03 * morningAmount, 1 - 0.34 * nightAmount - 0.06 * duskAmount, 1 - 0.16 * nightAmount - 0.2 * duskAmount - 0.05 * morningAmount);
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
    function generateSceneTree(preset, presetIndex, seed, scale, leafDensityMultiplier) {
      let treeConfig = Object.assign({}, treeDefaults, preset);
      viewportState.portrait && preset.portraitDrop && (treeConfig.origin = [preset.origin[0], preset.origin[1] - preset.portraitDrop, preset.origin[2]]), treeConfig.leafDensity = treeConfig.leafDensity * leafDensityMultiplier;
      let scaleExponent = Math.pow(scale, 0.55);
      return treeConfig.childrenByDepth = treeConfig.childrenByDepth.map((childDepth, depthIndex) => Math.max(+(0 === depthIndex), childDepth * scaleExponent)), treeConfig.maxDepth = 4, treeConfig.leafOuterDepth = 2, treeConfig.childrenByDepth = treeConfig.childrenByDepth.concat([(scale - 1) * 1.5 - 0.3]), treeGenerator.generate(seed + 101 * presetIndex, treeConfig);
    }
    function hasUsablePerch(treeParts) {
      let cameraSlope = Math.tan(10.5 * Math.PI / 180);
      for (let part of treeParts) for (let perch of part.perches || []) {
        if (perch.r < 0.0045 || perch.t > 0.85 || Math.abs(perch.along[1]) > 0.7) continue;
        let depth = -perch.c[2];
        if (depth < 1.85 || depth > 4.2) continue;
        let screenX = perch.c[0] / (1.78 * cameraSlope * depth),
          screenY = (perch.c[1] - 0.183 * depth) / (cameraSlope * depth),
          minScreenY = viewportState.portrait ? -0.95 : -0.58,
          maxScreenY = viewportState.portrait ? -0.35 : 0.45;
        if (screenX > -0.3 && screenX < 0.9 && screenY > minScreenY && screenY < maxScreenY) return !0;
      }
      return !1;
    }
    function selectBirdPerch(treeParts) {
      let bestPerch = null,
        bestScore = 1e9,
        selectedPass = 3,
        cameraSlope = Math.tan(10.5 * Math.PI / 180),
        normalizePerch = candidate => {
          if (!candidate.c) return {
            p: candidate.p.slice(),
            flex: candidate.flex
          };
          let tangent = candidate.along,
            tangentY = tangent[1],
            normalX = -tangent[0] * tangentY,
            normalY = 1 - tangent[1] * tangentY,
            normalZ = -tangent[2] * tangentY,
            normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
          normalX /= normalLength, normalY /= normalLength, normalZ /= normalLength;
          let perchOffset = 0.92 * candidate.r - 0.0025;
          return {
            p: [candidate.c[0] + normalX * perchOffset, candidate.c[1] + normalY * perchOffset, candidate.c[2] + normalZ * perchOffset],
            flex: candidate.flex,
            along: tangent.slice(),
            r: candidate.r
          };
        },
        tryPass = passIndex => {
          let isRootPass = 0 === passIndex,
            isFallbackPass = passIndex >= 2,
            minimumRadius = isRootPass ? 0.0045 : 1 === passIndex ? 0.0035 : 2 === passIndex ? 0.0025 : 0.0015;
          for (let partIndex = 0; partIndex < treeParts.length; partIndex++) {
            let partWeight = 0.15 * (partIndex !== treeParts.length - 1);
            for (let anchor of treeParts[partIndex].perches || treeParts[partIndex].anchors) {
              if (null != anchor.r && anchor.r < minimumRadius || null != anchor.t && anchor.t > 0.85) continue;
              let tiltAmount = anchor.along ? Math.abs(anchor.along[1]) : 0;
              if (tiltAmount > (isRootPass ? 0.5 : isFallbackPass ? 0.8 : 0.7)) continue;
              let anchorPos = anchor.p || anchor.c,
                anchorDepth = -anchorPos[2],
                isThick = null != anchor.r && anchor.r >= 0.0045,
                minDepth = isThick ? 1.85 : 2.4;
              if (isRootPass && (anchorDepth < minDepth || anchorDepth > 3.8) || !isRootPass && !isFallbackPass && (anchorDepth < Math.min(minDepth, 2.2) || anchorDepth > 4.2) || isFallbackPass && (anchorDepth < 1.7 || anchorDepth > 4.6)) continue;
              let screenX = anchorPos[0] / (1.78 * cameraSlope * anchorDepth),
                screenY = ((anchorPos[1] - 0.183 * anchorDepth) / (cameraSlope * anchorDepth) - viewportState.cy) * (viewportState.portrait ? viewportState.zoom : 1),
                marginRatio = isRootPass ? 0.28 : 0.08,
                viewSpan = viewportState.max - viewportState.min;
              if (!(screenX > viewportState.min + marginRatio * viewSpan / 2 && screenX < viewportState.max - marginRatio * viewSpan / 2)) continue;
              if (viewportState.portrait) {
                if (isRootPass && (screenY < -0.82 || screenY > -0.45) || !isRootPass && !isFallbackPass && (screenY < -0.9 || screenY > -0.35) || isFallbackPass && (screenY < -0.94 || screenY > -0.3)) continue;
              } else if (isRootPass && (screenY < -0.55 || screenY > 0.62)) continue;
              if (!isRootPass && Math.abs(screenY) > 0.88) continue;
              let thinPenalty = null != anchor.r ? Math.max(0, 0.011 - anchor.r) / 0.006 : 0,
                viewCenter = (viewportState.min + viewportState.max) / 2,
                viewHalfSpan = (viewportState.max - viewportState.min) / 2,
                score = ((screenX - (viewCenter + (viewportState.portrait ? 0.1 : 0.42) * viewHalfSpan)) / viewHalfSpan) ** 2 + (screenY - (viewportState.portrait ? -0.62 : -0.05)) ** 2 + partWeight + 0.3 * thinPenalty * thinPenalty + 0.5 * tiltAmount * tiltAmount + 0.25 * (anchorDepth - (isThick ? 2.5 : 3)) ** 2;
              score < bestScore && (bestScore = score, bestPerch = normalizePerch(anchor));
            }
          }
        };
      if (tryPass(0), bestPerch && (selectedPass = 0), !bestPerch && (tryPass(1), bestPerch && (selectedPass = 1)), !bestPerch && (tryPass(2), bestPerch && (selectedPass = 2)), !bestPerch && (tryPass(3), bestPerch && (selectedPass = 3)), !bestPerch) for (let anchor of treeParts.flatMap(part => part.perches || part.anchors)) {
        let anchorPos = anchor.p || anchor.c;
        if (1.8 > -anchorPos[2]) continue;
        let thinPenalty = null != anchor.r ? Math.max(0, 0.007 - anchor.r) / 0.004 : 0,
          tiltAmount = anchor.along ? Math.abs(anchor.along[1]) : 0,
          score = anchorPos[0] * anchorPos[0] + (anchorPos[1] - 0.3) ** 2 + (anchorPos[2] + 2.6) ** 2 + 2 * thinPenalty * thinPenalty + 3 * tiltAmount * tiltAmount + 4 * (null != anchor.t && anchor.t > 0.85);
        score < bestScore && (bestScore = score, bestPerch = normalizePerch(anchor));
      }
      if (!bestPerch) {
        let allAnchors = treeParts.flatMap(part => part.perches || part.anchors);
        bestPerch = allAnchors.length ? normalizePerch(allAnchors[0]) : {
          p: [0.4, 0.3, -2.6],
          flex: 0.5
        };
      }
      return {
        perch: bestPerch,
        pass: selectedPass,
        score: bestScore
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
    barkMaterial.onBeforeCompile = material => {
      material.uniforms.uTime = timeUniform, material.uniforms.uWind = windUniform, material.uniforms.uLag = lagUniform, material.uniforms.uLand = landingUniform, material.uniforms.uLandK = landingSpringUniform, material.vertexShader = "attribute float aFlex;\nuniform float uTime;\nuniform float uWind;\n" + barkVertexShader + material.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += windSway(position, aFlex, uTime, uWind);");
    };
    let leafAtlasTexture = ((leafAtlasCanvas = document.createElement("canvas")).width = leafAtlasCanvas.height = 256, (leafAtlasContext = leafAtlasCanvas.getContext("2d")).clearRect(0, 0, 256, 256), leafAtlasKinds = ["h", "h", "y", "d"], [[0, 0], [128, 0], [0, 128], [128, 128]].forEach(([cellX, cellY], cellIndex) => function (context, cellX, cellY, leafKind) {
        let leafCenterX = cellX + 64 + (Math.random() - 0.5) * 8,
          leafBaseY = cellY + 16,
          leafTopY = cellY + 128 - 26,
          leafHeight = leafTopY - leafBaseY,
          leafScale = 0.42 + 0.08 * Math.random(),
          leafWidthAt = progressT => 128 * leafScale * Math.pow(Math.sin(Math.PI * Math.pow(Math.max(progressT, 0.01), 0.45) * 0.9), 1.1) * (1 - 0.85 * Math.pow(progressT, 2.5)),
          pointCount = 8 + Math.floor(4 * Math.random()),
          phaseJitter = 0.11 + 0.05 * Math.random(),
          skew = (Math.random() - 0.5) * 0.16,
          randomProfile = () => Array.from({
            length: 24
          }, () => 0.55 + 0.9 * Math.random()),
          profileA = randomProfile(),
          profileB = randomProfile(),
          phaseA = Math.random(),
          phaseB = Math.random(),
          sampleProfile = (profileIndex, phaseIndex, profile) => {
            let pointIndex = profileIndex * pointCount + phaseIndex,
              wrappedIndex = (Math.floor(pointIndex) % 24 + 24) % 24,
              edgeFade = Math.min(1, 5 * profileIndex) * Math.min(1, (1 - profileIndex) * 6 + 0.1);
            return 1 + phaseJitter * Math.pow(1 - Math.abs(2 * (pointIndex - Math.floor(pointIndex)) - 1), 0.65) * profile[wrappedIndex] * edgeFade;
          },
          points = [];
        for (let pointIndex = 0; pointIndex <= 96; pointIndex++) {
          let progressT = pointIndex / 96,
            skewOffset = skew * Math.sin(Math.PI * progressT) * 23.04;
          points.push([leafCenterX + skewOffset + leafWidthAt(1 - progressT) * sampleProfile(progressT, phaseA, profileA), leafBaseY + progressT * leafHeight]);
        }
        for (let pointIndex = 96; pointIndex >= 0; pointIndex--) {
          let progressT = pointIndex / 96,
            skewOffset = skew * Math.sin(Math.PI * progressT) * 23.04;
          points.push([leafCenterX + skewOffset - leafWidthAt(1 - progressT) * sampleProfile(progressT, phaseB, profileB), leafBaseY + progressT * leafHeight]);
        }
        for (let [pointX, pointY] of (context.beginPath(), context.moveTo(points[0][0], points[0][1]), points)) context.lineTo(pointX, pointY);
        context.closePath();
        let leafGradient = context.createLinearGradient(0, leafTopY, 0, leafBaseY),
          colorBrightness = 0.92 + 0.16 * Math.random(),
          toHex = channelValue => Math.round(channelValue * colorBrightness).toString(16).padStart(2, "0");
        "y" === leafKind ? (leafGradient.addColorStop(0, "#a89a4e"), leafGradient.addColorStop(0.55, "#8f8145"), leafGradient.addColorStop(1, "#7a6f3c")) : (leafGradient.addColorStop(0, "#" + toHex(139) + toHex(143) + toHex(92)), leafGradient.addColorStop(0.55, "#" + toHex(112) + toHex(120) + toHex(74)), leafGradient.addColorStop(1, "#" + toHex(91) + toHex(101) + toHex(64))), context.fillStyle = leafGradient, context.fill(), context.save(), context.clip();
        for (let speckCount = 0; speckCount < 40; speckCount++) {
          let speckX = cellX + 128 * Math.random(),
            speckY = leafBaseY + Math.random() * leafHeight,
            speckRadius = 5 + 18 * Math.random();
          context.fillStyle = 0.5 > Math.random() ? "rgba(70,102,44,0.10)" : "rgba(178,204,110,0.10)", context.beginPath(), context.arc(speckX, speckY, speckRadius, 0, 7), context.fill();
        }
        let strokeVein = (x1, y1, x2, y2, width) => {
          context.strokeStyle = "rgba(58,84,36,0.55)", context.lineWidth = width + 0.8, context.beginPath(), context.moveTo(x1, y1), context.quadraticCurveTo((x1 + x2) / 2 + (x2 - x1) * 0.12, (y1 + y2) / 2, x2, y2), context.stroke(), context.strokeStyle = "rgba(196,216,140,0.8)", context.lineWidth = width, context.beginPath(), context.moveTo(x1, y1), context.quadraticCurveTo((x1 + x2) / 2 + (x2 - x1) * 0.12, (y1 + y2) / 2, x2, y2), context.stroke();
        };
        strokeVein(leafCenterX, leafTopY + 8, leafCenterX, leafBaseY + 4, 1.6);
        for (let veinIndex = 0; veinIndex < 6; veinIndex++) {
          let veinT = 0.12 + 0.15 * veinIndex,
            veinY = leafTopY - veinT * leafHeight,
            veinWidth = 0.94 * leafWidthAt(veinT);
          strokeVein(leafCenterX, veinY, leafCenterX + veinWidth, veinY - 0.13 * leafHeight, 1), strokeVein(leafCenterX, veinY, leafCenterX - veinWidth, veinY - 0.13 * leafHeight, 1);
        }
        if (context.restore(), "d" === leafKind) for (let notchIndex = 0; notchIndex < 3; notchIndex++) {
          let notchT = 0.22 + 0.6 * Math.random(),
            isCenterNotch = 2 === notchIndex,
            sideSign = 0.5 > Math.random() ? 1 : -1,
            notchX = isCenterNotch ? leafCenterX + (Math.random() - 0.5) * leafWidthAt(0.5) : leafCenterX + sideSign * leafWidthAt(1 - notchT) * 0.85,
            notchY = leafBaseY + notchT * leafHeight,
            notchRadius = isCenterNotch ? 3 + 4 * Math.random() : 6 + 9 * Math.random();
          context.fillStyle = "rgba(122,84,44,0.6)", context.beginPath(), context.arc(notchX, notchY, notchRadius + 2.5, 0, 7), context.fill(), context.globalCompositeOperation = "destination-out", context.beginPath(), context.arc(notchX, notchY, notchRadius, 0, 7), context.fill(), context.globalCompositeOperation = "source-over";
        }
        context.strokeStyle = "#7d7a4a", context.lineWidth = 7, context.lineCap = "round", context.beginPath(), context.moveTo(leafCenterX, leafTopY + 2), context.lineTo(leafCenterX, cellY + 128 - 3), context.stroke(), context.strokeStyle = "#96905c", context.lineWidth = 3, context.beginPath(), context.moveTo(leafCenterX, leafTopY + 2), context.lineTo(leafCenterX, cellY + 128 - 3), context.stroke();
      }(leafAtlasContext, cellX, cellY, leafAtlasKinds[cellIndex])), (atlasTextureTemp = new THREE.CanvasTexture(leafAtlasCanvas)).colorSpace = THREE.SRGBColorSpace, atlasTextureTemp.anisotropy = 1, atlasTextureTemp.generateMipmaps = !0, atlasTextureTemp),
      leafShapeTexture = ((leafShapeCanvas = document.createElement("canvas")).width = leafShapeCanvas.height = 128, (leafShapeContext = leafShapeCanvas.getContext("2d")).clearRect(0, 0, 128, 128), [[0, 0], [64, 0], [0, 64], [64, 64]].forEach(([cellX, cellY], cellIndex) => {
        let leafHalfWidth = 64 * (0.36 + cellIndex % 2 * 0.06),
          leafShapeHeight = 64 * (0.78 + 0.08 * (cellIndex >> 1)),
          centerX = cellX + 32,
          baseY = cellY + 58.88,
          shapeGradient = leafShapeContext.createLinearGradient(0, baseY, 0, baseY - leafShapeHeight);
        shapeGradient.addColorStop(0, cellIndex % 2 ? "#6b4d36" : "#7a5a40"), shapeGradient.addColorStop(0.55, "#8a7448"), shapeGradient.addColorStop(1, cellIndex >> 1 ? "#b5b060" : "#a8ad5a"), leafShapeContext.fillStyle = shapeGradient, leafShapeContext.beginPath(), leafShapeContext.moveTo(centerX, baseY), leafShapeContext.bezierCurveTo(centerX - 0.62 * leafHalfWidth, baseY - 0.25 * leafShapeHeight, centerX - 0.5 * leafHalfWidth, baseY - 0.85 * leafShapeHeight, centerX, baseY - leafShapeHeight), leafShapeContext.bezierCurveTo(centerX + 0.5 * leafHalfWidth, baseY - 0.85 * leafShapeHeight, centerX + 0.62 * leafHalfWidth, baseY - 0.25 * leafShapeHeight, centerX, baseY), leafShapeContext.closePath(), leafShapeContext.fill(), leafShapeContext.strokeStyle = "rgba(60,40,25,0.55)", leafShapeContext.lineWidth = 1.2, leafShapeContext.stroke(), leafShapeContext.fillStyle = "rgba(255,240,190,0.22)", leafShapeContext.beginPath(), leafShapeContext.ellipse(centerX - 0.16 * leafHalfWidth, baseY - 0.55 * leafShapeHeight, 0.14 * leafHalfWidth, 0.3 * leafShapeHeight, 0, 0, 2 * Math.PI), leafShapeContext.fill();
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
    function rebuildTrees(seed) {
      treeMesh && (scene.remove(treeMesh), treeMesh.geometry.dispose()), leafMesh && (scene.remove(leafMesh), leafMesh.geometry.dispose()), sparseLeafMesh && (scene.remove(sparseLeafMesh), sparseLeafMesh.geometry.dispose(), sparseLeafMesh = null);
      let buildTrees = function (seed) {
        let buildTreeParts = function (seed) {
            let treeParts = treePresets.map((preset, presetIndex) => generateSceneTree(preset, presetIndex, seed, 1, 2.2));
            if (!hasUsablePerch(treeParts)) {
              let cameraSlope = Math.tan(10.5 * Math.PI / 180);
              for (let retryIndex = 0; retryIndex < 6; retryIndex++) {
                let randomX = ((seed + 7919 * retryIndex) * 0x9e3779b1 >>> 0) / 0x100000000,
                  randomY = ((seed + 99 + 104729 * retryIndex) * 0x9e3779b1 >>> 0) / 0x100000000,
                  trunkLen = 2.3 + 0.5 * randomY,
                  lateralSpan = 1.78 * cameraSlope * trunkLen,
                  crownPos = [(0.15 + 0.3 * randomX) * lateralSpan, 0.183 * trunkLen + (viewportState.portrait ? -0.65 + (randomY - 0.5) * 0.2 : (randomY - 0.5) * 0.3) * cameraSlope * trunkLen, -trunkLen],
                  rootPos = [1.3 * lateralSpan, crownPos[1] + 0.1 + 0.25 * randomX, -trunkLen - 0.35 + 0.5 * randomY],
                  rootDir = [crownPos[0] - rootPos[0], crownPos[1] - rootPos[1], crownPos[2] - rootPos[2]],
                  rootDirLen = Math.hypot(rootDir[0], rootDir[1], rootDir[2]),
                  extraTree = generateSceneTree({
                    origin: rootPos,
                    rootDir: rootDir.map(component => component / rootDirLen),
                    trunkLen: 1.7 * rootDirLen,
                    trunkRadius: 0.012,
                    wobble: 0.22,
                    leafDensity: 0.7,
                    childrenByDepth: [3, 2, 1]
                  }, treePresets.length + 3 + retryIndex, seed, 1, 2.2);
                if (hasUsablePerch([extraTree]) || 5 === retryIndex) {
                  treeParts.splice(treePresets.length - 1, 0, extraTree);
                  break;
                }
              }
            }
            return treeParts;
          }(seed),
          cachedAnchorCount = (treeCache.has(seed) || treeCache.set(seed, -1), treeCache.get(seed));
        cachedAnchorCount < 0 && (cachedAnchorCount = buildTreeParts.reduce((part, partAnchors) => part + partAnchors.anchors.length, 0), treeCache.set(seed, cachedAnchorCount)), treeSeedOffset = cachedAnchorCount;
        let totalVertexCount = 0,
          totalIndexCount = 0;
        for (let part of buildTreeParts) totalVertexCount += part.positions.length / 3, totalIndexCount += part.indices.length;
        let positions = new Float32Array(3 * totalVertexCount),
          normals = new Float32Array(3 * totalVertexCount),
          colors = new Float32Array(3 * totalVertexCount),
          flexValues = new Float32Array(totalVertexCount),
          uvs = new Float32Array(2 * totalVertexCount),
          indices = new (totalVertexCount > 65535 ? Uint32Array : Uint16Array)(totalIndexCount),
          vertexOffset = 0,
          indexOffset = 0,
          anchors = [];
        for (let part of buildTreeParts) {
          positions.set(part.positions, 3 * vertexOffset), normals.set(part.normals, 3 * vertexOffset), colors.set(part.colors, 3 * vertexOffset), flexValues.set(part.flex, vertexOffset), uvs.set(part.uvs, 2 * vertexOffset);
          for (let indexLoop = 0; indexLoop < part.indices.length; indexLoop++) indices[indexOffset + indexLoop] = part.indices[indexLoop] + vertexOffset;
          vertexOffset += part.positions.length / 3, indexOffset += part.indices.length, anchors.push(...part.anchors);
        }
        let {
          perch: perch
        } = selectBirdPerch(buildTreeParts);
        return {
          pos: positions,
          nor: normals,
          col: colors,
          flx: flexValues,
          uv: uvs,
          ind: indices,
          anchors: anchors,
          perch: perch,
          parts: buildTreeParts
        };
      }(seed);
      selectedPerch = viewportState.portrait ? function (treeParts) {
        let bestSelection = null,
          bestCx = 0.62,
          bestZoom = 1;
        e: for (let zoomCandidate of [1, 1.15]) {
          for (let cxCandidate of [0.62, 0.7, 0.78, 0.54, 0.46, 0.86]) {
            viewportState.zoom = zoomCandidate, viewportState.cx = cxCandidate, updateCameraFraming();
            let selection = selectBirdPerch(treeParts);
            if ((!bestSelection || selection.pass < bestSelection.pass || selection.pass === bestSelection.pass && selection.score < bestSelection.score) && (bestSelection = selection, bestCx = cxCandidate, bestZoom = zoomCandidate), 0 === selection.pass) break e;
          }
          if (bestSelection.pass <= 1) break;
        }
        return viewportState.zoom = bestZoom, viewportState.cx = bestCx, updateCameraFraming(), bestSelection.perch;
      }(buildTrees.parts) : buildTrees.perch, hideBird();
      let treeGeometry = new THREE.BufferGeometry();
      treeGeometry.setAttribute("position", new THREE.BufferAttribute(buildTrees.pos, 3)), treeGeometry.setAttribute("normal", new THREE.BufferAttribute(buildTrees.nor, 3)), treeGeometry.setAttribute("color", new THREE.BufferAttribute(buildTrees.col, 3)), treeGeometry.setAttribute("aFlex", new THREE.BufferAttribute(buildTrees.flx, 1)), treeGeometry.setAttribute("uv", new THREE.BufferAttribute(buildTrees.uv, 2)), treeGeometry.setIndex(new THREE.BufferAttribute(buildTrees.ind, 1)), (treeMesh = new THREE.Mesh(treeGeometry, barkMaterial)).frustumCulled = !1, scene.add(treeMesh);
      let anchorsToShuffle = buildTrees.anchors.slice();
      {
        let lcgState = seed >>> 0 || 1,
          lcgRandom = () => (lcgState = 1664525 * lcgState + 0x3c6ef35f >>> 0) / 0x100000000;
        for (let anchorIndex = anchorsToShuffle.length - 1; anchorIndex > 0; anchorIndex--) {
          let swapIndex = Math.floor(lcgRandom() * (anchorIndex + 1)),
            tmpAnchor = anchorsToShuffle[anchorIndex];
          anchorsToShuffle[anchorIndex] = anchorsToShuffle[swapIndex], anchorsToShuffle[swapIndex] = tmpAnchor;
        }
      }
      let sparseAnchors = anchorsToShuffle.slice(0, Math.min(anchorsToShuffle.length, Math.round(0 * treeSeedOffset / 2.2))),
        allAnchors = buildTrees.anchors;
      buildTrees.anchors = sparseAnchors;
      let anchorCount = buildTrees.anchors.length,
        leafGeometry = new THREE.InstancedBufferGeometry(),
        buildLeafPlane = function () {
          let plane = new THREE.PlaneGeometry(1, 1, 1, 2);
          plane.translate(0, 0.5, 0);
          let positionAttribute = plane.attributes.position;
          for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
            let posX = positionAttribute.getX(vertexIndex),
              posY = positionAttribute.getY(vertexIndex);
            positionAttribute.setZ(vertexIndex, -0.16 * posY * posY + 0.09 * Math.abs(posX));
          }
          plane.translate(0, 0.16, 0);
          let uvAttribute = plane.attributes.uv;
          for (let vertexIndex = 0; vertexIndex < uvAttribute.count; vertexIndex++) uvAttribute.setY(vertexIndex, 0.105 + 0.895 * uvAttribute.getY(vertexIndex));
          plane.computeVertexNormals();
          let positionArray = plane.attributes.position.array,
            normalArray = plane.attributes.normal.array,
            uvArray = plane.attributes.uv.array,
            indexArray = plane.index.array,
            planeVertexCount = positionArray.length / 3,
            leafPlane = new THREE.BufferGeometry(),
            positionBuffer = new Float32Array(positionArray.length + 12);
          positionBuffer.set(positionArray), positionBuffer.set([-0.02, 0, 0, 0.02, 0, 0, -0.014, 0.16, 0, 0.014, 0.16, 0], positionArray.length);
          let normalBuffer = new Float32Array(normalArray.length + 12);
          normalBuffer.set(normalArray), normalBuffer.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], normalArray.length);
          let uvBuffer = new Float32Array(uvArray.length + 8);
          uvBuffer.set(uvArray), uvBuffer.set([0.485, 0.01, 0.515, 0.01, 0.485, 0.095, 0.515, 0.095], uvArray.length);
          let indexBuffer = new Uint16Array(indexArray.length + 6);
          return indexBuffer.set(indexArray), indexBuffer.set([planeVertexCount, planeVertexCount + 1, planeVertexCount + 2, planeVertexCount + 1, planeVertexCount + 3, planeVertexCount + 2], indexArray.length), leafPlane.setAttribute("position", new THREE.BufferAttribute(positionBuffer, 3)), leafPlane.setAttribute("normal", new THREE.BufferAttribute(normalBuffer, 3)), leafPlane.setAttribute("uv", new THREE.BufferAttribute(uvBuffer, 2)), leafPlane.setIndex(new THREE.BufferAttribute(indexBuffer, 1)), leafPlane;
        }();
      leafGeometry.index = buildLeafPlane.index, leafGeometry.attributes.position = buildLeafPlane.attributes.position, leafGeometry.attributes.normal = buildLeafPlane.attributes.normal, leafGeometry.attributes.uv = buildLeafPlane.attributes.uv;
      let instanceMatrices = new Float32Array(16 * anchorCount),
        instanceTints = new Float32Array(3 * anchorCount),
        instanceWind = new Float32Array(3 * anchorCount),
        instanceUvCells = new Float32Array(2 * anchorCount),
        atlasCells = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]],
        leafUpBuffer = new Float32Array(3 * anchorCount),
        leafForwardBuffer = new Float32Array(3 * anchorCount),
        leafSizes = new Float32Array(anchorCount);
      for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex++) {
        let anchor = buildTrees.anchors[anchorIndex];
        leafUp.set(anchor.out[0], anchor.out[1], anchor.out[2]).addScaledVector(leafTangent.set(anchor.along[0], anchor.along[1], anchor.along[2]), 0.55), leafUp.y += 0.05 - 0.6 * anchor.droop, leafUp.normalize(), leafBasis.crossVectors(leafUp, leafTangent.set(0, 1, 0)), 1e-6 > leafBasis.lengthSq() && leafBasis.set(1, 0, 0), leafBasis.normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize(), leafRotation.setFromAxisAngle(leafUp, 0.8 * anchor.roll), leafForward.applyQuaternion(leafRotation), leafUpBuffer.set([leafUp.x, leafUp.y, leafUp.z], 3 * anchorIndex), leafForwardBuffer.set([leafForward.x, leafForward.y, leafForward.z], 3 * anchorIndex), leafSizes[anchorIndex] = anchor.size;
      }
      let leafPositions = new Float32Array(3 * anchorCount);
      for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex++) {
        let anchor = buildTrees.anchors[anchorIndex];
        leafPositions.set([anchor.p[0], anchor.p[1], anchor.p[2]], 3 * anchorIndex);
      }
      {
        let bucketMap = new Map(),
          bucketKey = (coordX, coordY, coordZ) => coordX + "," + coordY + "," + coordZ,
          leafCenters = new Float32Array(3 * anchorCount);
        for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex++) {
          let petioleOffset = 0.094 * leafSizes[anchorIndex] * 0.55;
          leafCenters[3 * anchorIndex] = leafPositions[3 * anchorIndex] + leafUpBuffer[3 * anchorIndex] * petioleOffset, leafCenters[3 * anchorIndex + 1] = leafPositions[3 * anchorIndex + 1] + leafUpBuffer[3 * anchorIndex + 1] * petioleOffset, leafCenters[3 * anchorIndex + 2] = leafPositions[3 * anchorIndex + 2] + leafUpBuffer[3 * anchorIndex + 2] * petioleOffset;
          let bucketKeyValue = bucketKey(Math.round(leafCenters[3 * anchorIndex] / 0.1034), Math.round(leafCenters[3 * anchorIndex + 1] / 0.1034), Math.round(leafCenters[3 * anchorIndex + 2] / 0.1034));
          bucketMap.has(bucketKeyValue) || bucketMap.set(bucketKeyValue, []), bucketMap.get(bucketKeyValue).push(anchorIndex);
        }
        for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
          let isYAxis = 2 === axisIndex;
          for (let leafIndex = 0; leafIndex < anchorCount; leafIndex++) {
            let quantizedX = Math.round(leafCenters[3 * leafIndex] / 0.1034),
              quantizedY = Math.round(leafCenters[3 * leafIndex + 1] / 0.1034),
              quantizedZ = Math.round(leafCenters[3 * leafIndex + 2] / 0.1034);
            for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
              let neighborBucket = bucketMap.get(bucketKey(quantizedX + dx, quantizedY + dy, quantizedZ + dz));
              if (neighborBucket) for (let neighborIndex of neighborBucket) {
                if (neighborIndex <= leafIndex) continue;
                let deltaX = leafCenters[3 * neighborIndex] - leafCenters[3 * leafIndex],
                  deltaY = leafCenters[3 * neighborIndex + 1] - leafCenters[3 * leafIndex + 1],
                  deltaZ = leafCenters[3 * neighborIndex + 2] - leafCenters[3 * leafIndex + 2],
                  distance = Math.hypot(deltaX, deltaY, deltaZ),
                  combinedRadius = 0.1034 * (leafSizes[leafIndex] + leafSizes[neighborIndex]) * 0.5;
                if (distance >= combinedRadius) continue;
                let pushFactor = 0.25 + 0.65 * (1 - distance / combinedRadius),
                  sideSign = leafForwardBuffer[3 * leafIndex] * leafForwardBuffer[3 * neighborIndex] + leafForwardBuffer[3 * leafIndex + 1] * leafForwardBuffer[3 * neighborIndex + 1] + leafForwardBuffer[3 * leafIndex + 2] * leafForwardBuffer[3 * neighborIndex + 2] < 0 ? -1 : 1,
                  fwdX = 0,
                  fwdY = 0,
                  fwdZ = 0;
                for (let axis = 0; axis < 3; axis++) {
                  let forwardO = leafForwardBuffer[3 * leafIndex + axis],
                    forwardE = leafForwardBuffer[3 * neighborIndex + axis];
                  leafForwardBuffer[3 * leafIndex + axis] = forwardO + forwardE * sideSign * pushFactor, leafForwardBuffer[3 * neighborIndex + axis] = forwardE + forwardO * sideSign * pushFactor;
                }
                let forwardLen = Math.hypot(leafForwardBuffer[3 * leafIndex], leafForwardBuffer[3 * leafIndex + 1], leafForwardBuffer[3 * leafIndex + 2]) || 1;
                if (fwdX = leafForwardBuffer[3 * leafIndex] / forwardLen, fwdY = leafForwardBuffer[3 * leafIndex + 1] / forwardLen, fwdZ = leafForwardBuffer[3 * leafIndex + 2] / forwardLen, isYAxis && distance < 0.55 * combinedRadius) {
                  let pushSign = deltaX * fwdX + deltaY * fwdY + deltaZ * fwdZ >= 0 ? 1 : -1,
                    pushAmount = Math.min(0.007, (0.55 * combinedRadius - distance) * 0.5);
                  for (let axis = 0; axis < 3; axis++) {
                    let pushDelta = [fwdX, fwdY, fwdZ][axis] * pushSign * pushAmount;
                    leafPositions[3 * neighborIndex + axis] += pushDelta, leafPositions[3 * leafIndex + axis] -= pushDelta;
                  }
                  if (distance < 0.3 * combinedRadius) {
                    let smallerLeaf = leafSizes[leafIndex] < leafSizes[neighborIndex] ? leafIndex : neighborIndex;
                    leafSizes[smallerLeaf] = Math.max(0.5, 0.82 * leafSizes[smallerLeaf]);
                  }
                }
              }
            }
          }
        }
      }
      for (let anchorIndex = 0; anchorIndex < anchorCount; anchorIndex++) {
        let tintColor,
          anchor = buildTrees.anchors[anchorIndex];
        leafUp.set(leafUpBuffer[3 * anchorIndex], leafUpBuffer[3 * anchorIndex + 1], leafUpBuffer[3 * anchorIndex + 2]), leafForward.set(leafForwardBuffer[3 * anchorIndex], leafForwardBuffer[3 * anchorIndex + 1], leafForwardBuffer[3 * anchorIndex + 2]).normalize(), leafBasis.crossVectors(leafUp, leafForward).normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize();
        let leafBaseSize = 0.094 * leafSizes[anchorIndex],
          sizeX = leafBaseSize * (0.85 + 0.3 * Math.random()),
          sizeZ = leafBaseSize * (0.7 + 0.9 * Math.random());
        leafMatrix.makeBasis(leafBasis.multiplyScalar(sizeX), leafUp.multiplyScalar(leafBaseSize), leafForward.multiplyScalar(sizeZ)), leafMatrix.setPosition(leafPositions[3 * anchorIndex], leafPositions[3 * anchorIndex + 1], leafPositions[3 * anchorIndex + 2]), instanceMatrices.set(leafMatrix.elements, 16 * anchorIndex);
        let tintRoll = Math.random();
        tintColor = tintRoll < 0.1 ? [1.14, 1.05, 0.7] : tintRoll < 0.48 ? [0.36, 0.41, 0.28] : tintRoll < 0.68 ? [0.62, 0.68, 0.5] : [1, 1, 1];
        let brightness = (0.85 + 0.35 * Math.random()) * (0.62 + 0.42 * anchor.flex) * 1;
        instanceTints.set([tintColor[0] * brightness, tintColor[1] * brightness, tintColor[2] * brightness], 3 * anchorIndex), instanceWind.set([Math.random() * Math.PI * 2, anchor.flex, 0.5 + 0.55 * Math.random()], 3 * anchorIndex), instanceUvCells.set(atlasCells[4 * Math.random() | 0], 2 * anchorIndex);
      }
      let instanceMatrixAttr = new THREE.InstancedBufferAttribute(instanceMatrices, 16);
      leafGeometry.setAttribute("instanceMatrix", instanceMatrixAttr), leafGeometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(instanceTints, 3)), leafGeometry.setAttribute("aWindI", new THREE.InstancedBufferAttribute(instanceWind, 3)), leafGeometry.setAttribute("aUvCell", new THREE.InstancedBufferAttribute(instanceUvCells, 2)), leafGeometry.instanceCount = anchorCount, (leafMesh = new THREE.Mesh(leafGeometry, leafMaterial)).frustumCulled = !1, scene.add(leafMesh), function (anchors, seed) {
        if (!anchors.length) return;
        sparseLeafMaterial || ((sparseLeafMaterial = leafMaterial.clone()).uniforms = Object.assign({}, leafMaterial.uniforms, {
          map: {
            value: leafShapeTexture
          }
        }));
        let lcgState = 7 * seed + 13 >>> 0 || 1,
          lcgRandom = () => (lcgState = 1664525 * lcgState + 0x3c6ef35f >>> 0) / 0x100000000,
          sparseSelected = [],
          selectionRatio = Math.min(anchors.length, 1300) / anchors.length;
        for (let anchor of anchors) lcgRandom() < selectionRatio && sparseSelected.push(anchor);
        let sparseCount = sparseSelected.length,
          sparseGeometry = new THREE.InstancedBufferGeometry(),
          sparsePlane = new THREE.PlaneGeometry(1, 1, 1, 1);
        sparsePlane.translate(0, 0.5, 0), sparseGeometry.index = sparsePlane.index, sparseGeometry.attributes.position = sparsePlane.attributes.position, sparseGeometry.attributes.normal = sparsePlane.attributes.normal, sparseGeometry.attributes.uv = sparsePlane.attributes.uv;
        let instanceMatrices = new Float32Array(16 * sparseCount),
          instanceTints = new Float32Array(3 * sparseCount),
          instanceWind = new Float32Array(3 * sparseCount),
          instanceUvCells = new Float32Array(2 * sparseCount),
          atlasCells = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]];
        for (let anchorIndex = 0; anchorIndex < sparseCount; anchorIndex++) {
          let anchor = sparseSelected[anchorIndex];
          leafUp.set(anchor.along[0], anchor.along[1], anchor.along[2]).addScaledVector(leafTangent.set(anchor.out[0], anchor.out[1], anchor.out[2]), 0.7).normalize(), leafBasis.crossVectors(leafUp, leafTangent.set(0, 1, 0)), 1e-6 > leafBasis.lengthSq() && leafBasis.set(1, 0, 0), leafBasis.normalize(), leafForward.crossVectors(leafBasis, leafUp).normalize();
          let sparseScale = 0.013 + 0.01 * lcgRandom();
          leafMatrix.makeBasis(leafBasis.multiplyScalar(0.55 * sparseScale), leafUp.multiplyScalar(sparseScale), leafForward.multiplyScalar(0.55 * sparseScale)), leafMatrix.setPosition(anchor.p[0], anchor.p[1], anchor.p[2]), instanceMatrices.set(leafMatrix.elements, 16 * anchorIndex);
          let tintValue = 0.85 + 0.3 * lcgRandom();
          instanceTints.set([tintValue, tintValue * (0.96 + 0.06 * lcgRandom()), 0.9 * tintValue], 3 * anchorIndex), instanceWind.set([lcgRandom() * Math.PI * 2, anchor.flex, 0.15], 3 * anchorIndex), instanceUvCells.set(atlasCells[4 * lcgRandom() | 0], 2 * anchorIndex);
        }
        sparseGeometry.setAttribute("instanceMatrix", new THREE.InstancedBufferAttribute(instanceMatrices, 16)), sparseGeometry.setAttribute("aTint", new THREE.InstancedBufferAttribute(instanceTints, 3)), sparseGeometry.setAttribute("aWindI", new THREE.InstancedBufferAttribute(instanceWind, 3)), sparseGeometry.setAttribute("aUvCell", new THREE.InstancedBufferAttribute(instanceUvCells, 2)), sparseGeometry.instanceCount = sparseCount, (sparseLeafMesh = new THREE.Mesh(sparseGeometry, sparseLeafMaterial)).frustumCulled = !1, scene.add(sparseLeafMesh);
      }(allAnchors, seed);
      let focusSum = 0;
      for (let anchor of allAnchors) focusSum += Math.hypot(anchor.p[0], anchor.p[1], anchor.p[2]);
      focusDistance = Math.max(1.2, focusSum / Math.max(1, allAnchors.length) * 0.92);
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
      loadBirdTexture = (url, isColorTexture) => {
        let texture = birdTextureLoader.load(url, texture => {
          try {
            renderer.initTexture(texture);
          } catch (error) {}
        });
        return texture.flipY = !1, isColorTexture && (texture.colorSpace = THREE.SRGBColorSpace), texture.anisotropy = 4, texture;
      },
      birdTextures = {
        map: loadBirdTexture(assetUrl("tit_diff.webp"), !0),
        normal: loadBirdTexture(assetUrl("tit_norm.webp"), !1),
        rough: loadBirdTexture(assetUrl("tit_rgh.webp"), !1)
      };
    function setupBirdActor(birdRoot, opacity) {
      birdRoot.traverse(node => {
        node.isMesh && (node.frustumCulled = !1, node.material = new THREE.MeshStandardMaterial({
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
        }), birdMaterials.push(node.material), applyLeafLook(lookTransition.d, lookTransition.n, lookTransition.t), opacity < 1 && (node.material.transparent = !0, node.material.opacity = opacity, node.material.depthWrite = !1));
      });
      let mixer = new THREE.AnimationMixer(birdRoot),
        flapAction = mixer.clipAction(birdAnimations.flap),
        perchAction = mixer.clipAction(birdAnimations.perch),
        foldAction = mixer.clipAction(birdAnimations.fold);
      return flapAction.play(), perchAction.play(), foldAction.play(), perchAction.setEffectiveWeight(0), foldAction.setEffectiveWeight(0), {
        root: birdRoot,
        mixer: mixer,
        flap: flapAction,
        perch: perchAction,
        fold: foldAction,
        bones: function (root) {
          let boneState = {
            list: [],
            clean: [],
            cleanScale: [],
            rest: {}
          };
          for (let boneName of boneNames) {
            let bone = root.getObjectByName(boneName);
            bone && (boneState.list.push(bone), boneState.clean.push(bone.quaternion.clone()), boneState.cleanScale.push(bone.scale.clone()), boneState.rest[boneName] = bone.quaternion.clone(), boneState[boneName] = bone);
          }
          return boneState;
        }(birdRoot)
      };
    }
    let birdRootOffset = [0, 0.085, 0.545];
    Promise.resolve(options.bird || assetUrl("tit.glb")).then(url => new gltfModule.GLTFLoader().load(url, gltf => {
      var sceneRoot;
      let tempVertex,
        birdPivot,
        adjustedVertex,
        findAnimation = keyword => gltf.animations.find(animation => animation.name.toLowerCase().includes(keyword)) || gltf.animations[0];
      for (let cloneOpacity of (birdAnimations = {
        flap: findAnimation("flap"),
        perch: findAnimation("perch"),
        fold: gltf.animations.find(animation => animation.name.toLowerCase().includes("fold")) || findAnimation("perch")
      }, gltf.scene.scale.setScalar(1.1 * (viewportState.portrait ? 0.82 : 1)), sceneRoot = gltf.scene, tempVertex = new THREE.Vector3(), birdPivot = new THREE.Vector3(...birdRootOffset), adjustedVertex = new THREE.Vector3(), sceneRoot.traverse(meshNode => {
        if (!meshNode.isSkinnedMesh) return;
        let positionAttribute = meshNode.geometry.attributes.position,
          skinIndexAttribute = meshNode.geometry.attributes.skinIndex,
          skinWeightAttribute = meshNode.geometry.attributes.skinWeight,
          boneNameList = meshNode.skeleton.bones.map(bone => bone.name);
        for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
          let maxBoneIndex = 0,
            maxWeight = -1;
          for (let influence = 0; influence < 4; influence++) {
            let influenceWeight = skinWeightAttribute.getComponent(vertexIndex, influence);
            influenceWeight > maxWeight && (maxWeight = influenceWeight, maxBoneIndex = skinIndexAttribute.getComponent(vertexIndex, influence));
          }
          let boneName = boneNameList[maxBoneIndex];
          if (tempVertex.fromBufferAttribute(positionAttribute, vertexIndex), "body" === boneName || "head" === boneName) {
            let radialFade = (tempVertex.z - 0.06) / (tempVertex.z < 0.06 ? 0.52 : 1),
              radialScale = Math.sqrt(Math.max(0.2, 1 - radialFade * radialFade));
            tempVertex.x *= radialScale, tempVertex.y = 0.04 + (tempVertex.y - 0.04) * radialScale;
            let headMerge = 0.55 * smoothstep((tempVertex.z - 0.38) / 0.14),
              isTailQuill = tempVertex.z > 0.64 && 0.08 > Math.abs(tempVertex.x) && tempVertex.y > 0.05 && tempVertex.y < 0.17;
            if (headMerge > 0 && !isTailQuill) {
              adjustedVertex.copy(tempVertex).sub(birdPivot);
              let mergeDist = adjustedVertex.length() || 1;
              tempVertex.lerp(adjustedVertex.multiplyScalar(0.195 / mergeDist).add(birdPivot), headMerge);
            }
          } else if ("tail" === boneName) {
            let tailFade = Math.max(0, (-0.218 - tempVertex.z) / 0.544);
            tempVertex.z = -0.218 + (tempVertex.z - -0.218) * 0.85, tempVertex.x *= 1 + (1.35 - 1) * tailFade;
          }
          positionAttribute.setXYZ(vertexIndex, tempVertex.x, tempVertex.y, tempVertex.z);
        }
        positionAttribute.needsUpdate = !0;
        let meshGeometry = meshNode.geometry;
        meshGeometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(3 * positionAttribute.count), 3)), meshGeometry.computeVertexNormals();
        let normalAttribute = meshGeometry.attributes.normal;
        for (let normalIndex = 0; normalIndex < normalAttribute.count; normalIndex++) 0.5 > Math.hypot(normalAttribute.getX(normalIndex), normalAttribute.getY(normalIndex), normalAttribute.getZ(normalIndex)) && normalAttribute.setXYZ(normalIndex, 0, 1, 0);
        meshGeometry.computeBoundingSphere();
      }), function (sourceRoot) {
        let skeletonMap = new Map();
        sourceRoot.traverse(node => {
          node.isSkinnedMesh && (skeletonMap.has(node.skeleton) || skeletonMap.set(node.skeleton, []), skeletonMap.get(node.skeleton).push(node));
        });
        let invBindMatrix = new THREE.Matrix4(),
          bindMatrix = new THREE.Matrix4(),
          bonePos = new THREE.Vector3(),
          farVertex = new THREE.Vector3(),
          vertexPos = new THREE.Vector3();
        for (let [skeleton, meshList] of skeletonMap) {
          let bones = skeleton.bones.slice(),
            boneInverses = skeleton.boneInverses.map(matrix => matrix.clone()),
            meshInfos = meshList.map(mesh => ({
              mesh: mesh,
              geo: mesh.geometry,
              slotOf: new Int8Array(mesh.geometry.attributes.position.count),
              dist: new Float32Array(mesh.geometry.attributes.position.count)
            }));
          for (let side of ["L", "R"]) {
            let wingIndex = bones.findIndex(bone => bone.name === "wing" + side);
            if (wingIndex < 0) continue;
            let wingBone = bones[wingIndex];
            invBindMatrix.copy(boneInverses[wingIndex]).invert(), bonePos.setFromMatrixPosition(invBindMatrix);
            let maxDist = 0;
            for (let meshInfo of (farVertex.copy(bonePos), meshInfos)) {
              let positionAttr = meshInfo.geo.attributes.position,
                skinIndexAttr = meshInfo.geo.attributes.skinIndex,
                skinWeightAttr = meshInfo.geo.attributes.skinWeight;
              bindMatrix.copy(meshInfo.mesh.bindMatrix);
              for (let vertexIndex = 0; vertexIndex < positionAttr.count; vertexIndex++) {
                let slotIndex = -1;
                for (let influence = 0; influence < 4; influence++) skinIndexAttr.getComponent(vertexIndex, influence) === wingIndex && skinWeightAttr.getComponent(vertexIndex, influence) > 0 && (slotIndex = influence);
                if (meshInfo.slotOf[vertexIndex] = slotIndex, slotIndex < 0) continue;
                let dist = meshInfo.dist[vertexIndex] = vertexPos.fromBufferAttribute(positionAttr, vertexIndex).applyMatrix4(bindMatrix).distanceTo(bonePos);
                skinWeightAttr.getComponent(vertexIndex, slotIndex) >= 0.5 && dist > maxDist && (maxDist = dist, farVertex.copy(vertexPos));
              }
            }
            if (maxDist < 1e-4) continue;
            let wristBone = new THREE.Bone();
            wristBone.name = "wrist" + side, wristBone.position.copy(vertexPos.copy(bonePos).lerp(farVertex, 0.5).applyMatrix4(boneInverses[wingIndex])), wingBone.add(wristBone), wingBone.updateMatrixWorld(!0), bones.push(wristBone), boneInverses.push(invBindMatrix.multiply(wristBone.matrix).clone().invert());
            let wristIndex = bones.length - 1;
            for (let meshInfo of meshInfos) {
              let skinIndexAttr = meshInfo.geo.attributes.skinIndex,
                skinWeightAttr = meshInfo.geo.attributes.skinWeight;
              for (let vertexIndex = 0; vertexIndex < meshInfo.slotOf.length; vertexIndex++) {
                let slotIndex = meshInfo.slotOf[vertexIndex];
                if (slotIndex < 0) continue;
                let wristBlend = smoothstep((meshInfo.dist[vertexIndex] / maxDist - 0.39) / 0.22);
                if (wristBlend <= 0) continue;
                let origWeight = skinWeightAttr.getComponent(vertexIndex, slotIndex),
                  freeSlot = -1;
                for (let influence = 0; influence < 4; influence++) if (influence !== slotIndex && 0 === skinWeightAttr.getComponent(vertexIndex, influence)) {
                  freeSlot = influence;
                  break;
                }
                if (freeSlot < 0) {
                  wristBlend > 0.5 && skinIndexAttr.setComponent(vertexIndex, slotIndex, wristIndex);
                  continue;
                }
                skinWeightAttr.setComponent(vertexIndex, slotIndex, origWeight * (1 - wristBlend)), skinIndexAttr.setComponent(vertexIndex, freeSlot, wristIndex), skinWeightAttr.setComponent(vertexIndex, freeSlot, origWeight * wristBlend);
              }
              skinIndexAttr.needsUpdate = !0, skinWeightAttr.needsUpdate = !0;
            }
          }
          let skeleton = new THREE.Skeleton(bones, boneInverses);
          for (let mesh of meshList) mesh.bind(skeleton, mesh.bindMatrix);
        }
      }(gltf.scene), birdGroup.add(gltf.scene), birdActors.push(setupBirdActor(gltf.scene, 1)), birdCloneOpacity)) {
        let cloneGroup = new THREE.Group(),
          cloneRoot = function (sourceRoot) {
            let cloneMap = new Map(),
              reverseCloneMap = new Map(),
              cloneRoot = sourceRoot.clone(),
              cloneTree = (sourceNode, cloneNode, visit) => {
                visit(sourceNode, cloneNode);
                for (let childIndex = 0; childIndex < sourceNode.children.length; childIndex++) cloneTree(sourceNode.children[childIndex], cloneNode.children[childIndex], visit);
              };
            return cloneTree(sourceRoot, cloneRoot, (sourceNode, cloneNode) => {
              cloneMap.set(cloneNode, sourceNode), reverseCloneMap.set(sourceNode, cloneNode);
            }), cloneRoot.traverse(cloneNode => {
              if (!cloneNode.isSkinnedMesh) return;
              let sourceNode = cloneMap.get(cloneNode);
              cloneNode.skeleton = sourceNode.skeleton.clone(), cloneNode.bindMatrix.copy(sourceNode.bindMatrix), cloneNode.skeleton.bones = sourceNode.skeleton.bones.map(meshNode => reverseCloneMap.get(meshNode)), cloneNode.bind(cloneNode.skeleton, cloneNode.bindMatrix);
            }), cloneRoot;
          }(gltf.scene);
        cloneGroup.add(cloneRoot), cloneGroup.visible = !1, scene.add(cloneGroup), birdClones.push(cloneGroup), birdActors.push(setupBirdActor(cloneRoot, cloneOpacity));
      }
      let wasVisible = birdGroup.visible;
      for (let clone of (birdGroup.visible = !0, birdClones)) clone.visible = !0;
      try {
        renderer.compile(scene, camera);
      } catch (error) {}
      for (let clone of (birdGroup.visible = wasVisible, birdClones)) clone.visible = !1;
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
      rotateBone = (bone, axis, angle) => bone.quaternion.multiply(boneRotation.setFromAxisAngle(axis, angle));
    function applyBirdAnimation(actor, perchWeight, flapTime, foldWeight = 0) {
      let combinedPerchWeight = Math.min(1, perchWeight + foldWeight * (1 - perchWeight));
      actor.flap.setEffectiveWeight(1 - combinedPerchWeight), actor.perch.setEffectiveWeight(perchWeight), actor.fold.setEffectiveWeight(foldWeight * (1 - perchWeight));
      actor.flap.time = (0.52 * flapTime % 1.04 + 1.04) % 1.04;
      let bones = actor.bones;
      for (let boneIndex = 0; boneIndex < bones.list.length; boneIndex++) bones.list[boneIndex].quaternion.copy(bones.clean[boneIndex]), bones.list[boneIndex].scale.copy(bones.cleanScale[boneIndex]);
      actor.mixer.update(0);
      for (let boneIndex = 0; boneIndex < bones.list.length; boneIndex++) bones.clean[boneIndex].copy(bones.list[boneIndex].quaternion), bones.cleanScale[boneIndex].copy(bones.list[boneIndex].scale);
      let flutterNoise = 0.07 * Math.sin(7.31 * Math.floor(flapTime) + 1.7) * (1 - combinedPerchWeight),
        relaxationAmount = Math.min(1, Math.max(0, (1 - wingRelaxation) * (1 - combinedPerchWeight) + flutterNoise));
      return relaxationAmount > 0.001 && (bones.wingL && bones.wingL.quaternion.slerp(bones.rest.wingL, relaxationAmount), bones.wingR && bones.wingR.quaternion.slerp(bones.rest.wingR, relaxationAmount)), bones.tail && (bones.tail.scale.x = 1 + 1.5 * headTurnAmount * (1 - perchWeight)), bones.legs && (bones.legs.quaternion.slerpQuaternions(bones.rest.legs, boneTempRotation.copy(bones.rest.legs).multiply(boneRotation.setFromAxisAngle(axisX, 0.96)), 1 - perchBlend), bones.legs.scale.setScalar(0.55 + 0.8 * perchBlend)), (1 - combinedPerchWeight) * wingRelaxation;
    }
    let headTurnAmount = 0;
    function computeWindOffset(out, position, flex, time, wind) {
      let phase = 0.7 * position[0] + 0.5 * position[2] + 0.3 * position[1] - 0.6 * flex * lagUniform.value,
        primaryWave = Math.sin(1.05 * time + phase),
        secondaryWave = Math.sin(2.3 * time + 1.6 * phase + 1.3),
        tertiaryWave = Math.sin(4.7 * time + 2.9 * phase + 4.1) * flex * flex,
        windAmplitude = wind * flex * flex * (0.35 + 0.65 * flex),
        swayFactor = (0.58 * primaryWave + 0.24 * secondaryWave + 0.07 * tertiaryWave) * windAmplitude * 0.085,
        landingElapsed = time - landingUniform.value.w,
        landingDeltaX = position[0] - landingUniform.value.x,
        landingDeltaY = position[1] - landingUniform.value.y,
        landingDeltaZ = position[2] - landingUniform.value.z,
        landingDistance = Math.sqrt(landingDeltaX * landingDeltaX + landingDeltaY * landingDeltaY + landingDeltaZ * landingDeltaZ),
        landingFalloff = 1 - Math.min(1, Math.max(0, landingDistance / 0.9)) ** 2 * (3 - 2 * Math.min(1, landingDistance / 0.9)),
        springParams = landingSpringUniform.value,
        landingDip = landingElapsed > 0 && landingElapsed < 3 ? -Math.sin(landingElapsed * springParams.y) * Math.exp(-landingElapsed * springParams.z) * springParams.x * (0.3 + 0.7 * flex) * landingFalloff : 0;
      return out.set(0.72 * swayFactor, 0.18 * swayFactor + (0.45 * secondaryWave + 0.15 * tertiaryWave) * windAmplitude * 0.028 + landingDip, 0.55 * swayFactor), out;
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
    function buildFlapSchedule(duration) {
      flapSchedule = [];
      let scheduleTime = 0,
        beatCursor = 0;
      for (viewportState.portrait, wingBeatPhase = 0; scheduleTime < duration + 2;) {
        let beats = 24 + Math.floor(17 * Math.random()),
          onRatio = beats / flapScheduleBeats,
          offRatio = 0.09 + 0.07 * Math.random();
        flapSchedule.push({
          t0: scheduleTime,
          on: onRatio,
          off: offRatio,
          beats: beats,
          beat0: beatCursor
        }), scheduleTime += onRatio + offRatio, beatCursor += beats;
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
    function sampleFlapSchedule(time, out = flapStateA) {
      flapSchedule.length || buildFlapSchedule(6);
      let currentSegment = flapSchedule[flapSchedule.length - 1];
      for (let segment of flapSchedule) if (time >= segment.t0) currentSegment = segment;else break;
      let segmentElapsed = time - currentSegment.t0,
        isFlapping = segmentElapsed < currentSegment.on,
        phaseProgress = isFlapping ? segmentElapsed / currentSegment.on : Math.min(1, (segmentElapsed - currentSegment.on) / currentSegment.off);
      return out.flapW = Math.min(smoothstep((segmentElapsed + 0.02) / 0.11), smoothstep((currentSegment.on + 0.05 - segmentElapsed) / 0.16)), out.beat = currentSegment.beat0 + (isFlapping ? phaseProgress * currentSegment.beats : currentSegment.beats), out.y = isFlapping ? -Math.cos(phaseProgress * Math.PI) : Math.cos(phaseProgress * Math.PI), out.burst = isFlapping ? Math.sin(phaseProgress * Math.PI) : 0, out;
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
      smoothstep = value => (value = Math.min(1, Math.max(0, value))) * value * (3 - 2 * value);
    function hideBird() {
      for (let clone of (birdState = "away", birdGroup.visible = !1, birdClones)) clone.visible = !1;
      nextFlightAt = timeUniform.value + (timeUniform.value < 1 ? 3 : 14 + 20 * Math.random());
    }
    function startBirdCrossing() {
      let halfWidthFactor = 3.55 * Math.tan(10.5 * Math.PI / 180),
        crossingDepth = viewportState.portrait ? 0.25 + 0.15 * Math.random() : 0.9 + 0.5 * Math.random(),
        crossingZ = 3.55 - (crossingDepth < 0 ? -(0.5 * crossingDepth) : 0),
        worldY = ndcY => 0.183 * crossingZ + Math.tan(10.5 * Math.PI / 180) * crossingZ * ((viewportState.portrait ? ndcY / viewportState.zoom : ndcY) + viewportState.cy),
        shelterA = cloudMesh.material.uniforms.uShelterA.value,
        shelterTopY = shelterA.w > shelterA.y ? shelterA.y - 0.015 : 0,
        hasShelterGap = !viewportState.portrait && shelterTopY - 0.13 >= 0.06,
        startY = worldY(viewportState.portrait ? -0.24 : hasShelterGap ? 1 - 2 * shelterTopY : 0.14),
        endY = worldY(viewportState.portrait ? 0.1 : hasShelterGap ? 1 - 2 * (0.13 + 0.4 * (shelterTopY - 0.13)) : 0.52),
        controlY = worldY(viewportState.portrait ? 0.14 : hasShelterGap ? 0.74 : 0.58),
        startX = startY + Math.random() * (endY - startY),
        endX = startY + Math.random() * (endY - startY),
        halfViewWidth = (viewportState.max - viewportState.min) / 2 * halfWidthFactor * (16 / 9),
        viewWidth = viewportState.portrait ? halfViewWidth : halfWidthFactor * (viewportState.w / viewportState.h),
        viewCenterX = viewportState.portrait ? (viewportState.min + viewportState.max) / 2 * halfWidthFactor * (16 / 9) : 0,
        halfSpan = viewWidth + (viewportState.portrait ? 0.35 : 0.5),
        depthSign = (0.5 > Math.random() ? 1 : -1) * (viewportState.portrait ? 0.45 + 0.2 * Math.random() : 0.9 + 0.5 * Math.random());
      flightStart.set(viewCenterX - halfSpan, startX, -3.55 - depthSign / 2 + (Math.random() - 0.5) * 0.2), flightEnd.set(viewCenterX + halfSpan, endX, flightStart.z + depthSign), flightControl.copy(flightStart).lerp(flightEnd, 0.4 + 0.2 * Math.random()), flightControl.y = Math.min(flightControl.y + 0.04 + 0.12 * Math.random(), controlY), flightControl.z += -crossingDepth, flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), buildFlapSchedule(6), birdState = "cross", flightDuration = pathLength / (viewportState.portrait ? 1.5 : 3), flightElapsed = 0, birdGroup.visible = !0, foldAmount = 0;
    }
    function perchBird(time, delay) {
      birdState = "perched", birdGroup.visible = !0, foldAmount = 1, hopYaw = 0, microMotion = null, headTurnOffset = 0, nextMicroMotionAt = time + delay, nextDepartureAt = time + 12 + 14 * Math.random(), wingFlutterAt = time + 1.5, bodySway = 0, targetBodySway = 0;
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
      let exitZ = flightStart.z - 1.4 - 0.4 * Math.random(),
        negExitZ = -exitZ,
        exitX = viewportState.min * Math.tan(10.5 * Math.PI / 180) * negExitZ * (16 / 9);
      flightEnd.set(Math.min(flightStart.x - 2.6, exitX - 0.6), flightStart.y + 0.75 + 0.2 * Math.random(), exitZ), flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), buildFlapSchedule(4), birdState = "out", flightDuration = 2, flightElapsed = 0, departureStartQuat.copy(birdGroup.quaternion), flightLookObject.position.copy(birdGroup.position), flightLookObject.lookAt(flightStart.x + +departureSide, flightStart.y + 0.02, flightStart.z + 0.22), flightLookObject.rotateX(-0.3), departureEndQuat.copy(flightLookObject.quaternion), departureLift = departureSide < 0 ? 0.42 : 0.68;
    }
    let pathLengthTable = new Float32Array(65),
      pathLength = 1,
      pathPointA = new THREE.Vector3(),
      pathPointB = new THREE.Vector3();
    function sampleBezierPath(out, time) {
      let inverseTime = 1 - time;
      return out.set(inverseTime * inverseTime * flightStart.x + 2 * inverseTime * time * flightControl.x + time * time * flightEnd.x, inverseTime * inverseTime * flightStart.y + 2 * inverseTime * time * flightControl.y + time * time * flightEnd.y, inverseTime * inverseTime * flightStart.z + 2 * inverseTime * time * flightControl.z + time * time * flightEnd.z);
    }
    function buildPathLengthTable() {
      let distanceAccumulated = 0;
      pathLengthTable[0] = 0, sampleBezierPath(pathPointA, 0);
      for (let sampleIndex = 1; sampleIndex <= 64; sampleIndex++) sampleBezierPath(pathPointB, sampleIndex / 64), distanceAccumulated += pathPointB.distanceTo(pathPointA), pathLengthTable[sampleIndex] = distanceAccumulated, pathPointA.copy(pathPointB);
      pathLength = distanceAccumulated || 1;
      for (let sampleIndex = 1; sampleIndex <= 64; sampleIndex++) pathLengthTable[sampleIndex] /= pathLength;
    }
    let arrivalQuat = new THREE.Quaternion(),
      arrivalDelay = 0,
      lastPerchAt = -10,
      pathTime = 0,
      lastFlightAt = -10;
    function screenToWorld(out, ndcX, ndcY, distance) {
      return out.set(2 * ndcX - 1, -(2 * ndcY - 1), 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(distance).add(camera.position), out;
    }
    function startBirdArrival() {
      if (!selectedPerch || !birdReady) return;
      flightEnd.fromArray(selectedPerch.p), flightEnd.y += 0.004, pointerRay.set(flightEnd.x, flightEnd.y, flightEnd.z).project(camera);
      let ndcX = (pointerRay.x + 1) / 2,
        ndcY = (1 - pointerRay.y) / 2,
        distance = flightEnd.distanceTo(camera.position);
      screenToWorld(flightStart, 1.1, Math.min(0.96, ndcY + 0.17 + 0.06 * Math.random()), distance + 1.1 + 0.3 * Math.random()), screenToWorld(flightControl, Math.min(0.98, ndcX + 0.1 + 0.03 * Math.random()), Math.min(0.97, ndcY + 0.1 + 0.03 * Math.random()), distance + 0.3), flightPathPhase = 6.28 * Math.random(), flightPathScale = 0.8 + 0.5 * Math.random(), buildPathLengthTable(), flightLookObject.position.copy(flightEnd), flightLookObject.lookAt(flightEnd.x - 1, flightEnd.y + 0.02, flightEnd.z + 0.22), flightLookObject.rotateX(-0.3), arrivalQuat.copy(flightLookObject.quaternion), birdState = "in", flightDuration = 1.5, flightElapsed = 0, arrivalDelay = 0, birdGroup.visible = !0, foldAmount = 0;
    }
    function sampleFlightPath(out, pathTime, flapState) {
      return sampleBezierPath(out, function (time) {
        if (time <= 0) return 0;
        if (time >= 1) return 1;
        let lowerIndex = 0,
          upperIndex = 64;
        for (; upperIndex - lowerIndex > 1;) {
          let midIndex = lowerIndex + upperIndex >> 1;
          pathLengthTable[midIndex] <= time ? lowerIndex = midIndex : upperIndex = midIndex;
        }
        let span = pathLengthTable[upperIndex] - pathLengthTable[lowerIndex];
        return (lowerIndex + (span > 1e-9 ? (time - pathLengthTable[lowerIndex]) / span : 0)) / 64;
      }(pathTime)), flapState && (out.y += wingBeatPhase * flapState.y * landingBounce), out;
    }
    let frameDelta = 0.016,
      birdRoll = 0,
      arrivalWingFold = 0;
    function animateBirdAlongPath(bird, actor, pathProgress, pathTime, flapState, elapsed) {
      let clampedProgress = Math.min(1, Math.max(0, pathProgress + (0.022 * Math.sin(1.1 * elapsed * flightPathScale + flightPathPhase) * flightPathWobble + ("in" === birdState ? 0 : 0.0015 * Math.sin(2 * pathTime * Math.PI - 1.2))) + (flapState ? 0 * flapState.y * landingBounce : 0))),
        sampledFlapState = flapState && wingBeatPhase > 0 ? sampleFlapSchedule(elapsed + 0.02 * flightDuration, flapStateB) : flapState;
      sampleFlightPath(flightPosition, clampedProgress, flapState), sampleFlightPath(flightLookAt, Math.min(1, clampedProgress + 0.02), sampledFlapState), flapState && wingBeatPhase > 0 && (flightLookAt.y -= wingBeatPhase * (sampledFlapState.y - flapState.y) * landingBounce * 0.55), flightPosition.z += 0, flightLookAt.z += 0 + 0.03 * Math.cos(1.4 * elapsed + flightPathPhase) * 0.6 * flightPathWobble, flightPosition.y += 0, flightLookAt.y += 0, bird.position.copy(flightPosition), flightLookAt.distanceToSquared(flightPosition) > 1e-9 && bird.lookAt(flightLookAt), sampleFlightPath(tmpVecB, Math.min(1, clampedProgress + 0.06), sampledFlapState), tmpVecB.z += 0, tmpVecB.y += 0, tmpVecC.copy(tmpVecB).sub(flightLookAt), inverseBirdQuat.copy(bird.quaternion).invert(), tmpVecC.applyQuaternion(inverseBirdQuat);
      let rollAngle = Math.max(-0.26, Math.min(0.26, -(5 * (tmpVecC.lengthSq() > 1e-9 ? Math.atan2(tmpVecC.x, tmpVecC.z) : 0)))) * (1 - arrivalWingFold);
      bird === birdGroup && (birdRoll += (rollAngle - birdRoll) * (1 - Math.exp(-(6 * (frameDelta || 0.016))))), bird.rotateZ((bird === birdGroup ? birdRoll : rollAngle) + ("cross" === birdState ? 0.06 : 0.05) * Math.sin(1.4 * elapsed * flightPathScale + flightPathPhase) * flightPathWobble);
      let hopLift = flapState ? 0.012 * flapState.burst * landingBounce : 0,
        wrappedPathTime = (pathTime % 1 + 1) % 1;
      bird.rotateX(-hopLift + 0.025 * Math.sin((wrappedPathTime - 0.23) * 2 * Math.PI) * (1 - foldAmount)), "in" !== birdState && (bird.position.y += 0.0025 * Math.sin(2 * pathTime * Math.PI - 0.6));
      let wingFoldAmount = applyBirdAnimation(actor, foldAmount, pathTime, flapState ? 0.55 * (1 - flapState.flapW) * landingBounce : 0);
      if (flapState) {
        var rollToApply, foldRemaining;
        let bones;
        !function (actor, flapPhase, amount) {
          if (amount <= 0.001) return;
          let bones = actor.bones,
            wingL = bones.wingL,
            wingR = bones.wingR;
          if (!wingL || !wingR) return;
          let wingCosine = Math.cos((flapPhase - 0.23 - 0.25) * 2 * Math.PI),
            downstroke = Math.max(0, -wingCosine),
            wingRoll = (wingCosine > 0 ? -0.14 * wingCosine : 0.3 * downstroke) * amount,
            wingPitch = 0.3 * downstroke * amount;
          if (rotateBone(wingL, axisZ, wingRoll), rotateBone(wingL, axisY, wingPitch), rotateBone(wingR, axisZ, -wingRoll), rotateBone(wingR, axisY, -wingPitch), bones.wristL && bones.wristR) {
            let wristRoll = downstroke * downstroke * 0.62 * amount,
              wristPitch = 0.35 * downstroke * amount,
              wristYaw = 0.3 * Math.sin((flapPhase - 0.23) * 2 * Math.PI) * amount;
            rotateBone(bones.wristL, axisZ, wristRoll), rotateBone(bones.wristL, axisX, wristYaw - wristPitch), rotateBone(bones.wristR, axisZ, -wristRoll), rotateBone(bones.wristR, axisX, wristYaw - wristPitch);
          }
        }(actor, actor.flap.time % 0.52 / 0.52, wingFoldAmount), rollToApply = bird === birdGroup ? birdRoll : rollAngle, foldRemaining = 1 - arrivalWingFold, bones = actor.bones, !(foldRemaining <= 0.001) && (bones.head && rotateBone(bones.head, axisY, -(0.65 * rollToApply) * foldRemaining), bones.tail && (rotateBone(bones.tail, axisX, -(0.5 * hopLift) * foldRemaining), rotateBone(bones.tail, axisZ, 0.6 * rollToApply * foldRemaining)));
      } else actor.bones.head && arrivalWingFold > 0 && rotateBone(actor.bones.head, axisX, 0.55 * arrivalWingFold);
    }
    let microMotion = null,
      nextMicroMotionAt = 0,
      headTurnOffset = 0,
      hopYaw = 0,
      perchTangent = new THREE.Vector3();
    function getPerchPosition(out) {
      return out.fromArray(selectedPerch.p), hopYaw && selectedPerch.along && out.addScaledVector(perchTangent.fromArray(selectedPerch.along), hopYaw), out;
    }
    function getPerchLookAt(out) {
      return getPerchPosition(out), out.x -= 1, out.y += 0.02, out.z += 0.22, out;
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
    "u" > typeof IntersectionObserver && (intersectionObserver = new IntersectionObserver(entries => {
      for (let entry of entries) inViewport = entry.isIntersecting, entry.intersectionRatio < 0.15 ? pauseAnimation() : entry.intersectionRatio > 0.6 && resumeAnimation();
    }, {
      threshold: [0, 0.1, 0.15, 0.6, 0.7]
    })).observe(hostElement), listen(document, "visibilitychange", () => {
      document.hidden ? pauseAnimation() : resumeAnimation();
    }), listen(window, "blur", pauseAnimation), listen(window, "focus", resumeAnimation);
    let wheelDelta = 0;
    listen(window, "wheel", event => {
      (wheelDelta = Math.max(0, Math.min(1400, wheelDelta + event.deltaY))) > 800 ? pauseAnimation() : wheelDelta < 120 && resumeAnimation();
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
      addKernelSample = (sampleCount, radius, angleOffset) => {
        for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
          let angle = sampleIndex / sampleCount * Math.PI * 2 + angleOffset,
            offsetX = (Math.cos(angle) * radius).toFixed(4),
            offsetY = (Math.sin(angle) * radius).toFixed(4);
          blurKernel += `{
      vec2 uv2 = vUv + (ROT * vec2(${offsetX}, ${offsetY})) * uRadNow * uTexel;
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
    function renderPostprocess(target) {
      renderer.setRenderTarget(skyRenderTarget), renderer.setClearColor(0, 1), renderer.render(skyScene, camera), cloudStrengthUniform.value > 0.001 && (renderer.setRenderTarget(cloudRenderTarget), cloudMesh.material.uniforms.uRes.value.set(cloudRenderTarget.width, cloudRenderTarget.height), renderer.setClearColor(0, 0), renderer.clear(), renderer.render(cloudScene, camera), cloudCompositeMaterial.uniforms.tSrc.value = cloudRenderTarget.texture, postQuad.material = cloudCompositeMaterial, renderer.setRenderTarget(skyRenderTarget), renderer.autoClear = !1, renderer.render(postScene, postCamera), renderer.autoClear = !0), renderer.setRenderTarget(sceneRenderTarget), renderer.setClearColor(0, 0), renderer.render(scene, camera), postQuad.material = dofMaterial, dofMaterial.uniforms.tSrc.value = sceneRenderTarget.texture, dofMaterial.uniforms.uRadNow.value = dofMaterial.uniforms.uFgBlur.value, renderer.setRenderTarget(foregroundBlurTarget), renderer.render(postScene, postCamera), dofMaterial.uniforms.tSrc.value = skyRenderTarget.texture, dofMaterial.uniforms.uRadNow.value = dofMaterial.uniforms.uBgBlur.value, renderer.setRenderTarget(backgroundBlurTarget), renderer.render(postScene, postCamera), gradeMaterial.uniforms.tFol.value = sceneRenderTarget.texture, gradeMaterial.uniforms.tFolB.value = foregroundBlurTarget.texture, gradeMaterial.uniforms.tSky.value = skyRenderTarget.texture, gradeMaterial.uniforms.tSkyB.value = backgroundBlurTarget.texture, postQuad.material = gradeMaterial, renderer.setRenderTarget(target), renderer.render(postScene, postCamera);
    }
    postScene.add(postQuad);
    let focusDistance = 2.4,
      moonDistance = moonPosition.length();
    function setCameraPosition(posX, posY, posZ) {
      moonPosition.set(posX, posY, posZ), moonMesh.position.copy(moonPosition);
      let moonDir = moonPosition.clone().normalize();
      for (let material of [skyMesh.material, moonMesh.material, cloudMesh.material]) material.uniforms.uMoonDir && material.uniforms.uMoonDir.value.copy(moonDir);
      nightSunDirection.copy(moonDir), nightLook.sunDir.copy(moonDir);
    }
    let currentFocusDistance = 1 / moonDistance,
      targetFocusDistance = 1 / moonDistance;
    listen(canvas, "click", event => {
      if (reducedMotion) return;
      let rect = hostElement.getBoundingClientRect();
      "perched" === birdState ? isPointerOverBird(event.clientX - rect.left, event.clientY - rect.top) && departBird() : "away" === birdState && startBirdCrossing();
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
    for (let [lookName, label, colorHex] of [["day", "Noon", "#7ea9de"], ["night", "Night", "#1a2237"], ["morning", "Morning", "#dcc4b3"]]) {
      let button = document.createElement("button");
      button.type = "button", button.className = cssClasses.look, button.style.setProperty("--sw", colorHex), button.title = label, button.setAttribute("aria-label", label), button.textContent = label, lookControl.appendChild(button), lookButtons[lookName] = button;
    }
    !1 !== options.looks && hostElement.appendChild(lookControl);
    let currentLook = "day";
    function setLook(look) {
      for (let lookName in lookButtons[look] || (look = "day"), currentLook = look, lookTarget.d = 0, lookTarget.n = +("night" === look), lookTarget.t = +("morning" === look), lookButtons) lookButtons[lookName].classList.toggle(cssClasses.on, lookName === look);
      options.onLook && options.onLook(look);
    }
    for (let lookName in lookButtons) lookButtons[lookName].addEventListener("click", () => setLook(lookName));
    let cameraSwayX = 0,
      cameraSwayY = 0,
      targetCameraSwayX = 0,
      targetCameraSwayY = 0,
      pointerX = -1,
      pointerY = -1;
    listen(window, "pointermove", event => {
      let rect = hostElement.getBoundingClientRect();
      rect.width && rect.height && (targetCameraSwayX = (event.clientX - rect.left) / rect.width * 2 - 1, targetCameraSwayY = (event.clientY - rect.top) / rect.height * 2 - 1, pointerX = event.clientX - rect.left, pointerY = event.clientY - rect.top);
    });
    let projectedBird = new THREE.Vector3();
    function getBirdXY() {
      return projectedBird.copy(birdGroup.position), projectedBird.y += 0.045, projectedBird.project(camera), [(projectedBird.x + 1) / 2 * viewportState.w, (1 - projectedBird.y) / 2 * viewportState.h];
    }
    function isPointerOverBird(px, py) {
      if (!birdGroup.visible || px < 0) return !1;
      let [birdX, birdY] = getBirdXY(),
        distance = Math.max(0.5, birdGroup.position.distanceTo(camera.position)),
        hitRadius = Math.max(32, 0.06 * (viewportState.h / (2 * Math.tan(camera.fov / 2 * Math.PI / 180) * distance) * (viewportState.portrait ? viewportState.zoom : 1)) + 6);
      return projectedBird.z < 1 && Math.hypot(birdX - px, birdY - py) < hitRadius;
    }
    let viewport = {
      w: 0,
      h: 0,
      dpr: 0
    };
    function resize(width, height) {
      let resolvedWidth = width || hostElement.clientWidth,
        resolvedHeight = height || hostElement.clientHeight;
      if (!resolvedWidth || !resolvedHeight) return;
      let dpr = width ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      if (resolvedWidth === viewport.w && resolvedHeight === viewport.h && dpr === viewport.dpr) return;
      viewport.w = resolvedWidth, viewport.h = resolvedHeight, viewport.dpr = dpr, renderer.setPixelRatio(dpr), renderer.setSize(resolvedWidth, resolvedHeight, !1), camera.aspect = resolvedWidth / resolvedHeight, camera.fov = 21;
      let previousPortrait = viewportState.portrait;
      viewportState.w = resolvedWidth, viewportState.h = resolvedHeight, updateCameraFraming(), previousPortrait !== viewportState.portrait && void 0 !== selectedPerch && selectedPerch && !width && rebuildTrees(seed);
      let sceneWidth = Math.round(resolvedWidth * dpr * 1),
        sceneHeight = Math.round(resolvedHeight * dpr * 1);
      sceneHeight > 1150 && (sceneWidth = Math.round(1150 * sceneWidth / sceneHeight), sceneHeight = 1150);
      var renderWidth = sceneWidth,
        renderHeight = sceneHeight;
      for (let target of [sceneRenderTarget, skyRenderTarget, foregroundBlurTarget, backgroundBlurTarget, cloudRenderTarget]) target && target.dispose();
      let renderTargetOptions = {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: !0
      };
      sceneRenderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, renderTargetOptions), skyRenderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, renderTargetOptions);
      let blurWidth = Math.max(2, renderWidth >> 1),
        blurHeight = Math.max(2, renderHeight >> 1),
        blurTargetOptions = {
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: !1
        };
      foregroundBlurTarget = new THREE.WebGLRenderTarget(blurWidth, blurHeight, blurTargetOptions), backgroundBlurTarget = new THREE.WebGLRenderTarget(blurWidth, blurHeight, blurTargetOptions), cloudRenderTarget = new THREE.WebGLRenderTarget(blurWidth, blurHeight, blurTargetOptions), dofMaterial.uniforms.uTexel.value.set(1 / sceneWidth, 1 / sceneHeight), dofMaterial.uniforms.uMaxCoC.value = 0.018 * sceneHeight, dofMaterial.uniforms.uBgCap.value = 0.0095 * sceneHeight, cocScale = 0.14 * sceneHeight, dofMaterial.uniforms.uCocScale.value = cocScale, postprocessReady && renderPostprocess(null);
    }
    function updateCameraFraming() {
      let viewportWidth = viewportState.w,
        viewportHeight = viewportState.h;
      viewportState.portrait = viewportWidth / viewportHeight < 1;
      let zoom = viewportState.portrait ? viewportState.zoom : 1,
        aspectRatio = viewportWidth / viewportHeight,
        cloudBlend = Math.min(1, Math.max(0, (16 / 9 - aspectRatio) / (16 / 9 - 1))),
        verticalOffset = viewportState.portrait ? 0 : 0.35 * cloudBlend;
      if (void 0 !== cloudMesh && cloudMesh) {
        let aspectCloseness = Math.min(1, Math.max(0, (1 - aspectRatio) / 0.5)),
          lerp = (from, to, blend) => from + (to - from) * blend;
        cloudMesh.material.uniforms.uDeckFine.value = lerp(1 + 0.8 * cloudBlend, 2, aspectCloseness), cloudMesh.material.uniforms.uShelterReach.value = lerp(0.2 + 0.06 * cloudBlend, 0.18, aspectCloseness), cloudMesh.material.uniforms.uCoverBoost.value = lerp(-0.18 * cloudBlend, 0.06, aspectCloseness), cloudMesh.material.uniforms.uWarmK.value = lerp(1, 1.08, aspectCloseness);
      }
      if (viewportWidth / viewportHeight < 16 / 9) {
        let cropHeight = viewportHeight * zoom,
          cropWidth = 16 * cropHeight / 9,
          cropX = Math.max(0, Math.min(cropWidth - viewportWidth, cropWidth * (viewportState.portrait ? viewportState.cx : 0.5) - viewportWidth / 2)),
          cropY = viewportState.portrait ? cropHeight - viewportHeight : -verticalOffset * viewportHeight;
        camera.setViewOffset(cropWidth, cropHeight, cropX, cropY, viewportWidth, viewportHeight), viewportState.min = cropX / cropWidth * 2 - 1, viewportState.max = (cropX + viewportWidth) / cropWidth * 2 - 1, viewportState.cy = viewportState.portrait ? -1 + 1 / zoom : 2 * verticalOffset;
      } else camera.clearViewOffset(), viewportState.min = -1, viewportState.max = 1, viewportState.cy = 0;
      viewportState.portrait ? setCameraPosition(88.4 * ((viewportState.min + viewportState.max) / 2 + 0.06), (0.66 / zoom + viewportState.cy) * 49.6 + 49, -268) : setCameraPosition(moonPositionArray[0], moonPositionArray[1] + 49.6 * viewportState.cy, moonPositionArray[2]), camera.updateProjectionMatrix();
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
    function setShelters(shelterA, shelterB, shelterC) {
      cloudMesh.material.uniforms.uShelterA.value.set(shelterA[0], shelterA[1], shelterA[2], shelterA[3]), cloudMesh.material.uniforms.uShelterB.value.set(shelterB[0], shelterB[1], shelterB[2], shelterB[3]);
      let defaultShelter = shelterC || [0, 0, 0, 0];
      cloudMesh.material.uniforms.uShelterC.value.set(defaultShelter[0], defaultShelter[1], defaultShelter[2], defaultShelter[3]);
    }
    return renderer.setAnimationLoop(frameTimestamp => {
      if (!inViewport || frameTimestamp - lastFrameTime < ("cross" === birdState || "out" === birdState || "in" === birdState ? 4 : 30)) return;
      lastFrameTime = frameTimestamp;
      let rawDeltaTime = clock.getDelta();
      rawDeltaTime > 2.5 && timeUniform.value > 6 && !reducedMotion && (pauseAnimation(), resumeAnimation());
      let timeStep = Math.min(rawDeltaTime * speedMultiplier, 0.05);
      timeUniform.value += timeStep;
      let simulationTime = timeUniform.value;
      if (windUniform.value = baseWindStrength * (0.62 + 0.28 * Math.sin(0.21 * simulationTime) + 0.1 * Math.sin(0.57 * simulationTime + 1.7)), lookTransition.d !== lookTarget.d || lookTransition.n !== lookTarget.n || lookTransition.t !== lookTarget.t) {
        let blendFactor = 1 - Math.exp(-timeStep * (reducedMotion ? 60 : 2.2));
        for (let lookKey of ["d", "n", "t"]) lookTransition[lookKey] += (lookTarget[lookKey] - lookTransition[lookKey]) * blendFactor, 0.001 > Math.abs(lookTransition[lookKey] - lookTarget[lookKey]) && (lookTransition[lookKey] = lookTarget[lookKey]);
        applyLookUniforms(lookTransition.d, lookTransition.n, lookTransition.t);
      }
      if (1 !== cloudStrengthUniform.value) {
        let cloudEase = cloudStrengthUniform.value + (1 - cloudStrengthUniform.value) * (1 - Math.exp(-timeStep * (reducedMotion ? 60 : 0.9)));
        0.002 > Math.abs(cloudEase - 1) && (cloudEase = 1), cloudStrengthUniform.value = cloudEase;
      }
      animationEnabled && (cloudTimeUniform.value += timeStep), function (deltaTime, time) {
        var motionProgress, currentTime;
        let motion, bones;
        if (!birdReady) return;
        if (reducedMotion) {
          if (!selectedPerch) return;
          "perched" !== birdState && function () {
            if (selectedPerch && birdReady) for (let clone of (perchBird(timeUniform.value, 2), birdClones)) clone.visible = !1;
          }(), getPerchPosition(birdGroup.position), birdGroup.position.y += 0.004, birdGroup.lookAt(getPerchLookAt(flightPosition)), birdGroup.rotateX(-0.3), birdGroup.scale.setScalar(1), perchBlend = 1, applyBirdAnimation(birdActors[0], 1, 0);
          return;
        }
        if ("away" === birdState) {
          if (arrivalDelay && time > arrivalDelay ? startBirdArrival() : time > nextFlightAt && startBirdCrossing(), "away" === birdState) return;
          deltaTime = 0;
        }
        if ("out" === birdState && flightElapsed < departureLift) {
          let liftProgress = (flightElapsed += deltaTime) / departureLift;
          computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, time, windUniform.value), getPerchPosition(birdGroup.position).add(flightOffset);
          let departureBlend = departureSide > 0 ? Math.min(1, liftProgress / 0.55) : 1;
          birdGroup.quaternion.slerpQuaternions(departureStartQuat, departureEndQuat, departureBlend * departureBlend * (3 - 2 * departureBlend)), birdGroup.position.y += 0.004 + (departureSide > 0 ? 0.006 * Math.sin(Math.PI * departureBlend) : 0) - 0.012 * Math.sin(Math.PI * liftProgress), birdGroup.rotateX(0.1 * Math.sin(Math.PI * liftProgress)), foldAmount = 1 - Math.min(1, Math.max(0, (liftProgress - 0.3) / 0.7)), perchBlend = 1, applyBirdAnimation(birdActors[0], foldAmount, 0.23), flightElapsed + deltaTime >= departureLift && departureStartQuat.copy(departureEndQuat);
          return;
        }
        if ("cross" === birdState || "out" === birdState || "in" === birdState) {
          flightElapsed += deltaTime;
          let flightElapsedSinceLift = "out" === birdState ? flightElapsed - departureLift : flightElapsed,
            rawProgress = Math.min(1, flightElapsedSinceLift / flightDuration),
            easedProgress = rawProgress;
          if ("out" === birdState && (easedProgress = (rawProgress < 0.16 ? 0.15 * rawProgress + 0.425 * rawProgress * rawProgress / 0.16 : 0.092 + (rawProgress - 0.16)) / 0.9319999999999999), "in" === birdState) {
            let postLandingOvershoot = rawProgress - 0.7;
            easedProgress = (rawProgress < 0.7 ? rawProgress : 0.7 + postLandingOvershoot - 0.333 * postLandingOvershoot * postLandingOvershoot / 0.3) / 0.9001;
          }
          let arrivalBlend = "in" === birdState ? smoothstep((rawProgress - 0.76) / 0.24) : 0;
          flightPathWobble = Math.min(1, flightElapsedSinceLift / 0.6) * ("cross" === birdState ? 1 : 0.5 * ("out" === birdState)) * (1 - arrivalBlend);
          let isFlight = "cross" === birdState || "out" === birdState;
          landingBounce = isFlight ? Math.min(1, Math.max(0, (flightElapsedSinceLift - ("out" === birdState ? 0.55 : 0.1)) / 0.5)) : 0, foldAmount = 0, frameDelta = deltaTime;
          let arrivalFoldBlend = "in" === birdState ? smoothstep((rawProgress - 0.66) / 0.24) : 0;
          perchBlend = "in" === birdState ? smoothstep((rawProgress - 0.55) / 0.35) : "out" === birdState ? 1 - Math.min(1, flightElapsedSinceLift / 0.45) : 0, arrivalWingFold = arrivalFoldBlend, headTurnAmount = "in" === birdState ? 0.15 + 0.85 * arrivalFoldBlend : "out" === birdState ? 0.15 + 0.85 * (1 - Math.min(1, flightElapsedSinceLift / 0.6)) : 0.15, wingRelaxation = "in" === birdState ? 0.72 + 0.26 * arrivalFoldBlend : "out" === birdState ? 1 - 0.09999999999999998 * landingBounce : 0.9;
          let sampledFlapState = isFlight ? sampleFlapSchedule(flightElapsedSinceLift) : null,
            flapTime = sampledFlapState ? sampledFlapState.beat * landingBounce + flightElapsedSinceLift * flapRate() * (1 - landingBounce) : flightElapsedSinceLift * flapRate() * (1 + 0.07 * Math.sin(1.1 * flightElapsedSinceLift + 0.3) + 0.08 * arrivalFoldBlend);
          for (let clone of (pathTime = "out" === birdState ? 0.23 + flapTime : flapTime, animateBirdAlongPath(birdGroup, birdActors[0], easedProgress, pathTime, sampledFlapState, flightElapsedSinceLift), birdGroup.scale.setScalar(1), birdClones)) clone.scale.setScalar(1);
          if ("in" === birdState && (birdGroup.rotateX(-0.55 * arrivalFoldBlend * 1), arrivalBlend > 0 && (computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, time, windUniform.value), flightPosition.fromArray(selectedPerch.p).add(flightOffset), flightPosition.y += 0.004, birdGroup.position.lerp(flightPosition, arrivalBlend)), tmpQuaternion.copy(birdGroup.quaternion)), "in" !== birdState && (arrivalWingFold = 0), "out" === birdState) {
            let outboundBlend = Math.min(1, flightElapsedSinceLift / 0.45);
            savedBirdQuat.copy(birdGroup.quaternion), birdGroup.quaternion.slerpQuaternions(departureStartQuat, savedBirdQuat, outboundBlend * outboundBlend * (3 - 2 * outboundBlend)), birdGroup.rotateX(-0.3 * outboundBlend * (1 - Math.min(1, flightElapsedSinceLift / 0.7))), computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, time, windUniform.value), birdGroup.position.addScaledVector(flightOffset, 1 - outboundBlend);
          }
          for (let cloneIndex = 0; cloneIndex < birdClones.length; cloneIndex++) {
            let clone = birdClones[cloneIndex],
              cloneOffset = 0.009 * (cloneIndex + 1);
            if (clone.visible = easedProgress > cloneOffset && "cross" === birdState, clone.visible) {
              let cloneTime = flightElapsedSinceLift - cloneOffset * flightDuration;
              animateBirdAlongPath(clone, birdActors[cloneIndex + 1], easedProgress - cloneOffset, pathTime, isFlight ? sampleFlapSchedule(cloneTime) : null, cloneTime);
            }
          }
          let reachedPerch = "in" === birdState && (rawProgress >= 1 || rawProgress > 0.9 && 0.05 > birdGroup.position.distanceTo(flightEnd)),
            distanceRatio = deltaTime > 0 ? birdGroup.position.distanceTo(tmpVecA) / deltaTime : 0;
          tmpVecA.copy(birdGroup.position), (rawProgress >= 1 || reachedPerch) && ("in" === birdState ? (perchBird(timeUniform.value, 2.5 + 2 * Math.random()), lastFlightAt = lastPerchAt = timeUniform.value, setLandingSpring(selectedPerch, timeUniform.value, distanceRatio)) : (hideBird(), departAfterResume && (departAfterResume = !1, arrivalDelay = timeUniform.value + 1.2 + Math.random())));
          return;
        }
        let microMotionProgress = microMotion ? Math.min(1, (time - microMotion.t0) / microMotion.dur) : 0;
        microMotion && "hop" === microMotion.kind && (hopYaw = microMotion.a + (microMotion.b - microMotion.a) * smoothstep(microMotionProgress)), computeWindOffset(flightOffset, selectedPerch.p, selectedPerch.flex, time, windUniform.value), getPerchPosition(birdGroup.position).add(flightOffset), birdGroup.position.y += 0.004;
        {
          let sinceLanding = time - lastFlightAt;
          sinceLanding > 0 && sinceLanding < 1 && (birdGroup.position.y -= 0.004 * Math.sin(17 * sinceLanding) * Math.exp(-(7 * sinceLanding)));
        }
        birdGroup.lookAt(getPerchLookAt(flightPosition).add(flightOffset)), birdGroup.rotateX(-0.3);
        let sincePerch = time - lastPerchAt;
        if (sincePerch >= 0 && sincePerch < 0.4) {
          let settleBlend = smoothstep(sincePerch / 0.4);
          savedBirdQuat.copy(birdGroup.quaternion), birdGroup.quaternion.slerpQuaternions(tmpQuaternion, savedBirdQuat, settleBlend);
        }
        let landSettle = smoothstep(sincePerch / 0.28),
          perchBlendEase = smoothstep((sincePerch - 0.18) / 0.32);
        perchBlend = 1, headTurnAmount = 1 - smoothstep(sincePerch / 0.5), applyBirdAnimation(birdActors[0], perchBlendEase, pathTime, landSettle), time > wingFlutterAt && (targetBodySway = (Math.random() - 0.5) * 1.2, wingFlutterAt = time + 1.4 + 2.8 * Math.random()), bodySway += (targetBodySway - bodySway) * (1 - Math.exp(-(8 * deltaTime))), birdGroup.rotateY(0.04 * bodySway), microMotion ? (motionProgress = microMotionProgress, currentTime = time, motion = microMotion, bones = birdActors[0].bones, "tail" === motion.kind ? bones.tail && rotateBone(bones.tail, axisX, motion.a * Math.sin(motionProgress * Math.PI)) : "shuffle" === motion.kind ? (birdGroup.rotateY(motion.a * Math.sin(2 * motionProgress * Math.PI) * (1 - motionProgress)), birdGroup.position.y -= 0.003 * Math.sin(motionProgress * Math.PI)) : "peer" === motion.kind ? headTurnOffset = motion.a * smoothstep(motionProgress / 0.2) * smoothstep((1 - motionProgress) / 0.25) : "hop" === motion.kind && (birdGroup.position.y += 0.022 * Math.sin(motionProgress * Math.PI), birdGroup.rotateX(-0.22 * Math.sin(motionProgress * Math.PI))), motionProgress >= 1 && ("hop" === motion.kind && (lastFlightAt = currentTime, setLandingSpring(selectedPerch, currentTime, 1)), headTurnOffset = 0, microMotion = null)) : time > nextMicroMotionAt && time > lastFlightAt + 1.2 && time < nextDepartureAt - 0.8 && function (time) {
          let randomVal = Math.random(),
            motionKind = randomVal < 0.32 ? "tail" : randomVal < 0.55 ? "shuffle" : randomVal < 0.82 ? "peer" : selectedPerch.along ? "hop" : "shuffle";
          if (microMotion = {
            kind: motionKind,
            t0: time,
            dur: "tail" === motionKind ? 0.26 : "shuffle" === motionKind ? 0.42 : "peer" === motionKind ? 1.6 : 0.34,
            a: 0,
            b: 0
          }, "hop" === motionKind) {
            let hopDelta = (0.025 + 0.02 * Math.random()) * (hopYaw > 0.01 ? -1 : hopYaw < -0.01 ? 1 : 0.5 > Math.random() ? -1 : 1);
            microMotion.a = hopYaw, microMotion.b = hopYaw + hopDelta;
          } else "peer" === motionKind ? microMotion.a = 0.6 > Math.random() ? 0.26 : -0.2 : "shuffle" === motionKind ? microMotion.a = (Math.random() - 0.5) * 0.3 : microMotion.a = 0.3 + 0.15 * Math.random();
          nextMicroMotionAt = time + microMotion.dur + 2 + 4.5 * Math.random();
        }(time), function (deltaTime) {
          let actor = birdActors[0];
          if (!actor) return;
          let headBone = actor.bones.head;
          if (!headBone) return;
          let headYawTarget = 0,
            headPitchTarget = 0;
          pointerX >= 0 && !viewportState.portrait && (pointerRay.set(pointerX / viewportState.w * 2 - 1, -(pointerY / viewportState.h * 2 - 1), 0.5).unproject(camera).sub(camera.position).normalize(), pointerRay.multiplyScalar(birdGroup.position.distanceTo(camera.position)).add(camera.position), birdGroup.worldToLocal(pointerRay), headBone.getWorldPosition(headWorldPosition), birdGroup.worldToLocal(headWorldPosition), pointerRay.sub(headWorldPosition), headYawTarget = Math.max(-0.3, Math.min(0.3, 0.6 * Math.atan2(pointerRay.x, pointerRay.z)))), headYawTarget += 0.5 * bodySway, headPitchTarget += headTurnOffset;
          let headSmoothing = 1 - Math.exp(-(3.2 * deltaTime));
          headYaw += (headYawTarget - headYaw) * headSmoothing, headPitch += (headPitchTarget - headPitch) * headSmoothing, rotateBone(headBone, axisZ, -(0.85 * headYaw)), headPitch && rotateBone(headBone, axisX, headPitch);
        }(deltaTime), time > nextDepartureAt && departBird();
      }(timeStep, simulationTime), currentFocusDistance += (targetFocusDistance - currentFocusDistance) * (1 - Math.exp(-timeStep * (reducedMotion ? 60 : 3))), dofMaterial.uniforms.uFocus.value = 1 / currentFocusDistance;
      let focusDepth = 1 / focusDistance,
        focusBlend = Math.min(1, Math.max(0, (focusDepth - currentFocusDistance) / (focusDepth - 1 / moonDistance)));
      focusBlend = Math.min(1, Math.max(0, (focusBlend - 0.02) / 0.96)), dofMaterial.uniforms.uFgBlur.value = blurEnabled ? dofMaterial.uniforms.uMaxCoC.value * focusBlend : 0, dofMaterial.uniforms.uBgBlur.value = blurEnabled ? dofMaterial.uniforms.uBgCap.value * (1 - focusBlend) : 0, cameraSwayX += (targetCameraSwayX - cameraSwayX) * (1 - Math.exp(-(3 * timeStep))), cameraSwayY += (targetCameraSwayY - cameraSwayY) * (1 - Math.exp(-(3 * timeStep)));
      let motionEnabled = +!reducedMotion,
        swayX = (0.55 * Math.sin(0.062 * simulationTime) + 0.3 * Math.sin(0.151 * simulationTime + 2.1)) * 0.0022 * motionEnabled - 0.0045 * cameraSwayX * motionEnabled,
        swayY = (0.5 * Math.sin(0.083 * simulationTime + 1.2) + 0.3 * Math.sin(0.19 * simulationTime)) * 0.0018 * motionEnabled - 0.00275 * cameraSwayY * motionEnabled;
      cameraEuler.set(swayY, swayX, 0, "YXZ"), camera.quaternion.copy(baseCameraQuaternion).multiply(leafRotation.setFromEuler(cameraEuler));
      {
        let projectionMatrix = camera.projectionMatrix,
          shelterShift = cloudMesh.material.uniforms.uShelterShift.value;
        projectedBird.set(0, 0, -1).applyQuaternion(savedBirdQuat.copy(leafRotation).invert()).applyMatrix4(projectionMatrix);
        let birdX = projectedBird.x,
          birdY = projectedBird.y;
        projectedBird.set(0, 0, -1).applyMatrix4(projectionMatrix), shelterShift.set((birdX - projectedBird.x) * 0.5, -(0.5 * (birdY - projectedBird.y)));
      }
      gradeMaterial.uniforms.uGrainT.value = reducedMotion ? 0.37 : timeUniform.value % 1, renderPostprocess(null), (3 & frameCounter) == 0 && canvas.classList.toggle(cssClasses.overBird, isPointerOverBird(pointerX, pointerY)), frameCounter >= 2 && !postprocessReady && (pendingTextureLoads <= 0 || performance.now() > textureTimeoutAt) && (postprocessReady = !0, canvas.classList.add(cssClasses.drawn)), frameCounter++;
    }), options.shelters && setShelters(...options.shelters), {
      setLook: setLook,
      setShelters: setShelters,
      dispose: function () {
        for (let [target, type, listener, options] of (renderer.setAnimationLoop(null), eventListeners)) target.removeEventListener(type, listener, options);
        for (let renderTarget of (resizeObserver && resizeObserver.disconnect(), intersectionObserver && intersectionObserver.disconnect(), scene.traverse(object => {
          for (let material of (object.geometry && object.geometry.dispose(), Array.isArray(object.material) ? object.material : object.material ? [object.material] : [])) {
            for (let textureKey in material) {
              let texture = material[textureKey];
              texture && texture.isTexture && texture.dispose();
            }
            material.dispose();
          }
        }), [sceneRenderTarget, foregroundBlurTarget, skyRenderTarget, backgroundBlurTarget, cloudRenderTarget])) renderTarget && renderTarget.dispose();
        renderer.dispose(), canvas.remove(), lookControl.remove(), hostElement.classList.remove(cssClasses.host, cssClasses.night, cssClasses.dusk, cssClasses.morning);
      },
      setSpeed: function (value) {
        speedMultiplier = null == value ? 1 : value;
      },
      setBlur: function (value) {
        blurEnabled = !!value;
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
