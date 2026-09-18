# Fable Hero 前端逆向与设计报告

## 结论

`createFableHero()` 不是 Canvas 2D 插画，而是一个以 Three.js WebGL 为核心的实时场景引擎。React 组件只负责 DOM 结构、标题/目录、字体就绪和文本区域测量；所有树、鸟、天空、云、景深和胶片调色均由引擎在一个 canvas 中完成。

本报告基于以下本地证据：

- `extracted/fable-hero-engine.formatted.js`：3161 行引擎实现
- `extracted/launch-hero-component.formatted.js`：803 行 React 装配层
- `site/_next/static/chunks/0knc7i5l6_71d.css`：Hero 布局、断点、动效和交互样式
- `site/fx/hero/tit.glb`、`tit_diff.webp`、`tit_norm.webp`、`tit_rgh.webp`：鸟模型与材质
- `site/fx/hero/bark_diff.webp`、`bark_nor.webp`：树皮材质

## 产物与验证

- [fable-hero-engine.semantic.js](extracted/fable-hero-engine.semantic.js)：AST 作用域级语义重命名版本（round2，已清除全部单字母 binding）
- [fable-hero-engine.semantic.round1.js](extracted/fable-hero-engine.semantic.round1.js)：round1 保守版备份
- [launch-hero-component.semantic.js](extracted/launch-hero-component.semantic.js)：React 装配层语义重命名版本
- [tree-generator.semantic-map.md](C:/tmp/fable-hero-reverse/tree-generator.semantic-map.md)：树生成器原名、语义名和依据
- `node --check` 已通过引擎和组件语义版本
- 程序化树生成器已做 5 组种子等价测试；`positions`、`normals`、`colors`、`flex`、`uvs`、`indices` 长度与逐项数值均一致
- 浏览器渲染对比：round2 语义版与 round1 版同条件截图，全分辨率平均像素差约 2/255（仅动画帧时序差异），结构一致

语义版本不是重新实现，而是从原 AST 绑定关系生成，未改变公开 API 或算法表达式。由于没有 source map，名称是“语义恢复名”，不是作者原始变量名。

## 运行时结构

```text
LaunchHero React
  ├─ header / words / title / index / credit
  ├─ measure text boxes → shelters[3]
  └─ dynamic import createFableHero()
       ├─ WebGLRenderer + PerspectiveCamera
       ├─ skyScene: sky dome + moon shader
       ├─ cloudScene: procedural cloud deck + text shelter
       ├─ scene: tree mesh + instanced leaves + bird group + lights
       ├─ postScene: full-screen quad
       └─ render targets → DoF → grade → canvas
```

## React 装配层

组件接收 `modelName`、`version`、`companion`、`date`、`index`、`assets`、`still`、`seed` 等参数。

关键行为：

1. `document.fonts.ready` 后给 Hero 设置 `data-fx-ready`，CSS 以此启动标题、日期和目录的入场动画。
2. 使用四个 ref 测量 Hero、标题、目录和日期区域。
3. 每个文本框转换为归一化坐标，并额外扩张边距，作为云层 shader 的 `uShelterA/B/C`。
4. `ResizeObserver` 在布局或字体变化后重新提交 shelters，避免云穿过文字。
5. `still=true` 时不创建 WebGL 引擎，适用于静态/降级场景。
6. 卸载时断开 observer 并调用 `dispose()`。

视觉结构是“文本优先，场景承托”：文字是真正的 DOM/可访问内容，WebGL 只是其后的 atmospherics 和 motion layer。

## 程序化树生成器

树生成器使用 Mulberry32 风格 seeded PRNG。`generateTree(seed, options)` 返回：

- typed position/normal/color/flex/uv/index buffers
- `anchors`：叶片实例描述
- `perches`：鸟可落脚的枝条点
- `bounds`：包围球
- `stats`：顶点、三角形、叶片数和 seed

递归 `appendBranch()` 的状态包括起点、方向、长度、半径、深度和 `flexStart`。每段枝条：

- 将长度量化到 4–16 个纵向 segment；
- 沿切线生成平滑扰动和轻微抬升；
- 用 tangent/normal/binormal 构造管状截面；
- 使用深度相关的半径衰减和 bark 颜色；
- 记录 perch；
- 在外层深度递归生成子枝和叶片。

`flex` 是距树根的归一化弹性坐标，不是鸟的骨骼动画数据。树皮 vertex shader 使用它让根部稳定、尖端受风更明显；鸟落枝时通过 `uLand/uLandK` 让落点附近发生衰减弹簧下沉。

## 天空、月亮与云

天空是半径 600 的反向球面 shader：

