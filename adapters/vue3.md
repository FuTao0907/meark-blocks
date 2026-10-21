# 技术栈适配 · Vue 3

> 本文件是唯一允许出现具体技术写法的层。通用规格 + 本适配层 = 可执行的完整需求。

## 语言与写法
- Vue 3 `<script setup lang="ts">` + 组合式 API；单文件组件（`.vue`）。
- 响应式用 `ref` / `computed`；派生状态一律 `computed`，不要在 `watch` 里手写同步。
- 生命周期用 `onMounted` / `onBeforeUnmount`；事件监听、`requestAnimationFrame`、`IntersectionObserver`、`ResizeObserver` 必须在 `onBeforeUnmount` 中清理。
- 模板事件用 `@click="fn"`，不要用 `addEventListener` 直接绑 DOM（canvas 等必须直操 DOM 的场景除外，此时用模板 ref）。

## 样式
- `<style scoped>`；颜色、间距、时长用 CSS 变量，变量可放组件根或全局 `styles/tokens.css`。
- 不使用 Element / Ant Design 等 UI 库，除非需求明确要求。
- 动态样式通过 `:style` 绑定 CSS 变量，避免整块样式字符串拼接。

## 依赖与性能
- 零依赖：不引入第三方动画库（GSAP、anime.js 等）；优先 CSS 动画与原生 API。
- 组件粒度：一个效果一个组件，props 暴露通用规格里的参数，并提供默认值。
- 避免在 `setup` 顶层直接访问 `window` / `document`（SSR 与非 DOM 环境安全）。

## 输出约定
- 输出文件路径与组件名遵循 `PascalCase.vue`，props 用 `defineProps<{...}>()` 并带类型。
- 需要全局注册的组件在 `main.ts` 里显式引入。
- 注释使用中文。
