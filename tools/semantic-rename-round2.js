// Round-2 semantic rename for fable-hero-engine.semantic.js (the safe build).
// Renames the ~800 remaining single-letter bindings left by round 1.
//
// Mechanism:
//  - Collect every single-letter binding from every scope (babel scope.bindings,
//    which includes destructured params/declarations).
//  - Key = "declLine:letter". Uniqueness verified against inventory; the few
//    collisions (var vs param / nested fn params on one line) are resolved by
//    renaming the DEEPER scope first (depth-sorted), so the deeper binding wins
//    the key; the losing shallow bindings are handled by an explicit Pass B.
//  - Every rename goes through babel scope.rename on a binding DECLARED in that
//    exact scope -> never touches outer bindings via a shadowed letter.
//
// Verification afterwards: node --check, AST structural equivalence (names
// ignored), 5-seed tree regression, and a browser render diff vs round-1 build.
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const input = 'C:/Users/18086/Desktop/个人项目/fable-landing-reverse/extracted/fable-hero-engine.semantic.js';
const output = 'C:/tmp/fable-hero-reverse/fable-hero-engine.semantic-round2.js';
const source = fs.readFileSync(input, 'utf8');
const ast = parser.parse(source, { sourceType: 'script' });

function lineOf(node) { return source.slice(0, node.start).split('\n').length; }

// ---- tree-generator closure (vector helpers + appendBranch internals) ----
const tree = {
  8: { e: 'seed' }, 9: { t: 'state' }, 12: { e: 'mixedValue' },
  56: { e: 'position', t: 'normal', a: 'color', o: 'flex', r: 'uv' },
  61: { e: 'indexA', t: 'indexB', a: 'indexC' },
  16: { e: 'left', t: 'right' }, 17: { e: 'vector', t: 'scalar' },
  18: { e: 'left', t: 'right' }, 19: { e: 'left', t: 'right' },
  20: { e: 'vector' }, 21: { t: 'length' }, 24: { e: 'start', t: 'end', a: 'amount' },
  25: { e: 'value', t: 'min', a: 'max' },
  58: { t: 'component' },
  77: { e: 'segmentIndex' }, 78: { o: 'segmentRatio' }, 79: { r: 'wobbleScale' }, 80: { l: 'jitterOffset' },
  87: { e: 'segmentIndex' }, 88: { i: 'segmentDirection' }, 90: { l: 'projectedSide' },
  100: { e: 'segmentIndex' },
  118: { e: 'segmentIndex' }, 120: { o: 'frameSample' }, 121: { r: 'segmentRatio' },
  122: { n: 'flexValue' }, 123: { l: 'normalizedFlex' }, 124: { s: 'ringScale' },
  125: { h: 'isPinch' }, 127: { d: 'ringCircumference' }, 128: { f: 'firstRadius' },
  129: { m: 'firstWobble' }, 130: { p: 'radialIndex' }, 131: { v: 'isSeam' },
  132: { y: 'angle' }, 133: { w: 'radialDir' }, 134: { b: 'lobePattern' },
  135: { x: 'vertexRadius' }, 136: { M: 'wobble' }, 138: { S: 'vertexPos' },
  139: { D: 'radialWarpFactor' }, 140: { C: 'depthFade' }, 141: { z: 'brightness' },
  142: { A: 'vertexColor' }, 144: { e: 'outerFade' },
  150: { e: 'segmentIndex', t: 'radialIndex' }, 151: { a: 'quadA' }, 152: { o: 'quadB' },
  153: { r: 'quadC' }, 154: { n: 'quadD' },
  158: { e: 'tipFrame' }, 159: { o: 'tipCenter' }, 160: { r: 'tipVertexIndex' }, 161: { e: 'radialIndex' },
  164: { e: 'rootFrame' }, 165: { o: 'rootNormal' }, 166: { r: 'rootVertexIndex' },
  167: { n: 'rootIndexOffset' }, 168: { r: 'radialIndex' }, 169: { n: 'angle' }, 170: { i: 'radialDir' },
  173: { e: 'radialIndex' }, 174: { t: 'nextRadial' },
  178: { e: 'progressT' }, 179: { e: 'progressT' }, 180: { e: 'progressT' },
  181: { o: 'scaledIndex' }, 182: { r: 'lowerIndex' }, 183: { n: 'frac' },
  188: { e: 'perchCount' }, 189: { t: 'perchIndex' }, 190: { a: 'perchT' }, 191: { o: 'perchFrame' },
  203: { e: 'branchCount' }, 204: { o: 'branchIndex' }, 205: { e: 'branchT' },
  206: { o: 'branchAngle' }, 207: { r: 'branchFrame' }, 208: { i: 'branchRadialDir' },
  209: { l: 'branchTiltAngle' }, 210: { s: 'branchDir' },
  215: { e: 'childCount' }, 216: { o: 'childAngleAccum' }, 217: { r: 'childIndex' },
  218: { s: 'childT' }, 220: { f: 'childFrame' }, 221: { m: 'childRadialDir' },
  222: { v: 'childTilt' }, 223: { b: 'childDir' }, 224: { x: 'childLength' },
  225: { M: 'childRadius' }, 226: { k: 'childOrigin' },
  230: { e: 'twigCount' }, 231: { r: 'twigIndex' }, 232: { e: 'twigT' }, 234: { r: 'twigFrame' },
  235: { s: 'twigRadialDir' }, 236: { f: 'twigTiltAngle' }, 237: { m: 'twigDir' }, 238: { v: 'twigLength' },
  244: { o: 'leafRandom' }, 245: { r: 'isOuterLeafZone' }, 246: { n: 'leafDensity' },
  247: { s: 'leafStartT' }, 248: { h: 'leafCount' }, 249: { c: 'leafAngleAccum' },
  250: { e: 'leafIndex' }, 251: { r: 'leafT' }, 253: { n: 'leavesPerPoint' },
  254: { e: 'leafSubIndex' }, 255: { s: 'leafOffsetT' }, 256: { h: 'leafFrame' },
  257: { u: 'leafAngle' }, 258: { f: 'leafRadialDir' },
  274: { f: 'tipFrame' },
  290: { v: 'maxFlex' }, 291: { e: 'flexItem' }, 292: { e: 'anchorItem' },
  293: { g: 'normalizedFlex' }, 294: { e: 'flexIndex' }, 295: { e: 'anchorItem' },
  296: { e: 'perchItem' }, 297: { y: 'vertexCount' }, 298: { w: 'indexArrayType' },
  299: { b: 'boundsCenter' }, 300: { x: 'boundsRadius' },
};