- `uZenith/uHorizon` 形成高度渐变；
- dusk look 依据太阳方位构造暖色带，而不是整屏染橙；
- `uNight` 开启角度/高度网格星场，每个 cell 一个候选星，亮度和闪烁由 hash 决定；
- 月亮是独立半透明球面，使用多层 fbm 生成月海、陨石坑、高地和细颗粒；
- 月亮白天与夜间使用不同表面颜色，阴影侧通过 alpha 透出背后的天空。

云层是第二个反向球面 shader，核心是两层 procedural deck：远层小而淡，近层大而有体积。`uShelterA/B/C` 代表标题、目录和日期的保护区。shader 只在保护区附近支付 warp/noise 成本，并提高阈值使云自然分开，而不是切出一条几何硬边。

## 叶片系统

叶片不是逐个 Mesh，而是 `InstancedBufferGeometry`：

- 4 格 atlas 贴图；
- 每个实例有 `instanceMatrix`、`aTint`、`aWindI`、`aUvCell`；
- vertex shader 以叶柄为铰链做旋转；
- `episode + smoothstep` 让叶片以“阵风事件”方式颤动，而非持续抖动；
- `uInertia` 支持 gust kick、overshoot、ringing settle；
- fragment shader 区分正反面、环境半球光、透射、镜面和日/夜色调。

另有稀疏叶片批次，用于近景或薄层叶片，限制在约 1300 个实例以内以控制移动端负载。

## 鸟与动画状态机

`tit.glb` 加载后由 `setupBirdActor()` 重建材质并创建 `AnimationMixer`。模型动画有 `flap`、`perch`、`fold` 三段，运行时：

- 给左右翅膀插入 `wristL/wristR` 骨骼；
- 按顶点到翼根的距离重新分配 skin weight；
- 对 body/head/tail 做几何整形；
- 保存关键骨骼的 rest quaternion/scale，供每帧叠加姿态。

状态为 `away`、`cross`、`in`、`perched`、`out`：

- `startBirdCrossing()`：从屏幕一侧沿三次贝塞尔曲线横穿；
- `startBirdArrival()`：从外部飞入选定 perch；
- `perchBird()`：固定在枝条上，随机触发 tail/shuffle/peer/hop 微动作；
- `departBird()`：从枝条飞离并更新 `uLand`；
- `hideBird()`：隐藏鸟和 clone。

飞行路径预先建立 64 段弧长表，运行时以二分查找把时间映射为近似匀速位置。`applyBirdAnimation()` 混合 flap/perch/fold 权重，并叠加 head tracking、tail、wrist 和 body roll。

## 后期与景深

引擎没有使用 EffectComposer，而是手写 render-target 管线：

1. 渲染天空到 `skyRenderTarget`；
2. 渲染云层并叠加到天空；
3. 渲染树和鸟到 `sceneRenderTarget`；
4. 用 72 次展开采样的径向散景 shader 生成前景/背景 blur；
5. grade shader 合成 `fol/folB/sky/skyB`，执行 ACES、色差、辉光、颗粒、暗角和伽马输出。

景深焦点由树/鸟距离和相机状态平滑追踪，`setBlur(false)` 会将前后景 blur uniform 归零，但保留合成管线。

## Look 系统

四套颜色参数对象分别描述 day、night、dusk、morning，包括天空、太阳方向、太阳光、半球光和叶片三种颜色。`applyLookUniforms(dusk, night, morning)` 对这些参数做线性插值，同时切换 CSS class。公开的默认 look 是 `day`，UI 提供 Noon/Night/Morning 三个色 swatch。

## 响应式与性能策略

- 900px 是桌面布局断点，桌面使用 12 栏 grid；移动端使用纵向 flex；
- 通过 `setViewOffset` 对窄屏进行裁切，而不是改变透视关系；
- DPR 上限约 1.5，render target 高度上限约 1150；
- blur target 使用半分辨率；
- renderer 禁用 antialias，依赖后处理；
- `prefers-reduced-motion` 时降低风、冻结颗粒相位、跳过鸟的主动动画；
- 页面不可见、窗口 blur 或滚动离开区域时暂停/降频；
- 帧循环按状态限频：飞行状态比静止状态更高频。

## 公开 API 语义

| API | 语义 |
|---|---|
| `setLook(name)` | 切换 day/night/dusk/morning 目标参数并平滑过渡 |
| `setShelters(a,b,c)` | 更新云层 shader 的三个文本保护矩形 |
| `setSpeed(value)` | 设置动画时间倍率，默认 1 |
| `setBlur(value)` | 开关前景/背景散景 |
| `cue()` | `perched` 时让鸟离开，`away` 时让鸟开始横穿 |
| `dispose()` | 停止循环、移除监听、释放 geometry/material/texture/render target 和 DOM |

