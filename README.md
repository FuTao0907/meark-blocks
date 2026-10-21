# 积木库 · meark-blocks

把「我想要的效果」翻译成「AI 能准确执行的规格」，并支持像积木一样拼装。

**核心约定：提示词与框架无关。** 通用规格里不出现任何 React / Vue 写法；技术栈写法只存在于 `adapters/`，复制时按「项目画像」自动附加。

## 当前积木（20 块）

| 分类 | 积木 |
|---|---|
| 动画 | 文字逐行入场 `text-reveal`、滚动视差 `scroll-parallax`、数字增长 `number-countup`、渐变流动背景 `gradient-flow` |
| 交互 | 光斑跟随卡片 `hover-spotlight`、磁吸按钮 `magnetic-button`、悬停预览 `hover-preview`、惯性拖拽 `inertia-drag` |
| 布局 | 瀑布流 `masonry-grid`、Bento 网格 `bento-grid`、粘性侧栏 `sticky-sidebar` |
| 组件 | 标签输入 `tag-input`、分段控件 `segmented-control`、数据卡片 `data-card` |
| Canvas | 粒子跟随 `particle-follow`、噪声波浪背景 `noise-wave` |
| 视觉 | 玻璃拟态 `glassmorphism`、噪点纹理 `noise-texture` |
| 反馈 | 骨架屏 `skeleton-screen`、Toast 队列 `toast-queue` |

## 快速开始

```bash
npm install
npm run dev      # 生成 catalog.json 并启动开发服务器
npm run build    # 生成 catalog.json 并构建到 dist/
npm run check    # 只校验积木，不写文件
```

## 新增一块积木

在 `effects/<id>/` 下放三个文件，然后 `npm run catalog`：

```
effects/hover-spotlight/
├─ meta.json     # 元数据与参数
├─ prompt.md     # 7 段通用规格
└─ demo.html     # 零外链原生演示
```

### prompt.md 必须包含以下七个二级标题

```markdown
## 目标
## 触发与行为
## 参数
## 技术中性约束
## 降级与可访问性
## 验收
## 不要做
```

### 通用层禁词

构建脚本会扫描 `prompt.md`，出现下列内容直接失败：

`React` `useState` `useEffect` `useRef` `Vue` `reactive` `defineComponent` `onMounted` `className` `ref(` `.vue` `.jsx` `<script setup>`

如果你的描述确实需要提到某个框架，把它写进 `adapters/<stack>.md`，而不是 `prompt.md`。

## 设计系统

- **主站外壳**：`src/styles/main.css` 定义唯一一套 token（`--bg / --panel / --line / --text / --muted / --accent`）、三档圆角（`--radius-field / --radius-card / --radius-pill`）和三个控件类：`.chip`（标签/筛选项共用）、`.btn`（只有 primary 与 ghost）、`.field`（输入框与下拉共用）。
- **demo 共享基础层**：`effects/shared/base.css` 提供同一套 token、字体栈、页面底色与滚动条；每个 demo 通过 `<link rel="stylesheet" href="../shared/base.css" />` 引用，构建时自动复制到 `public/effects/shared/`。
- **重要规则**：**不要统一 demo 内部的按钮、卡片、标签样式**。玻璃拟态、磁吸按钮、数据卡片各自的表现正是这个库的内容，统一了演示就失去意义。

## 演示动效开关

demo 默认遵循系统「减少动态效果」（`prefers-reduced-motion`）。如果你的系统开了这个选项，动画类 demo 会显示为静态降级版。

在 demo URL 后加 `?motion=1` 可强制播放完整动效；站点详情页默认已开启，并可在演示下方切换。

## 目录

```
effects/        积木（数据源）
adapters/       技术栈适配层
scripts/        构建与校验
src/            站点（Vue 3）
public/         构建产物：catalog.json + demo 副本
docs/PRD.md     产品文档
```

## 部署

```bash
# GitHub Pages 子路径
VITE_BASE=/meark-blocks/ npm run build
```

`public/CNAME` 内容为 `blocks.meark.cn`，DNS 加 CNAME 指向 GitHub Pages 或 Cloudflare Pages。
