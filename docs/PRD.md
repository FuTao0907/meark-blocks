# 积木库（meark-blocks）· PRD

> 一句话：把「我想要的效果」翻译成「AI 能准确执行的规格」，并支持像积木一样拼装。
> 形态：纯前端静态站，部署到 `blocks.meark.cn`（GitHub Pages 或 Cloudflare Pages）。

- 版本：v0.1（P0）
- 日期：2026-10-21
- 负责人：本人（个人使用）
- 状态：M1–M5 完成，20 块积木就绪并通过校验，待部署

---

## 1. 背景与问题

做前端时间不长，工作中拿到明确需求能完成；但生活里冒出一个想法时，**不知道怎么把它说清楚**——要什么动画、什么交互、什么 UI 表现、什么组件、是否用 Canvas、有什么设计约束。

于是每次都要从零组织语言，AI 也经常理解偏。核心问题不是"不会写代码"，而是**不会把感觉翻译成规格**。

四个具体痛点：

| 痛点 | 表现 |
|---|---|
| 叫不出名字 | 想搜"鼠标跟着动的东西"，但不知道它叫"光斑跟随" |
| 描述不准 | 只说"好看一点"，AI 自由发挥，结果不是想要的 |
| 技术栈错位 | 拿到 React 写法，但项目是 Vue，不能直接用 |
| 容易超纲 | 没写"不要做什么"，AI 加了一堆没要的动效 |

---

## 2. 产品定位

**不是效果展示站，是提示词规格库 + 拼装器。**

- 展示只是索引，真正的资产是每块积木的**结构化提示词**。
- 一块积木 = 一个可独立运行的演示 + 一份**与框架无关**的规格 + 元数据。
- 使用方式：带着"感觉"来检索 → 复制规格 或 多选拼装 → 交给 AI 在指定技术栈里实现。

---

## 3. 目标用户与场景

**主用户**：本人。前端经验有限，有想法但难以准确描述，日常用 AI 辅助实现。

**典型场景**：
1. 想给作品集加个滚动效果 → 搜"滚动出现" → 复制规格 → 让 AI 在 Vue 项目里实现。
2. 想做一个落地页 → 选 3 块积木 → 拼装器生成完整需求 → 一次交付。
3. 不确定某效果适不适合移动端 → 看积木的「不适用」字段。

**非目标用户**：团队协作、多人共享、非前端使用者。

---

## 4. 核心设计原则

1. **展示是索引，规格是资产**。
2. **通用层与框架无关**：通用提示词中不得出现任何框架专有写法（构建期强制校验）。
3. **技术栈通过适配层注入**：写法约定只存在于 `adapters/`。
4. **演示零外链**：每块 `demo.html` 可独立运行，不请求任何外部资源。
5. **每块必须写「不要做」**：防 AI 过度发挥。
6. **宁可少而精**：P0 只做 20 块，不追求数量。

---

## 5. 提示词双层架构

### 5.1 通用层（Universal Spec）

固定 7 段，缺一不可：

| 段落 | 作用 |
|---|---|
| 目标 | 一句话说清解决什么问题 |
| 触发与行为 | 触发条件、状态变化、时序 |
| 参数 | 可调项 + 默认值 + 取值范围（`{{key}}` 占位） |
| 技术中性约束 | 零依赖、不改布局、性能上限 |
| 降级与可访问性 | reduced-motion、键盘、触摸替代 |
| 验收 | 可观测、可判定的检查点 |
| 不要做 | 明确禁止的加戏项 |

**禁词校验**：构建脚本扫描 `prompt.md`，命中 `React / useState / useEffect / useRef / Vue / reactive / defineComponent / onMounted / className / ref( / .vue / .jsx / <script setup>` 即构建失败。

### 5.2 适配层（Stack Adapter）

`adapters/` 下按技术栈一份：`vanilla.md`、`vue3.md`、`react.md`。包含写法约定、样式方案、依赖策略、文件命名、最小示例、禁止事项。**这是唯一允许出现框架写法的地方。**

### 5.3 拼接规则

```
【通用规格】（7 段，参数已替换）
【技术栈适配】（按项目画像选一份）
【页面上下文】（拼装器输出）
【全局约束】（共用设计变量、reduced-motion、375px 不横向滚动、不做额外功能）
```

### 5.4 项目画像（Profile）

`技术栈 / 样式方案 / 依赖策略 / 输出形态`，存 `localStorage`，可随时切换。

---

## 6. 数据模型

```
effects/<id>/
├─ meta.json     # 元数据与参数
├─ prompt.md     # 7 段通用规格
└─ demo.html     # 零外链原生演示
```

`meta.json` 字段：`id`（=目录名）、`name`、`aka[]`、`category`、`subcategory`、`scenes[]`、`feel[]`、`params[]`、`a11y`、`notFor[]`、`preview`、`version`、`updated`。

`params[]` 元素：`key`、`label`、`default`、`type`、`unit?`、`options?`。

构建产物 `public/catalog.json`：

