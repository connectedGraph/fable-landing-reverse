const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const input = '../fable-hero-engine.formatted.js';
const output = '../fable-hero-engine.semantic-safe.js';
const source = fs.readFileSync(input, 'utf8');
const ast = parser.parse(source, { sourceType: 'script' });

function lineOf(node) { return source.slice(0, node.start).split('\n').length; }
function renameScope(path, mapping) {
  for (const [from, to] of Object.entries(mapping)) {
    if (from === to) continue;
    // Only rename bindings declared by this function. `hasBinding` also sees
    // captured variables from parent scopes; renaming those here would mutate
    // unrelated outer bindings (notably the Three.js module alias).
    if (path.scope.bindings[from]) path.scope.rename(from, to);
  }
}

const treeHelpers = {
  e: 'createSeededRandom', t: 'addVec3', a: 'scaleVec3', o: 'crossVec3',
  r: 'dotVec3', n: 'normalizeVec3', i: 'lerp', l: 'clamp', s: 'worldUp',
};
const treeGenerator = {
  h: 'seed', u: 'overrides', c: 'treeOptions', d: 'random', f: 'geometryBuffers',
  m: 'leafAnchors', p: 'rootDirection',
};
const appendBranch = {
  h: 'appendBranch', u: 'random', c: 'buffers', d: 'anchors', f: 'start', m: 'direction',
  p: 'length', v: 'radius', g: 'depth', y: 'flexStart', w: 'options', b: 'isTwig',
  x: 'segmentCount', M: 'segmentLength', k: 'segmentCenters', S: 'segmentDirections',
  D: 'branchDirection', C: 'currentCenter', z: 'sideAxis', A: 'bendAmplitude',
  B: 'frameNormal', I: 'frameSamples', F: 'isOuterBranch', T: 'tipRadius', L: 'radiusBySegment',
  R: 'depthRatio', N: 'colorVariant', P: 'colorVariation', W: 'branchColor', G: 'radialSegments',
  V: 'ringStartIndices', E: 'ringPhase', O: 'ringRipple', q: 'ringLobes', U: 'ringRotation',
  _: 'ringAsymmetry', H: 'ringFrequency', j: 'radialWarp', K: 'radialNoise', X: 'ringNoisePhase',
  Q: 'pinchSegment', Y: 'radiusAt', Z: 'frameAt', $: 'centerAt',
};