// ---- createFableHero helpers, look blending, leaf atlas ----
const helpers = {
  335: { e: 'url' },
  337: { e: 'target', t: 'type', a: 'listener', o: 'options' },
  364: { t: 'error' }, 372: { e: 'hex' },
  435: { e: 'perch', t: 'landingTime', a: 'weightScale' }, 436: { o: 'flex' }, 437: { r: 'weightClamp' },
  1014: { e: 'targetColor', t: 'morningColor', a: 'duskColor', o: 'nightColor', r: 'dayColor', n: 'duskWeight', i: 'nightWeight', l: 'morningWeight' },
  1015: { s: 'dayWeight' },
  1018: { e: 'morningValue', t: 'duskValue', a: 'nightValue', o: 'dayValue', r: 'duskWeight', n: 'nightWeight', i: 'morningWeight' },
  1019: { t: 'duskAmount', a: 'nightAmount', o: 'morningAmount' },
  1022: { e: 'duskAmount', t: 'nightAmount', a: 'morningAmount' }, 1023: { o: 'material' },
  1067: { e: 'preset', t: 'presetIndex', a: 'seed', o: 'scale', n: 'leafDensityMultiplier' },
  1068: { i: 'treeConfig' }, 1070: { l: 'scaleExponent' },
  1071: { e: 'childDepth', t: 'depthIndex' },
  1183: { e: 'material' },
  1186: { e: 'context', t: 'cellX', a: 'cellY', o: 'leafKind' },
  1187: { r: 'leafCenterX' }, 1188: { n: 'leafBaseY' }, 1189: { i: 'leafTopY' },
  1190: { l: 'leafHeight' }, 1191: { s: 'leafScale' }, 1192: { h: 'leafWidthAt', e: 'progressT' },
  1193: { u: 'pointCount' }, 1194: { c: 'phaseJitter' }, 1195: { d: 'skew' },
  1196: { f: 'randomProfile' }, 1199: { m: 'profileA' }, 1200: { p: 'profileB' },
  1201: { v: 'phaseA' }, 1202: { g: 'phaseB' }, 1203: { y: 'sampleProfile', e: 'profileIndex', t: 'phaseIndex', a: 'profile' },
  1204: { o: 'pointIndex' }, 1205: { r: 'wrappedIndex' }, 1206: { n: 'edgeFade' },
  1209: { w: 'points' }, 1210: { e: 'pointIndex' }, 1211: { t: 'progressT' }, 1212: { a: 'skewOffset' },
  1215: { e: 'pointIndex' }, 1216: { t: 'progressT' }, 1217: { a: 'skewOffset' },
  1220: { t: 'pointX', a: 'pointY' },
  1222: { b: 'leafGradient' }, 1223: { x: 'colorBrightness' }, 1224: { M: 'toHex', e: 'channelValue' },
  1226: { a: 'speckCount' }, 1227: { a: 'speckX' }, 1228: { o: 'speckY' }, 1229: { r: 'speckRadius' },
  1232: { k: 'strokeVein', t: 'x1', a: 'y1', o: 'x2', r: 'y2', n: 'width' },
  1236: { e: 'veinIndex' }, 1237: { t: 'veinT' }, 1238: { a: 'veinY' }, 1239: { o: 'veinWidth' },
  1242: { t: 'notchIndex' }, 1243: { a: 'notchT' }, 1244: { o: 'isCenterNotch' },
  1245: { i: 'sideSign' }, 1246: { s: 'notchX' }, 1247: { u: 'notchY' }, 1248: { c: 'notchRadius' },
  1253: { a: 'cellIndex' }, 1254: { o: 'leafHalfWidth' }, 1255: { r: 'leafShapeHeight' },
  1256: { n: 'centerX' }, 1257: { i: 'baseY' }, 1258: { l: 'shapeGradient' },
};

