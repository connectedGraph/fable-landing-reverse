// Round-2 AST structural equivalence: original formatted vs round2 semantic.
const fs = require('fs');
const crypto = require('crypto');
const parser = require('@babel/parser');

const ignoredKeys = new Set([
  'start', 'end', 'loc', 'range', 'extra', 'errors', 'comments',
  'leadingComments', 'innerComments', 'trailingComments',
]);

function normalize(value, parentKey = '') {
  if (Array.isArray(value)) return value.map((item) => normalize(item, parentKey));
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const key of Object.keys(value).sort()) {
    if (ignoredKeys.has(key)) continue;
    if (key === 'name' && value.type === 'Identifier') { out[key] = '_identifier_'; continue; }
    if (key === 'shorthand') { out[key] = false; continue; }
    out[key] = normalize(value[key], key);
  }
  return out;
}

function digest(path) {
  const source = fs.readFileSync(path, 'utf8');
  const ast = parser.parse(source, { sourceType: 'script' });
  const canonical = JSON.stringify(normalize(ast));
  return { path, bytes: canonical.length, sha256: crypto.createHash('sha256').update(canonical).digest('hex') };
}

const pairs = [
  ['C:/tmp/fable-hero-reverse/fable-hero-engine.formatted.js', 'C:/tmp/fable-hero-reverse/fable-hero-engine.semantic-round2.js'],
];
let ok = true;
for (const [originalPath, semanticPath] of pairs) {
  const original = digest(originalPath);
  const semantic = digest(semanticPath);
  const equal = original.sha256 === semantic.sha256;
  ok &&= equal;
  console.log(JSON.stringify({ equal, original, semantic }));
}
if (!ok) process.exitCode = 1;