// Main engine scope: names here are restricted to high-confidence resources,
// scenes, look state, and the render pipeline. Remaining locals are handled in
// later passes once their complete consumers have been inspected.
const mainHighConfidence = {
  e: 'hostElement', l: 'options', s: 'renderer', h: 'leafAtlasCanvas', u: 'leafAtlasContext', c: 'leafAtlasKinds', d: 'atlasTextureTemp', f: 'leafShapeCanvas', m: 'leafShapeContext', p: 'shapeTextureTemp', v: 'assetUrl', g: 'eventListeners', y: 'listen',
  w: 'cssClasses', b: 'canvas', x: 'reducedMotion', M: 'scene', k: 'camera',
  S: 'cameraTarget', D: 'toColor', C: 'sunDirection', z: 'zenithColor', A: 'horizonColor',
  B: 'sunColor', I: 'sunGlowColor', F: 'barkVertexShader', T: 'timeUniform',
  L: 'nightUniform', R: 'duskUniform', N: 'morningUniform', P: 'duskMidColor', W: 'duskFarColor',
  G: 'baseWindStrength', V: 'windUniform', E: 'lagUniform', O: 'landingUniform', q: 'landingSpringUniform',
  U: 'tmpVecA', _: 'tmpVecB', H: 'tmpVecC', j: 'tmpQuaternion', K: 'setLandingSpring',
  X: 'skyColorShader', Q: 'moonPositionArray', Y: 'moonPosition', Z: 'skyMesh', $: 'moonLightDirection',
  J: 'moonMesh', ee: 'cloudStrengthUniform', et: 'cloudTimeUniform', ea: 'cloudMesh',
  eo: 'skyScene', er: 'cloudScene', en: 'sunLight', ei: 'hemisphereLight', el: 'nightSunDirection',
  es: 'morningLook', eh: 'nightLook', eu: 'duskLook', ec: 'dayLook', ed: 'lookTransition',
  ef: 'lookTarget', em: 'blendColor', ep: 'blendScalar', ev: 'applyLookUniforms', eg: 'applyLeafLook',
  ey: 'treePresets', ew: 'treeDefaults', eb: 'treeSeedOffset', ex: 'treeCache', eM: 'generateSceneTree',
  ek: 'hasUsablePerch', eS: 'selectBirdPerch', eD: 'textureLoader', eC: 'pendingTextureLoads',
  ez: 'onTextureLoaded', eA: 'textureTimeoutAt', eB: 'barkDiffuseTexture', eI: 'barkNormalTexture',
  eF: 'barkMaterial', eT: 'leafAtlasTexture', eL: 'leafShapeTexture', eR: 'leafMaterial',
  eN: 'treeMesh', eP: 'leafMesh', eW: 'sparseLeafMesh', eG: 'sparseLeafMaterial', eV: 'selectedPerch',
  eE: 'viewportState', eO: 'leafMatrix', eq: 'leafBasis', eU: 'leafUp', e_: 'leafForward', eH: 'leafTangent', ej: 'leafRotation',
  eK: 'rebuildTrees', eX: 'birdGroup', eQ: 'birdClones', eY: 'birdCloneOpacity', eZ: 'birdReady', e$: 'birdAnimations',
  eJ: 'birdActors', e0: 'birdMaterials', e1: 'birdTextureLoader', e2: 'loadBirdTexture', e3: 'birdTextures', e5: 'setupBirdActor', e4: 'birdRootOffset',
  e6: 'wingRelaxation', e8: 'boneRotation', e9: 'axisX', e7: 'axisY', te: 'axisZ', tt: 'boneNames', ta: 'perchBlend', to: 'boneTempRotation', tr: 'rotateBone',
  tn: 'applyBirdAnimation', tl: 'computeWindOffset', ti: 'headTurnAmount', ts: 'birdState', th: 'flightElapsed', tu: 'flightDuration', tc: 'nextDepartureAt',
  td: 'nextFlightAt', tf: 'wingFlutterAt', tm: 'bodySway', tp: 'targetBodySway', tv: 'foldAmount', tg: 'flapRate', ty: 'landingBounce', tw: 'flapScheduleBeats',
  tb: 'wingBeatPhase', tx: 'flapSchedule', tM: 'buildFlapSchedule', tk: 'createFlapState', tS: 'flapStateA', tD: 'flapStateB', tC: 'sampleFlapSchedule',
  tz: 'flightPathPhase', tA: 'flightPathScale', tB: 'flightPathWobble', tI: 'flightStart', tF: 'flightControl', tT: 'flightEnd', tL: 'flightPosition',
  tR: 'flightLookAt', tN: 'flightOffset', tP: 'smoothstep', tW: 'hideBird', tG: 'startBirdCrossing', tV: 'perchBird', tj: 'departBird', tE: 'departureLift', tO: 'departureSide',
  tq: 'departureStartQuat', tU: 'departureEndQuat', t_: 'savedBirdQuat', tH: 'flightLookObject', tK: 'pathLengthTable', tX: 'pathLength', tQ: 'pathPointA', tY: 'pathPointB',
  tZ: 'sampleBezierPath', t$: 'buildPathLengthTable', tJ: 'arrivalQuat', t0: 'arrivalDelay', t1: 'lastPerchAt', t2: 'pathTime', t3: 'lastFlightAt',
  t5: 'screenToWorld', t4: 'startBirdArrival', t6: 'sampleFlightPath', t8: 'frameDelta', t9: 'birdRoll', t7: 'arrivalWingFold', ae: 'animateBirdAlongPath',
  at: 'microMotion', aa: 'nextMicroMotionAt', ao: 'headTurnOffset', ar: 'hopYaw', an: 'perchTangent', ai: 'getPerchPosition', al: 'getPerchLookAt',
  as: 'headYaw', ah: 'headPitch', au: 'inverseBirdQuat', ac: 'pointerRay', ad: 'headWorldPosition', af: 'pagePaused', am: 'departAfterResume', ap: 'pauseAnimation', av: 'resumeAnimation',
  ag: 'inViewport', ay: 'intersectionObserver', aw: 'wheelDelta', ab: 'sceneRenderTarget', ax: 'skyRenderTarget', aM: 'foregroundBlurTarget', ak: 'backgroundBlurTarget', aS: 'cloudRenderTarget',
  aD: 'postprocessReady', aC: 'cocScale', az: 'cloudCompositeMaterial', aA: 'postprocessShader', aB: 'blurKernel', aI: 'addKernelSample', aF: 'dofMaterial', aT: 'gradeMaterial',
  aL: 'postScene', aR: 'postCamera', aN: 'postQuad', aP: 'renderPostprocess', aW: 'focusDistance', aG: 'moonDistance', aV: 'setCameraPosition', aE: 'currentFocusDistance', aO: 'targetFocusDistance',
  aq: 'isPortrait', aU: 'seedPool', a_: 'seed', aH: 'animationEnabled', aj: 'speedMultiplier', aK: 'blurEnabled', aX: 'lookControl', aQ: 'lookButtons', aY: 'currentLook', aZ: 'setLook',
  a$: 'cameraSwayX', aJ: 'cameraSwayY', a0: 'targetCameraSwayX', a1: 'targetCameraSwayY', a2: 'pointerX', a3: 'pointerY', a5: 'projectedBird', a4: 'getBirdXY', a6: 'isPointerOverBird',
  a8: 'viewport', a9: 'resize', a7: 'updateCameraFraming', oe: 'resizeObserver', ot: 'clock', oa: 'baseCameraQuaternion', oo: 'cameraEuler', or: 'frameCounter', on: 'lastFrameTime', oi: 'setShelters',
};