// ---- perch selection ----
const perch = {
  1073: { e: 'treeParts' }, 1074: { t: 'cameraSlope' },
  1075: { a: 'part', e: 'perch' }, 1077: { a: 'depth' }, 1079: { o: 'screenX' },
  1080: { r: 'screenY' }, 1081: { n: 'minScreenY' }, 1082: { i: 'maxScreenY' },
  1087: { e: 'treeParts' }, 1088: { t: 'bestPerch' }, 1089: { a: 'bestScore' },
  1090: { o: 'selectedPass' }, 1091: { r: 'cameraSlope' }, 1092: { n: 'normalizePerch', e: 'candidate' },
  1097: { t: 'tangent' }, 1098: { a: 'tangentY' }, 1099: { o: 'normalX' },
  1100: { r: 'normalY' }, 1101: { n: 'normalZ' }, 1102: { i: 'normalLength' },
  1104: { l: 'perchOffset' },
  1112: { i: 'tryPass', o: 'passIndex' }, 1113: { i: 'isRootPass' }, 1114: { l: 'isFallbackPass' },
  1115: { s: 'minimumRadius' }, 1116: { o: 'partIndex' }, 1117: { h: 'partWeight' },
  1118: { u: 'anchor' }, 1120: { e: 'tiltAmount' }, 1122: { o: 'anchorPos' },
  1123: { c: 'anchorDepth' }, 1124: { d: 'isThick' }, 1125: { f: 'minDepth' },
  1127: { m: 'screenX' }, 1128: { p: 'screenY' }, 1129: { v: 'marginRatio' },
  1130: { g: 'viewSpan' }, 1136: { y: 'thinPenalty' }, 1137: { w: 'viewCenter' },
  1138: { b: 'viewHalfSpan' }, 1139: { x: 'score' },
  1144: { o: 'anchor', e: 'part' }, 1145: { e: 'anchorPos' }, 1147: { r: 'thinPenalty' },
  1148: { i: 'tiltAmount' }, 1149: { l: 'score' },
  1153: { a: 'allAnchors', e: 'part' },
};