额外 getter：`look`、`seed`、`ready`、`bird`、`birdXY`。

## 设计评价

这是一个“内容 DOM + GPU atmosphere + 小型状态机”的组合，而不是单纯动画背景。最值得复用的设计判断有三点：

1. 文字保持 DOM，既保证 SEO/可访问性，又允许 shader 根据真实布局生成保护区；
2. 复杂视觉拆成天空、云、主体、后期四个 render stage，避免把所有逻辑塞进单一材质；
3. 所有随机视觉都由 seed 或局部 hash 控制，保证树形、星场和叶片分布稳定，同时让鸟的行为保持生命感。

## 尚存不确定性

没有 source map、原始 TypeScript 类型或设计稿，因此无法确认原作者的精确命名、部分常量的设计稿来源，以及若干鸟状态变量的产品命名。算法职责、数据流、公开 API 和渲染顺序已有直接代码证据；低置信度名称应视为学习用语义标签，不应当当作原始源码恢复。

## 本轮语义恢复增量（round2：全量收尾）

round1 的 `semantic-rename.js` 有意只覆盖高置信度作用域，并把无法安全盲扫的残留留给了显式映射。round2（`C:/tmp/fable-hero-reverse/ast-tools/semantic-rename-round2.js`）补齐了全部残留：

- 引擎约 **800 处**单字母 binding（含 480 个函数参数）全部语义化，覆盖树生成器内部、选枝、叶片 atlas 绘制、树重建/叶片实例化与碰撞分离、GLTF 鸟整形、wrist 骨骼插入、拍翼时间表、飞行路径、look 混合、resize/render-target、镜头取景和渲染循环；
- 机制与 round1 相同：`scope.rename` 只改本作用域声明的 binding，键控为 `声明行:字母`（深度优先解决少数同行冲突，输给更深作用域的那些 binding 由精确结构谓词的 Pass B 兜底）；
- 加了两道防护：同作用域重名守卫（目标名已存在于本作用域则跳过报错），以及结尾的全量扫描（任何残留单字母 binding 都会报出）。

## 完成度与验证边界

当前语义产物中的 engine 和 React component **已清除全部单字母 binding**（引擎变量声明与函数参数均为 0 残留）。验证链全部通过：

- `node --check` 通过；
- **TDZ 校验**（`tools/check-tdz.js`：找出同块内 `let/const` 在声明前被引用的情况）通过 —— 见下方"验证盲区"；
- engine AST 结构归一化比较 `equal=true`（忽略标识符名、位置和格式差异）；
- 树生成器 seed 0/1/42/123456789/0xffffffff 的 positions/normals/colors/flex/uvs/indices 逐项相等；
- 浏览器渲染对比：round2 与 round1 同条件 1440×1000 截图，平均像素差约 2/255（动画帧时序差异，结构一致），hero 资源全部加载、无 JS 报错。

### 验证盲区（2026-09-19 发现并修复）

把引擎拼成独立 bundle 供站点使用时，浏览器抛 `ReferenceError: Cannot access 'skeleton' before initialization`，
`ready=false`（bird 加载中断）。根因是 round2 的一处重命名：

```js
for (let [skeleton, meshList] of skeletonMap) {   // 循环变量
  let bones = skeleton.bones.slice(), ...          // ← 引用
  let skeleton = new THREE.Skeleton(bones, ...);   // ← 同块内后声明的 let，遮蔽并触发 TDZ
```

这条 bug **前面三道验证全部漏过**：AST 结构等价比较忽略标识符名，所以"两个不同的绑定被改成同名"对它是
不可见的；树生成器回归不经过这条代码路径；渲染像素差里树与天空占绝对主导，鸟这条分支失败只影响很小
一块区域。教训是：**AST 等价只能证明"结构没变"，不能证明"改名后语义没变"**——必须补一条能感知
作用域/TDZ 的检查。现在 `tools/check-tdz.js` 已加入验证链。

另外两点：round1 版本这条 TDZ 是干净的，说明该 bug 由 round2 引入；round2 早期还修掉过一处同作用域重名
（`resize()` 的 width 变量）与一处遮蔽自赋值（`arrivalWingFold`）。

由于没有 source map，语义名是基于数据流和调用关系恢复的学习标签，不等同于作者原始命名；`three-js.formatted.js`
保持原样，作为库依赖跳过语义改名。


最终校验补充：React 装配层也已完成作用域级语义改名。engine 与 component 均通过 `node --check`；AST 结构归一化比较均为 `equal=true`；engine 树生成器五组 seed 的 geometry 数组逐项相等。
