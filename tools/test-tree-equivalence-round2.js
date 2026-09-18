const fs = require('fs');
const vm = require('vm');
const parser = require('@babel/parser');

function extract(path, name) {
  const source = fs.readFileSync(path, 'utf8');
  const ast = parser.parse(source, { sourceType: 'script' });
  let init;
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (!init && node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.id.name === name && (node.init?.type === 'CallExpression' || node.init?.type === 'FunctionExpression') && source.slice(0, node.start).split('\n').length < 20) init = node.init;
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object' && value.type) visit(value);
    }
  }
  visit(ast);
  if (!init) throw new Error(`missing ${name} in ${path}`);
  console.error(path, name, source.slice(init.start, Math.min(init.end, init.start + 100)).replace(/\s+/g, ' '));
  return vm.runInNewContext(`(${source.slice(init.start, init.end)})`, { Math });
}

const original = extract('C:/tmp/fable-hero-reverse/fable-hero-engine.formatted.js', 'r');
const semantic = extract('C:/tmp/fable-hero-reverse/fable-hero-engine.semantic-round2.js', 'treeGenerator');
for (const seed of [0, 1, 42, 123456789, 0xffffffff]) {
  const a = original.generate(seed, {});
  const b = semantic.generate(seed, {});
  let equal = true;
  for (const key of ['positions', 'normals', 'colors', 'flex', 'uvs', 'indices']) {
    if (a[key].length !== b[key].length) { equal = false; break; }
    for (let i = 0; i < a[key].length; i++) if (a[key][i] !== b[key][i]) { equal = false; break; }
    if (!equal) break;
  }
  console.log(JSON.stringify({ seed, equal, originalStats: a.stats, semanticStats: b.stats }));
}