// ---- rebuildTrees ----
const rebuild = {
  1389: { e: 'seed' }, 1391: { t: 'buildTrees', e: 'seed' },
  1392: { t: 'buildTreeParts', e: 'seed' }, 1393: { t: 'preset', a: 'presetIndex' },
  1395: { a: 'cameraSlope' }, 1396: { o: 'retryIndex' }, 1397: { r: 'randomX' },
  1398: { n: 'randomY' }, 1399: { i: 'trunkLen' }, 1400: { l: 'lateralSpan' },
  1401: { s: 'crownPos' }, 1402: { h: 'rootPos' }, 1403: { u: 'rootDir' },
  1404: { c: 'rootDirLen' }, 1405: { d: 'extraTree' }, 1407: { e: 'component' },
  1422: { a: 'cachedAnchorCount' }, 1423: { e: 'part', t: 'partAnchors' },
  1424: { o: 'totalVertexCount' }, 1425: { r: 'totalIndexCount' }, 1426: { e: 'part' },
  1427: { n: 'positions' }, 1428: { i: 'normals' }, 1429: { l: 'colors' },
  1430: { s: 'flexValues' }, 1431: { h: 'uvs' }, 1432: { u: 'indices' },
  1433: { c: 'vertexOffset' }, 1434: { d: 'indexOffset' }, 1435: { f: 'anchors' },
  1436: { e: 'part' }, 1438: { t: 'indexLoop' },
  1442: { m: 'perch' },
  1456: { e: 'treeParts' }, 1457: { t: 'bestSelection' }, 1458: { a: 'bestCx' },
  1459: { o: 'bestZoom' }, 1460: { r: 'zoomCandidate' }, 1461: { n: 'cxCandidate' },
  1463: { i: 'selection' },
  1470: { o: 'treeGeometry' }, 1472: { r: 'anchorsToShuffle' },
  1474: { t: 'lcgState' }, 1475: { a: 'lcgRandom' }, 1476: { e: 'anchorIndex' },
  1477: { t: 'swapIndex' }, 1478: { o: 'tmpAnchor' },
  1482: { n: 'sparseAnchors' }, 1483: { i: 'allAnchors' }, 1485: { l: 'anchorCount' },
  1486: { s: 'leafGeometry' }, 1487: { h: 'buildLeafPlane' },
  1488: { e: 'plane' }, 1490: { t: 'positionAttribute' }, 1491: { e: 'vertexIndex' },
  1492: { a: 'posX' }, 1493: { o: 'posY' }, 1497: { o: 'uvAttribute' },
  1498: { e: 'vertexIndex' }, 1500: { r: 'positionArray' }, 1501: { n: 'normalArray' },
  1502: { i: 'uvArray' }, 1503: { l: 'indexArray' }, 1504: { s: 'planeVertexCount' },
  1505: { h: 'leafPlane' }, 1506: { u: 'positionBuffer' }, 1508: { c: 'normalBuffer' },
  1510: { d: 'uvBuffer' }, 1512: { f: 'indexBuffer' },
  1516: { u: 'instanceMatrices' }, 1517: { c: 'instanceTints' }, 1518: { d: 'instanceWind' },
  1519: { f: 'instanceUvCells' }, 1520: { m: 'atlasCells' }, 1521: { p: 'leafUpBuffer' },
  1522: { v: 'leafForwardBuffer' }, 1523: { g: 'leafSizes' }, 1524: { e: 'anchorIndex' },
  1525: { a: 'anchor' }, 1528: { y: 'leafPositions' }, 1529: { e: 'anchorIndex' },
  1530: { a: 'anchor' },
  1534: { e: 'bucketMap' }, 1535: { e: 'coordX', t: 'coordY', a: 'coordZ' }, 1536: { a: 'leafCenters' },
  1537: { o: 'anchorIndex' }, 1538: { r: 'petioleOffset' }, 1540: { n: 'bucketKeyValue' },
  1543: { o: 'axisIndex' }, 1544: { r: 'isYAxis' }, 1545: { o: 'leafIndex' },
  1546: { n: 'quantizedX' }, 1547: { i: 'quantizedY' }, 1548: { l: 'quantizedZ' },
  1549: { s: 'dx', h: 'dy', u: 'dz' }, 1550: { c: 'neighborBucket' }, 1551: { e: 'neighborIndex' },
  1553: { t: 'deltaX' }, 1554: { n: 'deltaY' }, 1555: { i: 'deltaZ' }, 1556: { l: 'distance' },
  1557: { s: 'combinedRadius' }, 1559: { h: 'pushFactor' }, 1560: { u: 'sideSign' },
  1561: { c: 'fwdX' }, 1562: { d: 'fwdY' }, 1563: { f: 'fwdZ' }, 1564: { t: 'axis' },
  1565: { a: 'forwardO' }, 1566: { r: 'forwardE' }, 1569: { m: 'forwardLen' },
  1571: { a: 'pushSign' }, 1572: { r: 'pushAmount' }, 1573: { t: 'axis' }, 1574: { n: 'pushDelta' },
  1578: { t: 'smallerLeaf' },
  1587: { e: 'anchorIndex' }, 1588: { a: 'tintColor' }, 1589: { o: 'anchor' },
  1591: { r: 'leafBaseSize' }, 1592: { n: 'sizeX' }, 1593: { i: 'sizeZ' },
  1595: { l: 'tintRoll' }, 1597: { s: 'brightness' },
  1600: { w: 'instanceMatrixAttr' },
  1601: { e: 'anchors', t: 'seed' }, 1608: { o: 'lcgState' }, 1609: { r: 'lcgRandom' },
  1610: { n: 'sparseSelected' }, 1611: { i: 'selectionRatio' }, 1612: { t: 'anchor' },
  1613: { l: 'sparseCount' }, 1614: { s: 'sparseGeometry' }, 1615: { h: 'sparsePlane' },
  1617: { u: 'instanceMatrices' }, 1618: { c: 'instanceTints' }, 1619: { d: 'instanceWind' },
  1620: { f: 'instanceUvCells' }, 1621: { m: 'atlasCells' }, 1622: { e: 'anchorIndex' },
  1623: { t: 'anchor' }, 1625: { a: 'sparseScale' }, 1627: { o: 'tintValue' },
  1632: { b: 'focusSum' }, 1633: { e: 'anchor' },
};

