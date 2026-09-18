// TDZ 校验器:找出"同一块内 let/const 绑定在声明之前被引用"的情况。
// 这类 bug 会让运行时抛 "Cannot access 'X' before initialization",
// 而 AST 结构等价比较(忽略名字)和渲染像素差都不一定能抓到。
const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const file = process.argv[2];
const source = fs.readFileSync(file, 'utf8');
const ast = parser.parse(source, { sourceType: 'script' });
function lineOf(n) { return source.slice(0, n.start).split('\n').length; }

const issues = [];
const seen = new Set();

traverse(ast, {
  enter(path) {
    const scope = path.scope;
    if (!scope || seen.has(scope)) return;
    seen.add(scope);
    const blockStart = scope.block.start;

    for (const [name, binding] of Object.entries(scope.bindings)) {
      // 只关心块级 let/const(binding.kind === 'let'/'const'),且有初始化位置
      if (binding.kind !== 'let' && binding.kind !== 'const') continue;
      const declStart = binding.identifier.start;

      // 收集该 binding 的所有引用/赋值
      const refs = [...(binding.referencePaths || []), ...(binding.constantViolations || [])];
      for (const ref of refs) {
        const node = ref.node;
        // 判断引用是否位于"相对本作用域嵌套的函数"里(那属于延迟执行,不是 TDZ)。
        // 从引用向上走:先遇到本作用域的块 => 同块(要检查);先遇到函数 => 嵌套(跳过)。
        let nested = false;
        for (let p = ref.parentPath; p; p = p.parentPath) {
          if (p.node === scope.block) break;
          if (p.isFunction()) { nested = true; break; }
        }
        if (nested) continue;
        if (node.start < declStart && node.start >= blockStart) {
          issues.push({
            name,
            declLine: lineOf(binding.identifier),
            refLine: lineOf(node),
            kind: binding.kind,
          });
        }
      }
    }
  },
});

if (issues.length) {
  console.log(`TDZ issues: ${issues.length}`);
  for (const i of issues) console.log(`  ${i.name}: 声明@${i.declLine} 但引用@${i.refLine} (${i.kind})`);
  process.exitCode = 1;
} else {
  console.log('TDZ check: clean');
}