```json
{
  "generatedAt": "...",
  "adapters": { "vanilla": "...", "vue3": "...", "react": "..." },
  "blocks": [{ "...meta": "...", "prompt": { "goal": "...", "behavior": "...", "params": "...", "constraints": "...", "a11y": "...", "acceptance": "...", "avoid": "..." }, "promptRaw": "..." }]
}
```

---

## 7. 功能范围

### P0（必须）

1. 检索：关键词（名称/别名/场景/感觉/规格正文）+ 类型筛选 + 场景筛选。
2. 卡片网格：名称、别名、类型、感觉标签、参数数量、场景。
3. 详情抽屉：完整规格、参数表、适用/不适用、可访问性、iframe 演示。
4. 一键复制：通用规格 / 通用 + 技术栈适配；Clipboard API 失败时降级。
5. 项目画像：切换技术栈 → 复制时附加对应适配层。
6. 拼装器：多选 → 生成组合需求（任务 + 页面结构 + 效果清单 + 适配 + 全局约束）。
7. 响应式（375px 起）、深色主题。

### P1（后续）
- 分类页 / 感觉标签页、最近使用、收藏（localStorage）。
- 积木数量扩到 100+。
- 同义词/模糊搜索。

### 非目标

- 不做后端、账号、云同步、数据收集。
- 不做在线编辑积木（新增 = 加目录 + 跑脚本）。
- 不做 AI 自动生成积木、不做多语言。

---

## 8. 技术方案

- Vite + Vue 3 + TypeScript。
- 原生 CSS + CSS 变量，不引入 UI 库。
- 单页 + 抽屉，不引入路由。
- 构建脚本 `scripts/build-catalog.mjs`：扫描、校验、生成 `public/catalog.json`、复制 demo。
- 演示用同源 iframe（`sandbox="allow-scripts"`）隔离。
- 无后端；`localStorage` 仅存项目画像。

### 目录结构

```
meark-blocks/
├─ docs/PRD.md
├─ effects/<id>/{meta.json, prompt.md, demo.html}
├─ adapters/{vanilla.md, vue3.md, react.md}
├─ scripts/build-catalog.mjs
├─ src/
│  ├─ App.vue  main.ts  constants.ts  types/
│  ├─ components/{SearchBar,FilterBar,BlockCard,BlockDrawer,PromptViewer,Composer,ProfileSwitcher}.vue
│  ├─ composables/{useCatalog,useClipboard,useProfile,useComposer}.ts
│  └─ styles/main.css
├─ public/{catalog.json, effects/}
├─ index.html  package.json  vite.config.ts  tsconfig.json
└─ README.md
```

### 构建期校验

1. `meta.json` 必填字段齐全；`id` 与目录名一致且唯一。
2. `prompt.md` 七个标题齐全且非空。
3. 通用层禁词扫描。
4. `demo.html` 不得引用外部网络资源（`www.w3.org` 白名单）。

---

## 9. 部署

- **GitHub Pages**：Actions 构建 → `dist`；`VITE_BASE=/meark-blocks/ npm run build`；`public/CNAME` 写入 `blocks.meark.cn`。
- **Cloudflare Pages**：构建命令 `npm run build`，输出 `dist`，绑定自定义域。
- **DNS**：`blocks.meark.cn` CNAME → `<user>.github.io` 或 `<project>.pages.dev`。

---

## 10. 里程碑

| 阶段 | 内容 | 状态 |
|---|---|---|
| M0 | 目录确定（`D:\07-Code\MeArks\meark-blocks`） | ✅ 已定 |
| M1 | 脚手架 + 构建校验脚本 + PRD | ✅ 完成 |
| M2 | 3 块样板积木（光斑/数字/粒子） | ✅ 完成并确认 |
| M3 | 铺满 20 块 | ✅ 完成（校验全绿） |
| M4 | 检索/卡片/抽屉/复制/画像 | ✅ 完成 |
| M5 | 拼装器 | ✅ 完成 |
| M6 | 部署 + 子域 | 待启动（需 GitHub 仓库与 DNS） |

---

## 11. 验收标准

- [ ] `npm run build` 通过，`npm run dev` 可启动
- [ ] 搜索"发光""鼠标跟随"命中光斑跟随卡片
- [ ] 复制出的通用规格不含任何框架字样
- [ ] 切换 Vue3 画像后，复制内容末尾出现 `【技术栈适配】`
- [ ] 每块 demo 可独立打开且无外部请求
- [ ] 375px 宽度无横向滚动
- [ ] 选 3 块能生成结构完整、无重复约束的组合需求
- [ ] 部署到子路径后资源全部 200

---

## 12. 风险与约束

| 风险 | 应对 |
|---|---|
| 内容生产是主要成本（20×3 文件） | 先 3 块定标准，再批量 |
| 通用规格质量不足 | 用 7 段式强制结构 + 实际跑一遍 AI 实现验证 |
| 适配层写错反而误导 | 每份附最小示例，实测 |
| 子路径部署 404 | `VITE_BASE` + 本地模拟验证 |
| 视觉观感无法自动验收 | 人工确认；如需自动截图需提权 |
