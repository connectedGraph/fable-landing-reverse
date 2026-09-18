# fable-landing-reverse

Reverse engineering of the hero animation on Anthropic's
[Claude Fable 5.1 / Mythos 5.1 landing page](https://www.anthropic.com/claude-fable-and-mythos-5-1) —
de-minified, semantically renamed, and verified equivalent.

Anthropic 官网 Claude Fable 5.1 / Mythos 5.1 落地页顶部 hero 动画的逆向工程：
解压、**AST 作用域级语义还原**（约 800 处单字母变量全部还原为语义名）、并做了完整的等价性验证。

---

## Source attribution / 来源署名

This work studies the **publicly served** client bundle of:

- Original page: <https://www.anthropic.com/claude-fable-and-mythos-5-1>
- Renderer bundle: `/_next/static/chunks/14c8frmb4u5hu.js` (module `222197`, `createFableHero`)
- THREE + GLTFLoader bundle: `/_next/static/chunks/43wzyymewd7k8.js`
- Assets: `/fx/hero/bark_diff.webp`, `bark_nor.webp`, `tit_diff.webp`, `tit_norm.webp`, `tit_rgh.webp`, `tit.glb`

All original code, shaders, models and textures are © Anthropic. This repository is a
study/learning artifact; the extracted files are kept here for reference and analysis.

---

## 结论 / Findings

`createFableHero()` 不是 Canvas 2D 插画，而是一个 Three.js WebGL 实时场景引擎。React 组件只负责
DOM 结构、标题、目录、字体就绪和文本区域测量；树、鸟、天空、云、景深和胶片调色全部由引擎在
一个 canvas 中完成。

- 代码**没有混淆**，只有 Turbopack 标准压缩：变量名压成单字母，但字符串字面量（含 GLSL shader
  内的英文设计注释）完好，因此可以做语义还原。
- 技术构成：程序化树枝生成（seeded PRNG）→ 山雀 skinned mesh（`tit.glb`，flap/perch/fold 动画）
  + wrist 骨骼程序化插入 → instanced 叶片（atlas 4 cell + flutter shader）→ 天空穹顶 shader
  （夜/黄昏/晨 look，星场、fbm 云、月亮）→ 自研 DoF（52 样本径向散景）+ ACES + 胶片颗粒 + 暗角 + 色差。
  没有 EffectComposer，也没有 shadowMap。

完整分析见 **[reverse-engineering-report.md](reverse-engineering-report.md)**。

---

## 仓库结构 / Layout

```
extracted/
  fable-hero-engine.formatted.js        原始压缩代码，仅 prettier 格式化（3161 行）
  fable-hero-engine.semantic.js         语义还原版（round2，单字母 binding 已清零）
  fable-hero-engine.semantic.round1.js  round1 保守版（部分作用域未还原，留作对照）
  launch-hero-component.formatted.js    React 装配层，格式化
  launch-hero-component.semantic.js     React 装配层，语义还原
  three-js.formatted.js                 three.js 库本身（21989 行，未改名，学习时跳过）

site/         原始抓取产物：page.html + 20 个 chunk + 6 个 CSS + fx 资源
dist-semantic/  可运行副本（已换入语义版引擎），静态起服务即可看效果
tools/        语义还原脚本与验证套件
reverse-engineering-report.md  完整逆向与设计报告
```

---

## 本地运行 / Run

```bash
# 起一个静态服务指向 dist-semantic 即可
python -m http.server 4174 --directory dist-semantic
# 打开 http://127.0.0.1:4174/
```

页面上可看到日期、标题、目录，左下角三个 look 色点（Noon/Night/Morning），
背景是实时 WebGL；点击画布上的鸟会让它飞走／飞回。

---

## 语义还原方法与验证 / Method & Verification

变量名恢复走 babel AST 的 **作用域级 rename**（`scope.rename`），只改本作用域声明的 binding，
绝不做全局字母替换（单字母严重 shadowed，全局替换会误改外层 Three.js 模块别名）。
键控为 `声明行:字母`，同行冲突用深度优先让更深作用域认领，输掉的外层 binding 由精确结构谓词的
兜底 Pass 处理；另加同作用域重名守卫与结尾全量扫描。详见
[tools/semantic-rename-round2.js](tools/semantic-rename-round2.js)。

验证链（全部通过）：

| 验证 | 结果 |
|---|---|
| `node --check` | 通过 |
| **TDZ 校验**（`tools/check-tdz.js`） | 通过 |
| AST 结构等价（忽略标识符名/位置/格式，sha256 归一化比较） | `equal=true` |
| 树生成器 seed 0/1/42/123456789/0xffffffff 的几何数组逐项相等 | 全部 `equal=true` |
| 浏览器渲染对比（同条件 1440×1000 截图，语义版 vs 原始版） | 平均像素差约 2/255，仅动画帧时序差异 |

> **验证盲区**：AST 结构等价比较忽略标识符名，因此"两个不同绑定被改成同名"这类错误对它是不可见的。
> round2 就曾引入一处这样的 TDZ（`skeleton` 同名遮蔽），AST 等价与渲染像素差都没抓到，直到把引擎
> 拼成独立 bundle 在浏览器里跑才暴露。`tools/check-tdz.js` 是为补这个洞加的。

沿用同一条管线的另一篇方法论笔记：《压缩 JS 变量语义还原 (Minified JS Semantic Renaming)》
—— 讲压缩（非混淆）JS 的 AST 作用域级语义还原、同行冲突处理、守卫与验证链。

---

## 公开 API / Public API

| API | 语义 |
|---|---|
| `setLook(name)` | 切换 day/night/dusk/morning 目标参数并平滑过渡 |
| `setShelters(a,b,c)` | 更新云层 shader 的三个文本保护矩形 |
| `setSpeed(value)` | 设置动画时间倍率，默认 1 |
| `setBlur(value)` | 开关前景/背景散景 |
| `cue()` | `perched` 时让鸟离开，`away` 时让鸟开始横穿 |
| `dispose()` | 停止循环、移除监听、释放 geometry/material/texture/render target 和 DOM |

额外 getter：`look`、`seed`、`ready`、`bird`、`birdXY`。

---

## 边界 / Caveats

- 没有 source map，因此语义名是**基于数据流和调用关系恢复的学习标签**，不是作者原始命名。
- `three-js.formatted.js` 是库依赖，保持原样，未做语义改名。
- 还原后的代码仍是 Turbopack 模块传输格式，不是干净的独立模块。