const functionParameters = {
  439: { e: 'perch', t: 'landingTime', a: 'weightScale' },
  954: { e: 'targetColor', t: 'morningColor', a: 'duskColor', o: 'nightColor', r: 'dayColor', n: 'duskWeight', i: 'nightWeight', l: 'morningWeight' },
  962: { e: 'morningValue', t: 'duskValue', a: 'nightValue', o: 'dayValue', r: 'duskWeight', n: 'nightWeight', i: 'morningWeight' },
  963: { t: 'duskAmount', a: 'nightAmount', o: 'morningAmount' },
  990: { e: 'duskAmount', t: 'nightAmount', a: 'morningAmount' },
  1046: { e: 'preset', t: 'presetIndex', a: 'seed', o: 'scale', n: 'leafDensityMultiplier' },
  1059: { e: 'treeParts' },
  1074: { e: 'treeParts' },
  1474: { e: 'seed' },
  1478: { e: 'seed' },
  1479: { e: 'seed' },
  1546: { e: 'treeParts' },
  1761: { e: 'anchors', t: 'seed' },
  1840: { e: 'birdRoot', t: 'opacity' },
  1877: { e: 'birdRoot' },
  1951: { e: 'birdRoot' },
  2030: { e: 'sourceRoot' },
  2034: { e: 'sourceNode', t: 'cloneNode', a: 'visit' },
  2072: { e: 'bone', t: 'axis', a: 'angle' },
  2101: { n: 'phase', i: 'primaryWave', l: 'secondaryWave', s: 'tertiaryWave', h: 'windAmplitude', u: 'sway', c: 'landingElapsed', d: 'landingDeltaX', f: 'landingDeltaY', m: 'landingDeltaZ', p: 'landingDistance', v: 'landingFalloff', g: 'springParams', y: 'springOffset' },
  2211: { e: 'time', t: 'microMotionDelay' },
  2073: { e: 'actor', t: 'perchWeight', a: 'flapTime', o: 'foldWeight', r: 'combinedPerchWeight', n: 'bones', i: 'flutterNoise', l: 'relaxationAmount' },
  1865: { n: 'phase', i: 'primaryWave', l: 'secondaryWave', s: 'tertiaryWave', h: 'windAmplitude', u: 'sway', c: 'landingElapsed', d: 'landingDeltaX', f: 'landingDeltaY', m: 'landingDeltaZ', p: 'landingDistance', v: 'landingFalloff', g: 'springParams', y: 'springOffset' },
  2132: { e: 'duration' },
  2146: { e: 'time', t: 'state' },
  2259: { e: 'out', t: 'time' },
  2279: { e: 'out', t: 'x', a: 'y', o: 'distance' },
  2318: { e: 'out', t: 'time', a: 'verticalOffset' },
  2342: { e: 'actor', t: 'birdActor', a: 'pathProgress', o: 'pathTime', r: 'flapState', n: 'elapsed' },
  2410: { e: 'out' },
  2413: { e: 'out' },
  2632: { e: 'target' },
  2671: { e: 'x', t: 'y', a: 'z' },
  2711: { e: 'look' },
  2746: { e: 'pointerX', t: 'pointerY' },
  2757: { t: 'width', o: 'height' },
  2842: { e: 'shelterA', t: 'shelterB', a: 'shelterC' },
};