// ---- bird setup, gltf load, wrist bones ----
const bird = {
  1645: { e: 'url', t: 'isColorTexture' }, 1646: { o: 'texture', e: 'texture' }, 1649: { e: 'error' },
  1658: { e: 'birdRoot', t: 'opacity' }, 1659: { e: 'node' },
  1674: { o: 'mixer' }, 1675: { r: 'flapAction' }, 1676: { n: 'perchAction' },
  1677: { i: 'foldAction' }, 1684: { e: 'root' }, 1685: { t: 'boneState' },
  1691: { a: 'boneName' }, 1692: { o: 'bone' },
  1700: { e: 'gltf' },
  1701: { t: 'sceneRoot' }, 1702: { o: 'tempVertex' }, 1703: { r: 'birdPivot' },
  1704: { n: 'adjustedVertex' }, 1705: { i: 'findAnimation', t: 'keyword', e: 'animation' },
  1706: { l: 'cloneOpacity' }, 1709: { e: 'animation' }, 1710: { e: 'meshNode' },
  1712: { t: 'positionAttribute' }, 1713: { i: 'skinIndexAttribute' }, 1714: { l: 'skinWeightAttribute' },
  1715: { s: 'boneNameList', e: 'bone' }, 1716: { e: 'vertexIndex' },
  1717: { a: 'maxBoneIndex' }, 1718: { h: 'maxWeight' }, 1719: { t: 'influence' },
  1720: { o: 'influenceWeight' }, 1723: { u: 'boneName' },
  1725: { e: 'radialFade' }, 1726: { t: 'radialScale' }, 1728: { a: 'headMerge' },
  1729: { i: 'isTailQuill' }, 1732: { e: 'mergeDist' }, 1736: { e: 'tailFade' },
  1742: { h: 'meshGeometry' }, 1744: { u: 'normalAttribute' }, 1745: { e: 'normalIndex' },
  1747: { e: 'sourceRoot' }, 1748: { t: 'skeletonMap' }, 1749: { e: 'node' },
  1752: { o: 'invBindMatrix' }, 1753: { r: 'bindMatrix' }, 1754: { n: 'bonePos' },
  1755: { i: 'farVertex' }, 1756: { l: 'vertexPos' }, 1757: { e: 'skeleton', s: 'meshList' },
  1758: { t: 'bones' }, 1759: { h: 'boneInverses', e: 'matrix' }, 1760: { u: 'meshInfos', e: 'mesh' },
  1766: { e: 'side' }, 1767: { s: 'wingIndex', t: 'bone' }, 1769: { c: 'wingBone' },
  1771: { d: 'maxDist' }, 1772: { e: 'meshInfo' }, 1773: { t: 'positionAttr' },
  1774: { a: 'skinIndexAttr' }, 1775: { o: 'skinWeightAttr' }, 1777: { h: 'vertexIndex' },
  1778: { u: 'slotIndex' }, 1779: { e: 'influence' }, 1781: { c: 'dist' },
  1786: { f: 'wristBone' }, 1788: { m: 'wristIndex' }, 1789: { e: 'meshInfo' },
  1790: { t: 'skinIndexAttr' }, 1791: { a: 'skinWeightAttr' }, 1792: { o: 'vertexIndex' },
  1793: { r: 'slotIndex' }, 1795: { n: 'wristBlend' }, 1797: { i: 'origWeight' },
  1798: { l: 'freeSlot' }, 1799: { e: 'influence' }, 1812: { c: 'skeleton' },
  1813: { e: 'mesh' },
  1816: { t: 'cloneGroup' }, 1817: { o: 'cloneRoot', e: 'sourceRoot' },
  1818: { t: 'cloneMap' }, 1819: { a: 'reverseCloneMap' }, 1820: { o: 'cloneRoot' },
  1821: { r: 'cloneTree', e: 'sourceNode', t: 'cloneNode', a: 'visit' },
  1823: { o: 'childIndex' }, 1825: { e: 'sourceNode', o: 'cloneNode' },
  1827: { e: 'cloneNode' }, 1829: { o: 'sourceNode' }, 1830: { e: 'meshNode' },
  1835: { l: 'wasVisible' }, 1836: { e: 'clone' }, 1839: { e: 'error' }, 1840: { e: 'clone' },
};

