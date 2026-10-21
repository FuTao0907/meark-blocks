<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import BaseIcon from './BaseIcon.vue'

const emit = defineEmits<{ close: [] }>()

let previousOverflow = ''

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="about" role="dialog" aria-modal="true" aria-labelledby="about-title">
    <header class="about__bar">
      <span class="about__brand">
        <span class="about__mark"><BaseIcon name="blocks" :size="17" /></span>
        积木库
        <span class="about__crumb">关于</span>
      </span>
      <button type="button" class="icon-btn" aria-label="关闭关于页（Esc）" title="关闭（Esc）" @click="emit('close')">
        <BaseIcon name="close" :size="17" />
      </button>
    </header>

    <div class="about__scroll">
      <article class="about__body">
        <p class="about__lead">
          积木库把「想要的效果」翻译成 AI 能准确执行的规格：每块积木都有一个可独立运行的演示、一份与框架无关的提示词，以及一层按技术栈生成的适配说明。
        </p>

        <h2>这是什么</h2>
        <ul>
          <li>一个效果索引：按「感觉」找东西——发光、跟手、滚动、粒子……</li>
          <li>一份可直接粘贴的规格：复制的是给 AI 的施工说明，不是具体代码。</li>
          <li>一个组合器：把多块积木拼成一份完整的页面需求。</li>
        </ul>

        <h2>怎么用</h2>
        <ol>
          <li>用搜索或类型 / 场景筛选找到积木。标签会随当前结果收窄，没有内容的选项不会出现。</li>
          <li>打开积木看左侧演示，右侧是规格：目标、触发与行为、参数、可访问性、验收标准、避免事项。</li>
          <li>复制：只复制通用提示词，或「通用 + 技术栈适配层」。</li>
          <li>多选几块，生成一份组合需求，交给 AI 一次做完。</li>
        </ol>

        <h2>一块积木由什么组成</h2>
        <p><code>effects/&lt;id&gt;/</code> 下三个文件：</p>
        <ul>
          <li><code>meta.json</code> —— 名称、别名、类型、场景、感觉、参数、可访问性……站点的数据来源。</li>
          <li>
            <code>prompt.md</code> —— 通用提示词，固定七段：目标 / 触发与行为 / 参数 / 通用规格 / 可访问性 /
            验收标准 / 不适用或避免。
          </li>
          <li><code>demo.html</code> —— 可独立运行的演示，零外部资源，桌面版式 1024×640，在详情页里等比缩放。</li>
        </ul>

        <h2>为什么「与框架无关」</h2>
        <p>
          通用提示词里不允许出现 <code>React</code>、<code>useState</code>、<code>className</code>、<code>Vue</code>、<code>&lt;script setup&gt;</code>
          这类技术栈写法，构建时会逐块检查，违反直接失败。技术栈差异全部收进适配层：
          <code>adapters/vanilla.md</code>、<code>adapters/vue3.md</code>、<code>adapters/react.md</code>。
        </p>
        <p>
          右上角的项目画像（技术栈 / 样式 / 依赖 / 输出）会在复制时自动追加「本次项目约束」，所以同一份通用提示词可以复用到不同项目。
        </p>

        <h2>演示与可访问性</h2>
        <ul>
          <li>演示默认跟随系统「减少动态效果」：开启后自动降级为静态版本。</li>
          <li>详情页演示下方可强制播放动效，也可以在地址后加 <code>?motion=1</code>。</li>
          <li>组件类积木都带键盘操作与 aria 说明，弹层支持 Esc 关闭、焦点回到触发按钮。</li>
          <li>站点支持浅色 / 深色两套主题，切换记在本地；首屏不会闪白。</li>
        </ul>

        <h2>本地开发</h2>
        <pre><code>npm install
npm run dev      # 本地预览
npm run catalog  # 由 effects/ 重建 public/catalog.json
npm run check    # 构建 + 检查提示词禁词
npm run build    # 产出 dist/</code></pre>

        <h2>新增一块积木</h2>
        <p>
          在 <code>effects/&lt;id&gt;/</code> 放好 <code>meta.json</code>、<code>prompt.md</code>、<code>demo.html</code>，然后
          <code>npm run catalog</code>。演示要零外链、按 1024×640 桌面版式；提示词按七段写，不要在通用层写死技术栈。
        </p>

        <h2>部署</h2>
        <p>
          纯静态站点，推送到 <code>main</code> 后由 GitHub Actions 构建并发布到 GitHub Pages：
          <a href="https://futao0907.github.io/meark-blocks/" target="_blank" rel="noreferrer noopener">futao0907.github.io/meark-blocks</a>。
        </p>

        <h2>快捷键</h2>
        <ul>
          <li><kbd>/</kbd> 或 <kbd>Ctrl</kbd>+<kbd>K</kbd> 打开搜索</li>
          <li><kbd>Esc</kbd> 关闭搜索、关于页与详情页</li>
        </ul>

        <footer class="about__foot">
          <span>v0.2 · 20 块积木 · 2026-10</span>
          <a href="https://github.com/FuTao0907/meark-blocks" target="_blank" rel="noreferrer noopener">
            源码与更新日志
            <BaseIcon name="external" :size="12" />
          </a>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
.about {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  animation: about-in 180ms ease;
}

@keyframes about-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.about__bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px max(22px, calc((100% - 1180px) / 2 + 22px));
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}

.about__brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.about__mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  color: var(--accent);
}

.about__crumb {
  color: var(--muted);
  font-weight: 400;
}

.about__scroll {
  flex: 1;
  overflow-y: auto;
}

.about__body {
  max-width: 720px;
  margin: 0 auto;
  padding: 38px 22px 96px;
  color: var(--text-regular);
  font-size: 14px;
  line-height: 1.85;
}

.about__lead {
  margin: 0 0 8px;
  color: var(--text);
  font-size: 15px;
  line-height: 1.8;
}

.about__body h2 {
  margin: 34px 0 8px;
  color: var(--text);
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.about__body p {
  margin: 8px 0;
}

.about__body ul,
.about__body ol {
  margin: 8px 0;
  padding-left: 20px;
}

.about__body li {
  margin: 5px 0;
}

.about__body li::marker {
  color: var(--placeholder);
}

.about__body code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-soft);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
}

.about__body pre {
  margin: 10px 0;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--sunken);
  overflow-x: auto;
}

.about__body pre code {
  padding: 0;
  background: transparent;
  font-size: 12px;
  line-height: 1.9;
}

.about__body kbd {
  padding: 1px 5px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--panel);
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-regular);
}

.about__body a {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.about__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 42px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 640px) {
  .about__bar {
    padding: 12px 14px;
  }

  .about__body {
    padding: 26px 16px 72px;
    font-size: 13.5px;
  }
}
</style>