const localMappings = {
  435: { o: 'flex', r: 'weightScale' },
  1046: { i: 'treeConfig', l: 'scaleExponent' },
  1059: { t: 'cameraSlope', a: 'perch', o: 'depth', r: 'screenX', n: 'screenY', i: 'minScreenY' },
  10: { e: 'seed', t: 'state' },
  12: { e: 'mixedValue' },
  18: { e: 'left', t: 'right' },
  19: { e: 'vector', t: 'scalar' },
  20: { e: 'left', t: 'right' },
  21: { e: 'left', t: 'right' },
  22: { e: 'vector', t: 'length' },
  26: { e: 'start', t: 'end', a: 'amount' },
  27: { e: 'value', t: 'min', a: 'max' },
  61: { e: 'position', t: 'normal', a: 'color', o: 'flex', r: 'uv' },
  71: { e: 'indexA', t: 'indexB', a: 'indexC' },
  1474: { e: 'seed', t: 'treeData', o: 'treeVertexCount', r: 'treeIndexCount', n: 'positions', i: 'normals', l: 'colors', s: 'flexValues', h: 'uvs', u: 'indices', c: 'vertexOffset', d: 'indexOffset', f: 'anchors', m: 'selectedPerch' },
  1478: { e: 'seed', t: 'treeParts', a: 'cachedAnchorCount', o: 'totalVertexCount', r: 'totalIndexCount', n: 'positions', i: 'normals', l: 'colors', s: 'flexValues', h: 'uvs', u: 'indices', c: 'vertexOffset', d: 'indexOffset', f: 'anchors', m: 'selectedPerch' },
  1479: { e: 'seed', t: 'generatedParts' },
  1480: { t: 'preset', a: 'presetIndex' },
  1546: { e: 'treeParts', t: 'bestSelection', a: 'bestCx', o: 'bestZoom', r: 'zoom', n: 'cx', i: 'selection' },
  1591: { e: 'leafPlane', t: 'positionAttribute', o: 'uvAttribute', r: 'positionArray', n: 'normalArray', i: 'uvArray', l: 'indexArray', s: 'planeVertexCount', h: 'leafGeometry', u: 'positionBuffer', c: 'normalBuffer', d: 'uvBuffer', f: 'indexBuffer' },
  1761: { e: 'anchors', t: 'seed', o: 'randomSeed', r: 'random', n: 'sparseAnchors', i: 'selectionProbability', l: 'sparseCount', s: 'sparseGeometry', h: 'sparsePlane', u: 'instanceMatrices', c: 'instanceColors', d: 'instanceWind', f: 'instanceUvCells', m: 'atlasCells' },
  1827: { e: 'textureUrl', t: 'isColorTexture', o: 'texture' },
  1840: { o: 'mixer', r: 'flapAction', n: 'perchAction', i: 'foldAction', l: 'boneState' },
  1841: { e: 'meshNode' },
  1877: { e: 'birdRoot', t: 'boneState', o: 'boneName' },
  1895: { e: 'loadedGltf', t: 'sceneRoot', o: 'tempVertex', r: 'birdPivot', n: 'adjustedVertex', i: 'findAnimation' },
  1900: { t: 'animationKeyword' },
  1911: { e: 'meshNode', t: 'positionAttribute', i: 'skinIndexAttribute', l: 'skinWeightAttribute', s: 'boneNameList' },
  1074: { t: 'bestPerch', a: 'bestScore', o: 'selectedPass', r: 'cameraSlope', n: 'normalizePerch', i: 'tryPass' },
  1079: { e: 'candidate', t: 'tangent', a: 'tangentY', o: 'normalX', r: 'normalY', n: 'normalZ', i: 'normalLength', l: 'perchOffset' },
  1091: { o: 'passIndex', i: 'isRootPass', l: 'isFallbackPass', s: 'minimumRadius' },
  1209: { e: 'leafContext', t: 'cellX', a: 'cellY', o: 'leafKind', r: 'leafCenterX', n: 'leafBaseY', i: 'leafTopY', l: 'leafHeight', s: 'leafScale', h: 'leafWidthAt', u: 'pointCount', c: 'phaseJitter', d: 'skew', f: 'randomProfile', m: 'profileA', p: 'profileB', v: 'phaseA', g: 'phaseB', y: 'sampleProfile' },
  1951: { e: 'sourceRoot', t: 'skeletons', o: 'meshMatrix', r: 'inverseMatrix', n: 'bonePosition', i: 'furthestVertex', l: 'vertexPosition' },
  2030: { e: 'sourceRoot', t: 'cloneMap', a: 'reverseCloneMap', o: 'cloneRoot', r: 'cloneTree' },
  2034: { e: 'sourceNode', t: 'cloneNode', a: 'visit' },
  2318: { e: 'out', t: 'time', a: 'flapState' },
  2322: { e: 'normalizedTime', t: 'lowerIndex', a: 'upperIndex', o: 'segmentSpan' },
  2342: { i: 'clampedProgress', l: 'sampledFlapState', s: 'rollAngle', h: 'flapLift', u: 'wrappedPathTime', c: 'animationWeight', d: 'headRollWeight', f: 'wingFoldRemaining' },
  2380: { e: 'birdActor', t: 'flapPhase', a: 'wingWeight', o: 'bones', r: 'leftWing', n: 'rightWing', i: 'wingCosine', l: 'downstroke', s: 'wingRoll', h: 'wingPitch' },
  2489: { e: 'sampleCount', t: 'radius', a: 'angleOffset', o: 'sampleIndex', r: 'angle', n: 'offsetX', i: 'offsetY' },
  2132: { e: 'duration', t: 'scheduleTime', a: 'beatCursor' },
  2146: { e: 'time', a: 'segment', o: 'segmentElapsed', r: 'isFlapping', n: 'phaseProgress' },
  2177: { e: 'flightWidth', t: 'depthOffset', a: 'flightDepth', o: 'mapHeight', r: 'shelter', n: 'shelterTop', i: 'hasShelterGap', l: 'startHeight', s: 'endHeight', h: 'controlHeight', u: 'startY', c: 'endY', d: 'halfViewWidth', f: 'viewWidth', m: 'viewCenterX', p: 'flightSpan', v: 'depthDirection' },
  2230: { e: 'exitDepth', t: 'negativeDepth', a: 'exitX' },
  2259: { e: 'out', t: 'time', a: 'inverseTime' },
  2267: { e: 'distanceAccumulated', t: 'sampleIndex' },
  2291: {},
  2793: { e: 'viewportWidth', t: 'viewportHeight', a: 'zoom', o: 'aspectRatio', r: 'cropFactor', n: 'verticalOffset', i: 'cloudBlend' },
  2803: { e: 'from', t: 'to', a: 'blend' },
  2842: { o: 'defaultShelter' },
  2849: { e: 'frameTimestamp', t: 'rawDeltaTime', a: 'timeStep', o: 'simulationTime' },
  2364: { n: 'hitRadius' },
  2871: { e: 'deltaTime', t: 'currentTime', a: 'progress', o: 'pathTime', r: 'flapState', n: 'pathDistance' },
  3020: { e: 'motionElapsed' },
  3054: { e: 'deltaTime' },
  2671: { e: 'x', t: 'y', a: 'z', o: 'verticalFov' },
  2746: { a: 'ndcX', o: 'ndcY', r: 'distance' },
  2757: { r: 'resolvedWidth', n: 'resolvedHeight', i: 'dpr', l: 'previousPortrait', h: 'targetWidth', u: 'targetHeight', c: 'sceneTargetWidth', d: 'sceneTargetHeight', f: 'renderTargetOptions', m: 'blurWidth', p: 'blurHeight', v: 'blurTargetOptions' },
};