// ---- animations, flap, flight, post, render loop ----
const anim = {
  1851: { e: 'bone', t: 'axis', a: 'angle' },
  1852: { e: 'actor', t: 'perchWeight', a: 'flapTime', o: 'foldWeight' },
  1853: { r: 'combinedPerchWeight' }, 1856: { n: 'bones' },
  1857: { e: 'boneIndex' }, 1859: { e: 'boneIndex' },
  1860: { i: 'flutterNoise' }, 1861: { l: 'relaxationAmount' },
  1865: { e: 'out', t: 'position', a: 'flex', o: 'time', r: 'wind' },
  1866: { n: 'phase' }, 1867: { i: 'primaryWave' }, 1868: { l: 'secondaryWave' },
  1869: { s: 'tertiaryWave' }, 1870: { h: 'windAmplitude' }, 1871: { u: 'swayFactor' },
  1872: { c: 'landingElapsed' }, 1873: { d: 'landingDeltaX' }, 1874: { f: 'landingDeltaY' },
  1875: { m: 'landingDeltaZ' }, 1876: { p: 'landingDistance' }, 1877: { v: 'landingFalloff' },
  1878: { g: 'springParams' }, 1879: { y: 'landingDip' },
  1896: { e: 'duration' }, 1898: { t: 'scheduleTime' }, 1899: { a: 'beatCursor' },
  1901: { e: 'beats' }, 1902: { o: 'onRatio' }, 1903: { r: 'offRatio' },
  1921: { e: 'time', t: 'out' }, 1923: { a: 'currentSegment' }, 1924: { t: 'segment' },
  1925: { o: 'segmentElapsed' }, 1926: { r: 'isFlapping' }, 1927: { n: 'phaseProgress' },
  1939: { e: 'value' },
  1941: { e: 'clone' },
  1945: { e: 'halfWidthFactor' }, 1946: { t: 'crossingDepth' }, 1947: { a: 'crossingZ' },
  1948: { o: 'worldY', e: 'ndcY' }, 1949: { r: 'shelterA' }, 1950: { n: 'shelterTopY' },
  1951: { i: 'hasShelterGap' }, 1952: { l: 'startY' }, 1953: { s: 'endY' },
  1954: { h: 'controlY' }, 1955: { u: 'startX' }, 1956: { c: 'endX' },
  1957: { d: 'halfViewWidth' }, 1958: { f: 'viewWidth' }, 1959: { m: 'viewCenterX' },
  1960: { p: 'halfSpan' }, 1961: { v: 'depthSign' },
  1964: { e: 'time', t: 'delay' },
  1976: { e: 'exitZ' }, 1977: { t: 'negExitZ' }, 1978: { a: 'exitX' },
  1985: { e: 'out', t: 'time' }, 1986: { a: 'inverseTime' },
  1990: { e: 'distanceAccumulated' }, 1992: { t: 'sampleIndex' }, 1994: { e: 'sampleIndex' },
  2001: { e: 'out', t: 'ndcX', a: 'ndcY', o: 'distance' },
  2007: { e: 'ndcX' }, 2008: { t: 'ndcY' }, 2009: { a: 'distance' },
  2012: { e: 'out', t: 'pathTime', a: 'flapState' }, 2013: { e: 'time' },
  2016: { t: 'lowerIndex' }, 2017: { a: 'upperIndex' }, 2019: { o: 'midIndex' },
  2022: { o: 'span' },
  2029: { e: 'bird', t: 'actor', a: 'pathProgress', o: 'pathTime', r: 'flapState', n: 'elapsed' },
  2030: { i: 'clampedProgress' }, 2031: { l: 'sampledFlapState' }, 2033: { s: 'rollAngle' },
  2035: { h: 'hopLift' }, 2036: { u: 'wrappedPathTime' }, 2038: { c: 'wingFoldAmount' },
  2040: { d: 'rollToApply', f: 'foldRemaining' }, 2041: { a: 'bones' },
  2042: { e: 'actor', t: 'flapPhase', a: 'amount' }, 2044: { o: 'bones' },
  2045: { r: 'wingL' }, 2046: { n: 'wingR' }, 2048: { i: 'wingCosine' },
  2049: { l: 'downstroke' }, 2050: { s: 'wingRoll' }, 2051: { h: 'wingPitch' },
  2053: { e: 'wristRoll' }, 2054: { r: 'wristPitch' }, 2055: { n: 'wristYaw' },
  2066: { e: 'out' }, 2069: { e: 'out' },
  2087: { e: 'entries' }, 2088: { t: 'entry' },
  2095: { e: 'event' },
  2132: { e: 'sampleCount', t: 'radius', a: 'angleOffset' }, 2133: { o: 'sampleIndex' },
  2134: { r: 'angle' }, 2135: { n: 'offsetX' }, 2136: { i: 'offsetY' },
  2311: { e: 'target' },
  2317: { e: 'posX', t: 'posY', a: 'posZ' }, 2319: { o: 'moonDir' }, 2320: { e: 'material' },
  2325: { t: 'event' }, 2327: { a: 'rect' }, 2339: { e: 'lookName', t: 'label', a: 'colorHex' },
  2340: { o: 'button' }, 2345: { e: 'look' }, 2346: { t: 'lookName' },
  2349: { e: 'lookName' },
  2356: { t: 'event' }, 2357: { a: 'rect' },
  2364: { e: 'px', t: 'py' }, 2366: { a: 'birdX', o: 'birdY' }, 2367: { r: 'distance' }, 2368: { n: 'hitRadius' },
  2376: { t: 'width', o: 'height' }, 2377: { r: 'resolvedWidth' }, 2378: { n: 'resolvedHeight' },
  2380: { i: 'dpr' }, 2383: { l: 'previousPortrait' }, 2385: { h: 'sceneWidth' },
  2386: { u: 'sceneHeight' }, 2388: { c: 'renderWidth' }, 2389: { d: 'renderHeight' },
  2390: { e: 'target' }, 2391: { f: 'renderTargetOptions' }, 2398: { m: 'blurWidth' },
  2399: { p: 'blurHeight' }, 2400: { v: 'blurTargetOptions' },
  2409: { e: 'viewportWidth' }, 2410: { t: 'viewportHeight' }, 2412: { a: 'zoom' },
  2413: { o: 'aspectRatio' }, 2414: { r: 'cloudBlend' }, 2415: { n: 'verticalOffset' },
  2417: { e: 'aspectCloseness' }, 2418: { e: 'from', t: 'to', a: 'blend' },
  2422: { o: 'cropHeight' }, 2423: { r: 'cropWidth' }, 2424: { i: 'cropX' }, 2425: { l: 'cropY' },
  2440: { e: 'shelterA', t: 'shelterB', a: 'shelterC' }, 2442: { o: 'defaultShelter' },
  2445: { e: 'frameTimestamp' }, 2448: { t: 'rawDeltaTime' }, 2450: { a: 'timeStep' },
  2452: { o: 'simulationTime' }, 2454: { e: 'blendFactor' }, 2455: { t: 'lookKey' },
  2459: { e: 'cloudEase' },
  2462: { e: 'deltaTime', t: 'time' },
  2463: { a: 'motionProgress', o: 'currentTime' }, 2464: { r: 'motion', n: 'bones' },
  2469: { e: 'clone' },
  2478: { a: 'liftProgress' }, 2480: { o: 'departureBlend' },
  2486: { a: 'flightElapsedSinceLift' }, 2487: { o: 'rawProgress' }, 2488: { r: 'easedProgress' },
  2490: { e: 'postLandingOvershoot' }, 2493: { n: 'arrivalBlend' },
  2495: { i: 'isFlight' }, 2497: { l: 'arrivalFoldBlend' }, 2499: { s: 'sampledFlapState' },
  2500: { h: 'flapTime' }, 2501: { e: 'clone' },
  2503: { e: 'outboundBlend' },
  2506: { e: 'cloneIndex' }, 2507: { t: 'clone' }, 2508: { o: 'cloneOffset' },
  2510: { n: 'cloneTime' },
  2514: { u: 'reachedPerch' }, 2515: { c: 'distanceRatio' },
  2519: { i: 'microMotionProgress' },
  2522: { e: 'sinceLanding' }, 2526: { l: 'sincePerch' }, 2528: { e: 'settleBlend' },
  2531: { s: 'landSettle' }, 2532: { h: 'perchBlendEase' },
  2533: { e: 'time' }, 2534: { t: 'randomVal' }, 2535: { a: 'motionKind' },
  2543: { e: 'hopDelta' },
  2547: { e: 'deltaTime' }, 2548: { t: 'actor' }, 2550: { a: 'headBone' },
  2552: { o: 'headYawTarget' }, 2553: { r: 'headPitchTarget' }, 2555: { n: 'headSmoothing' },
  2559: { r: 'focusDepth' }, 2560: { n: 'focusBlend' }, 2562: { i: 'motionEnabled' },
  2563: { l: 'swayX' }, 2564: { s: 'swayY' },
  2567: { e: 'projectionMatrix' }, 2568: { t: 'shelterShift' },
  2570: { a: 'birdX' }, 2571: { o: 'birdY' },
  2580: { e: 'object' }, 2581: { t: 'material' }, 2582: { e: 'textureKey' }, 2583: { a: 'texture' },
  2591: { e: 'value' }, 2594: { e: 'value' },
};

