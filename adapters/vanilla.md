# 技术栈适配 · 原生（vanilla）

> 本文件是唯一允许出现具体技术写法的层。通用规格 + 本适配层 = 可执行的完整需求。

## 语言与写法
- 使用原生 HTML + CSS + JavaScript（ES2020+），不使用任何框架与构建工具。
- 默认单文件交付：一个 `demo.html` 内含结构、样式、脚本；如需拆分，拆成 `index.html` + `style.css` + `main.js` 三件套。
- 脚本使用 `<script type="module">` 或 IIFE，避免污染全局；必须在文件末尾清理事件监听与动画帧。

## 样式
- 使用 CSS 变量管理颜色、间距、圆角、时长；变量挂在 `:root` 或组件根节点。
- 布局优先 flex / grid；不引入 CSS 框架，不写内联样式（动态值除外）。
- 类名用「块-元素-修饰」风格，如 `card`、`card__title`、`card--active`。

## 依赖与性能
- 零依赖：不加载任何 CDN 资源，不使用外部字体与图标库。
- 动画优先 CSS transform / opacity；必须用 JS 时使用 `requestAnimationFrame`，并在 `visibilitychange` 或卸载时停止。
- 事件监听使用 `addEventListener`，清理时使用 `AbortController` 或保存引用后 `removeEventListener`。

## 输出约定
- 所有交互必须可用键盘完成（`tabindex`、`Enter`/`Space`、`focus-visible`）。
- 不生成构建配置、不生成 package.json。
- 注释使用中文，解释"为什么"而不是"做了什么"。