const blockMappings = {
  87: { o: 'segmentRatio', r: 'wobbleScale', l: 'jitterOffset' },
  101: { i: 'segmentDirection', l: 'projectedSide' },
  132: { o: 'frameSample', r: 'radiusRatio', n: 'flexValue', l: 'normalizedFlex', s: 'ringScale', h: 'isPinch', d: 'ringDiameter', f: 'offsetX', m: 'offsetY' },
  144: { v: 'vertexPosition', y: 'vertexNormal', w: 'vertexColor', b: 'vertexFlex', x: 'vertexUv' },
  165: { e: 'childIndex' },
  172: { e: 'childDirection', o: 'childOrigin', r: 'childRadius' },
  178: { e: 'leafAnchor', o: 'leafDirection', r: 'leafRoll', n: 'leafSize' },
  183: { n: 'anchorDirection', i: 'anchorTangent' },
  195: { e: 'branchOrigin', o: 'branchDirection', r: 'branchLength', n: 'branchRadius' },
  202: { e: 'childTree' },
  204: { a: 'anchor', o: 'anchorIndex' },
  212: { e: 'leafPoint', o: 'leafCenter', r: 'leafNormal', i: 'leafTangent', l: 'leafSize', s: 'leafFlex' },
  222: { e: 'anchorPoint', o: 'anchorIndex' },
  228: { s: 'perch', f: 'perchIndex', m: 'perchPosition', v: 'perchFlex', b: 'perchAlong', x: 'perchRadius', M: 'perchTangent', k: 'perchDroop' },
  266: { o: 'childOrigin', r: 'childDirection', n: 'childLength', s: 'childRadius', h: 'childDepth', c: 'childFlex', f: 'childOptions' },
  273: { r: 'childBranch', n: 'childIndex' },
  277: { s: 'branchPerch', h: 'perchIndex', u: 'perchPosition', f: 'perchFlex' },
  2845: { o: 'defaultShelter' },
  2860: { e: 'lookBlend' },
  2866: { e: 'cloudBlend' },
  2871: { a: 'progress', o: 'pathTime', r: 'flapState', n: 'pathDistance' },
  2894: { a: 'departureProgress', o: 'departureBlend' },
  2908: { a: 'elapsedProgress', o: 'normalizedProgress', r: 'pathProgress', n: 'arrivalBlend', i: 'isFlight', l: 'wingFold', s: 'sampledFlapState', h: 'flapTime', u: 'reachedPerch', c: 'distanceRatio' },
  2917: { e: 'inboundProgress' },
  2953: { e: 'outboundBlend' },
  2961: { e: 'cloneIndex', t: 'clone', o: 'cloneOffset' },
  2964: { n: 'cloneTime' },
  2978: { i: 'microMotionProgress' },
  2983: { e: 'landingBounceTime' },
  2989: { e: 'arrivalTurnProgress' },
  2993: { s: 'tailMotion', h: 'hopMotion' },
  3020: { e: 'microMotionProgress', t: 'microMotionStart', a: 'microMotion' },
  3041: { e: 'randomValue', t: 'motionKind', a: 'motionDelta' },
  3054: { e: 'headTurnTarget', t: 'headBone', a: 'headOffset', o: 'headYaw', r: 'headPitch', n: 'headSmoothing' },
  3094: { e: 'cameraRay', t: 'headPosition', a: 'headTurnX', o: 'headTurnY' },
  3119: { a: 'cameraSmoothing' },
};

