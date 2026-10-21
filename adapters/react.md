# 技术栈适配 · React

> 本文件是唯一允许出现具体技术写的层。通用规格 + 本适配层 = 可执行的完整需求。

## 语言与写法
- React 18+ 函数组件 + TypeScript；不使用 class 组件。
- 状态用 `useState`，派生值直接计算或用 `useMemo`，副作用用 `useEffect`。
- 必须直操 DOM 时用 `useRef`；`addEventListener`、`requestAnimationFrame`、`IntersectionObserver`、`ResizeObserver` 必须在 `useEffect` 的清理函数中释放。
- 遵循 hooks 规则：不在条件分支或循环中调用 hooks。

## 样式
- 优先 CSS Modules（`*.module.css`）；不使用 Tailwind 除非需求明确要求。
- 颜色、间距、时长用 CSS 变量；动态值通过 `style` 传 CSS 变量对象，而不是拼接整段样式。
- 不使用 MUI / Ant Design 等 UI 库，除非需求明确要求。

## 依赖与性能
- 零依赖：不引入第三方动画库；优先 CSS 动画与原生 API。
- 组件拆分：一个效果一个组件，props 类型显式声明，提供默认值。
- 避免在渲染函数中创建新对象/数组导致子组件无谓重渲染；必要时用 `useCallback` / `useMemo`。

## 输出约定
- 组件文件用 `PascalCase.tsx`，props 用 `interface XxxProps`。
- 不生成路由与全局状态管理，除非需求明确要求。
- 注释使用中文。