const RENAME = {};
for (const table of [tree, helpers, perch, rebuild, bird, anim]) {
  for (const [line, letters] of Object.entries(table)) {
    for (const [letter, name] of Object.entries(letters)) {
      const key = `${line}:${letter}`;
      if (RENAME[key] && RENAME[key] !== name) console.error(`CONFLICT in map at ${key}: ${RENAME[key]} vs ${name}`);
      RENAME[key] = name;
    }
  }
}
console.log(`mapping entries: ${Object.keys(RENAME).length}`);

// ---- Pass A: depth-sorted line:letter rename ----
const pending = [];
const seenScopes = new Set();
traverse(ast, {
  enter(path) {
    const scope = path.scope;
    if (!scope || seenScopes.has(scope)) return;
    seenScopes.add(scope);
    let depth = 0;
    for (let s = scope; s; s = s.parent) depth++;
    for (const [old, binding] of Object.entries(scope.bindings)) {
      const name = binding.identifier.name;
      if (!/^[a-zA-Z_$]$/.test(name)) continue;
      const key = `${lineOf(binding.identifier)}:${name}`;
      const newName = RENAME[key];
      if (newName && newName !== name) pending.push({ binding, old, newName, depth });
    }
  },
});
pending.sort((a, b) => b.depth - a.depth);
const claimed = new Set();
let renamed = 0, skipped = [];
const collisions = [];
const shadows = [];
function guard(scope, old, newName, line) {
  const own = scope.bindings[newName];
  if (own && own.identifier && own.identifier !== scope.bindings[old]?.identifier) {
    collisions.push(`${old}->${newName} @${line}`);
    return false;
  }
  if (scope.hasBinding(newName) && !scope.hasOwnBinding(newName)) {
    shadows.push(`${old}->${newName} @${line} shadows an enclosing binding`);
  }
  return true;
}
for (const { binding, old, newName, depth } of pending) {
  const key = `${lineOf(binding.identifier)}:${old}`;
  if (claimed.has(key)) { skipped.push(`${key}@d${depth}`); continue; }
  claimed.add(key);
  if (!guard(binding.scope, old, newName, lineOf(binding.identifier))) continue;
  try {
    binding.scope.rename(old, newName);
    renamed++;
  } catch (e) {
    console.error(`rename failed ${old}->${newName} @${lineOf(binding.identifier)}: ${e.message}`);
  }
}
console.log(`Pass A: renamed=${renamed}, skipped=${skipped.length}`);
if (skipped.length) console.log('  skipped keys:', skipped.join(', '));
if (collisions.length) { console.error('COLLISIONS:'); collisions.forEach(c => console.error('  ' + c)); }
if (shadows.length) { console.log('shadow warnings:'); shadows.forEach(s => console.log('  ' + s)); }