traverse(ast, {
  Function(path) {
    const line = lineOf(path.node);
    if (line === 9) renameScope(path, treeHelpers);
    else if (line === 30) renameScope(path, treeGenerator);
    else if (line === 77) renameScope(path, appendBranch);
    else if (line === 345) renameScope(path, mainHighConfidence);
    // Fine-grained locals are intentionally left untouched in the safe build;
    // broad renames can collide with nested bindings in the minified closure.
  },
});

traverse(ast, {
  BlockStatement() {},
});

// Last-mile readability pass. At this point all high-confidence names above
// have already been applied. Remaining one-letter bindings are minifier locals
// in small loops/callbacks; give them conservative role-based names while
// staying strictly inside their declaring scope.
function residualBase(binding) {
  const node = binding.path.node;
  const parent = binding.path.parentPath;
  const grand = parent?.parentPath;
  if (binding.kind === 'param') {
    if (parent?.isFunction() && parent.node.params?.length > 1) return 'input';
    return 'value';
  }
  if (parent?.isVariableDeclarator()) {
    const init = parent.node.init;
    if (grand && (grand.isForStatement() || grand.isForOfStatement() || grand.isForInStatement())) return 'loopIndex';
    if (init?.type === 'ArrayExpression') return 'items';
    if (init?.type === 'ObjectExpression') return 'state';
    if (init?.type === 'NewExpression') {
      const callee = init.callee?.property?.name || init.callee?.name || '';
      if (/Vector|Quaternion|Euler|Matrix|Color|Plane|Geometry|Camera|Scene|Group|Bone|Skeleton|Texture|Material|Target/.test(callee)) return 'tempObject';
      return 'object';
    }
    if (init?.type === 'FunctionExpression' || init?.type === 'ArrowFunctionExpression') return 'helper';
    if (init?.type === 'NumericLiteral' || init?.type === 'UnaryExpression' || init?.type === 'BinaryExpression' || init?.type === 'CallExpression') return 'numericValue';
  }
  if (grand && (grand.isForStatement() || grand.isForOfStatement() || grand.isForInStatement())) return 'loopIndex';
  return 'value';
}
function renameResiduals(path) {
  const used = new Set(Object.keys(path.scope.bindings));
  for (const binding of Object.values(path.scope.bindings)) {
    const oldName = binding.identifier.name;
    if (!/^[A-Za-z_$]$/.test(oldName)) continue;
    let base = residualBase(binding);
    let next = base;
    let suffix = 2;
    while (used.has(next)) next = `${base}${suffix++}`;
    used.add(next);
    path.scope.rename(oldName, next);
  }
}
// Do not run a blanket residual rename across every nested block. A generated
// name can collide with a binding in an enclosing scope and trigger JavaScript
// TDZ errors (for example `let selectedPerch = ...` inside rebuildTrees).
// Unmapped locals intentionally retain their original short names until they
// can be renamed with an explicit, scope-aware mapping.

// The module wrapper owns the tree-generator closure binding. It is outside
// the createFableHero function, so handle it at the wrapper scope explicitly.
traverse(ast, {
  Function(path) {
    if (lineOf(path.node) === 4) renameScope(path, {
      e: 'runtimeModule',
      t: 'webglModule',
      a: 'THREE',
      o: 'gltfModule',
      r: 'treeGenerator',
      n: 'desktopSeeds',
      i: 'mobileSeeds',
    });
  },
});

const result = generate(ast, { comments: true, compact: false, jsescOption: { minimal: true } }).code + '\n';
fs.writeFileSync(output, result, 'utf8');
console.log(`wrote ${output}`);

