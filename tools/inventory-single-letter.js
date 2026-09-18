// 枚举所有单字母 binding 声明(含函数参数),按所在函数分组打印。
// 输出格式: 行号 <函数链> :: <原字母> = <声明语句文本>
const fs = require('fs');
const parser = require('C:/Users/18086/.bun/install/cache/@babel/parser@7.29.0@@@1/lib/index.js');

const inputPath = process.argv[2] || 'C:/tmp/fable-hero-reverse/fable-hero-engine.semantic.js';
const source = fs.readFileSync(inputPath, 'utf8');
const ast = parser.parse(source, { sourceType: 'script', plugins: ['jsx'] });

class Scope {
  constructor(parent, start, end, kind, fnName) {
    this.parent = parent;
    this.start = start;
    this.end = end;
    this.kind = kind;
    this.fnName = fnName;
  }
  label() {
    const chain = [];
    let s = this;
    while (s) { chain.push(s.kind + (s.fnName ? ':' + s.fnName : '')); s = s.parent; }
    return chain.reverse().join(' > ');
  }
}

const seen = new Set();
function lineOf(node) { return source.slice(0, node.start).split('\n').length; }

function isSingleLetter(name) { return /^[a-zA-Z]$/.test(name); }

function walk(node, scope) {
  if (!node || typeof node !== 'object') return;
  let current = scope;
  if (node.type === 'FunctionDeclaration') {
    current = new Scope(scope, node.start, node.end, 'fn', node.id?.name || '(anon)');
    for (const p of node.params) {
      if (p.type === 'Identifier' && isSingleLetter(p.name)) {
        const key = p.start;
        if (!seen.has(key)) {
          seen.add(key);
          console.log(`${lineOf(p)} ${current.label()} :: param ${p.name}`);
        }
      }
      // destructured/rest params: walk them later
    }
  } else if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    current = new Scope(scope, node.start, node.end, 'fn', '(anon)');
    for (const p of node.params) {
      if (p.type === 'Identifier' && isSingleLetter(p.name)) {
        const key = p.start;
        if (!seen.has(key)) {
          seen.add(key);
          console.log(`${lineOf(p)} ${current.label()} :: param ${p.name}`);
        }
      }
    }
  } else if (node.type === 'BlockStatement' || node.type === 'ForStatement' || node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
    current = new Scope(scope, node.start, node.end, 'block', '');
  }
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && isSingleLetter(node.id.name)) {
    const key = node.start;
    if (!seen.has(key)) {
      seen.add(key);
      const txt = source.slice(node.start, node.end).split('\n')[0].slice(0, 110);
      console.log(`${lineOf(node)} ${current.label()} :: var ${node.id.name} = ${txt}`);
    }
  }
  for (const key of Object.keys(node)) {
    if (['loc', 'start', 'end', 'leadingComments', 'trailingComments', 'innerComments'].includes(key)) continue;
    const value = node[key];
    if (Array.isArray(value)) for (const child of value) walk(child, current);
    else if (value && typeof value === 'object' && value.type) walk(value, current);
  }
}

const root = new Scope(null, 0, source.length, 'program', '');
walk(ast.program, root);