// ---- Pass B: bindings that lost a (line,letter) collision to a deeper scope.
// Each is matched by a precise structural predicate, so no ambiguity. ----
let passB = 0;
function rb(scope, old, next) {
  try {
    if (!guard(scope, old, next, -1)) { console.error(`Pass B collision ${old}->${next}`); return; }
    scope.rename(old, next); passB++;
  } catch (e) { console.error(`Pass B fail ${old}->${next}: ${e.message}`); }
}
traverse(ast, {
  // var t = (e,t,a) => ... at 1535 (bucketKey) and 2418 (lerp): the var lost to
  // its own deeper params, which the main pass already renamed.
  VariableDeclarator(path) {
    const line = lineOf(path.node);
    const init = path.node.init;
    const isArrow = init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') && init.params.length === 3;
    if (path.node.id.type === 'Identifier' && /^[a-z]$/.test(path.node.id.name)) {
      if (line === 1535 && path.node.id.name === 't' && isArrow) rb(path.scope, 't', 'bucketKey');
      if (line === 2418 && path.node.id.name === 't' && isArrow) rb(path.scope, 't', 'lerp');
      // 1393: `let t = treePresets.map((preset, presetIndex) => ...)` — the var
      // lost to its own deeper map-callback params.
      if (line === 1393 && path.node.id.name === 't' && init && init.type === 'CallExpression') rb(path.scope, 't', 'treeParts');
    }
  },
  // forEach(([e,t], a) => ...) at 1186 / 1253, and .then(e => ...) at 1700.
  // (Both are CallExpression visitors; merge so neither shadows the other.)
  CallExpression(path) {
    if (path.node.callee.type !== 'MemberExpression') return;
    const prop = path.node.callee.property.name;
    const line = lineOf(path.node);
    if (prop === 'forEach' && (line === 1186 || line === 1253)) {
      const fnPath = path.get('arguments.0');
      if (!fnPath || !fnPath.isArrowFunctionExpression()) return;
      const params = fnPath.node.params;
      if (params[0] && params[0].type === 'ArrayPattern') {
        rb(fnPath.scope, 'e', 'cellX');
        rb(fnPath.scope, 't', 'cellY');
      }
      if (params[1] && params[1].type === 'Identifier' && params[1].name === 'a') {
        rb(fnPath.scope, 'a', 'cellIndex');
      }
      return;
    }
    if (prop === 'then' && line === 1700) {
      const fnPath = path.get('arguments.0');
      if (fnPath && fnPath.isArrowFunctionExpression() && fnPath.node.params.length === 1) {
        rb(fnPath.scope, 'e', 'url');
      }
    }
  },
  // dispose(): `for (let [e,t,a,o] of eventListeners)` at 2579 and
  // `for (let e of (...)) e && e.dispose()` at 2580 — both lost to the deeper
  // scene.traverse callback e on 2580.
  ForOfStatement(path) {
    const line = lineOf(path.node);
    if (line !== 2579 && line !== 2580) return;
    const decl = path.node.left;
    if (decl.type !== 'VariableDeclaration') return;
    const id = decl.declarations[0].id;
    if (id.type === 'ArrayPattern') {
      rb(path.scope, 'e', 'target'); rb(path.scope, 't', 'type');
      rb(path.scope, 'a', 'listener'); rb(path.scope, 'o', 'options');
    } else if (id.type === 'Identifier' && id.name === 'e') {
      rb(path.scope, 'e', 'renderTarget');
    }
  },
});
console.log(`Pass B: renamed=${passB}`);

// ---- Final validation: report ANY remaining single-letter binding. ----
const leftover = [];
const seen2 = new Set();
traverse(ast, {
  enter(path) {
    const scope = path.scope;
    if (!scope || seen2.has(scope)) return;
    seen2.add(scope);
    for (const [name, binding] of Object.entries(scope.bindings)) {
      if (/^[a-zA-Z_$]$/.test(binding.identifier.name)) {
        leftover.push(`${lineOf(binding.identifier)}:${binding.identifier.name} (${binding.path?.type || '?'})`);
      }
    }
  },
});
console.log(`leftover single-letter bindings: ${leftover.length}`);
if (leftover.length) leftover.forEach((l) => console.log('  ' + l));

const result = generate(ast, { comments: true, compact: false, jsescOption: { minimal: true } }).code + '\n';
fs.writeFileSync(output, result, 'utf8');
console.log(`wrote ${output}`);
