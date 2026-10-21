<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PromptViewer from './PromptViewer.vue'
import { useClipboard } from '../composables/useClipboard'
import { CATEGORY_LABELS, FEEL_LABELS, SCENE_LABELS, labelOf } from '../constants'
import type { Block } from '../types'

const props = defineProps<{ block: Block; adapter: string }>()
const emit = defineEmits<{ close: [] }>()

const { copy, copiedKey } = useClipboard()

// 演示按桌面逻辑尺寸渲染再等比缩放：保证整个版式都能看到，而不是被窄栏裁掉
const LOGICAL_W = 1024
const LOGICAL_H = 640

const stageEl = ref<HTMLElement | null>(null)
const scale = ref(0.5)
const forceMotion = ref(true)
const systemReduce = ref(false)
const fullscreen = ref(false)

const demoUrl = computed(() => `${import.meta.env.BASE_URL}effects/${props.block.id}/demo.html`)
const demoSrc = computed(() => `${demoUrl.value}${forceMotion.value ? '?motion=1' : ''}`)
const frameStyle = computed(() => ({
  width: `${LOGICAL_W}px`,
  height: `${LOGICAL_H}px`,
  transform: `scale(${scale.value})`,
}))
const stageStyle = computed(() => ({ height: `${Math.round(LOGICAL_H * scale.value)}px` }))

const universalPrompt = computed(() => props.block.promptRaw)
const fullPrompt = computed(() => `${props.block.promptRaw}\n\n【技术栈适配】\n${props.adapter}`.trim())

const sceneText = computed(
  () => props.block.scenes.map((s) => labelOf(SCENE_LABELS, s)).join(' / ') || '通用',
)
const feelText = computed(() => props.block.feel.map((f) => labelOf(FEEL_LABELS, f)).join(' / ') || '—')
const categoryText = computed(() => labelOf(CATEGORY_LABELS, props.block.category))

let ro: ResizeObserver | null = null

function measure() {
  if (!stageEl.value) return
  const w = stageEl.value.clientWidth
  if (w > 0) scale.value = Math.min(1, w / LOGICAL_W)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (fullscreen.value) {
    fullscreen.value = false
    return
  }
  emit('close')
}

onMounted(() => {
  measure()
  systemReduce.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typeof ResizeObserver !== 'undefined' && stageEl.value) {
    ro = new ResizeObserver(measure)
    ro.observe(stageEl.value)
  }
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <section class="page" role="dialog" aria-modal="true" :aria-label="block.name">
      <header class="page__head">
        <div class="page__identity">
          <span class="page__cat">{{ categoryText }}</span>
          <h2 class="page__name">{{ block.name }}</h2>
          <p class="page__aka">{{ block.aka.join(' / ') }}</p>
        </div>
        <div class="page__actions">
          <button type="button" class="btn btn--primary btn--sm" @click="copy(universalPrompt, 'universal')">
            {{ copiedKey === 'universal' ? '已复制 ✓' : '复制通用提示词' }}
          </button>
          <button type="button" class="btn btn--sm" @click="copy(fullPrompt, 'full')">
            {{ copiedKey === 'full' ? '已复制 ✓' : '复制 + 技术栈适配' }}
          </button>
          <button type="button" class="btn btn--ghost btn--sm" @click="fullscreen = true">全屏预览</button>
          <button type="button" class="page__close" aria-label="关闭" @click="emit('close')">×</button>
        </div>
      </header>

      <div class="page__body">
        <div class="page__demo">
          <div ref="stageEl" class="stage" :style="stageStyle">
            <iframe
              :src="demoSrc"
              :style="frameStyle"
              sandbox="allow-scripts allow-forms"
              title="效果演示"
            ></iframe>
          </div>
          <div class="page__note">
            <p>
              演示按 {{ LOGICAL_W }}×{{ LOGICAL_H }} 渲染并等比缩放（当前 {{ Math.round(scale * 100) }}%），
              完整展示桌面版式；需要原始尺寸请点右上「全屏预览」。
            </p>
            <label class="motion-toggle">
              <input v-model="forceMotion" type="checkbox" />
              <span>强制播放动效（忽略系统的「减少动态效果」）</span>
            </label>
            <p v-if="systemReduce" class="motion-warn">
              检测到系统开启了「减少动态效果」，演示原本会自动降级为静态版本；上方开关已默认打开，关闭后即遵循系统设置。
            </p>
          </div>
        </div>

        <div class="page__sheet">
          <div class="meta-grid">
            <div class="meta"><span>适用场景</span><b>{{ sceneText }}</b></div>
            <div class="meta"><span>感觉</span><b>{{ feelText }}</b></div>
            <div class="meta meta--wide"><span>可访问性</span><b>{{ block.a11y }}</b></div>
            <div class="meta meta--wide"><span>不适用</span><b>{{ block.notFor.join(' / ') || '—' }}</b></div>
          </div>

          <section v-if="block.params.length" class="sheet-block">
            <h3 class="sheet-title">参数</h3>
            <table class="params">
              <thead>
                <tr><th>占位符</th><th>含义</th><th>默认</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in block.params" :key="p.key">
                  <td><code v-text="'{{' + p.key + '}}'"></code></td>
                  <td>{{ p.label }}</td>
                  <td>{{ p.default }}{{ p.unit ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="sheet-block">
            <h3 class="sheet-title">通用规格（与框架无关）</h3>
            <PromptViewer :prompt="block.prompt" />
          </section>

          <section class="sheet-block">
            <h3 class="sheet-title">技术栈适配（复制时附加）</h3>
            <pre class="adapter">{{ adapter }}</pre>
          </section>
        </div>
      </div>
    </section>

    <div v-if="fullscreen" class="fs" role="dialog" aria-label="全屏演示">
      <iframe :src="demoSrc" sandbox="allow-scripts allow-forms" title="全屏演示"></iframe>
      <button type="button" class="fs__close" aria-label="退出全屏" @click="fullscreen = false">×</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: fixed;
  inset: 0;
  z-index: 51;
  display: flex;
  flex-direction: column;
  background: #0b1222;
  animation: page-in 200ms ease;
}

@keyframes page-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page__head {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line-soft);
  background: rgba(11, 18, 34, 0.94);
}

.page__cat { font-size: 11px; letter-spacing: 1px; color: var(--accent); }

.page__name { margin: 4px 0 3px; font-size: 20px; }

.page__aka { margin: 0; font-size: 12px; color: var(--muted); }

.page__actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

.page__close {
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.page__close:hover { color: var(--text); border-color: var(--accent); }

.page__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(400px, 0.92fr);
}

.page__demo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;
  overflow-y: auto;
  border-right: 1px solid var(--line-soft);
}

.stage {
  position: relative;
  overflow: hidden;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #0d1324;
}

.stage iframe {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  transform-origin: top left;
}

.page__note {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 12px 2px 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: #61708f;
}

.page__note p { margin: 0; }

.motion-toggle {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #8b9ab8;
  cursor: pointer;
}

.motion-toggle input { accent-color: var(--accent); }

.motion-warn {
  padding: 8px 10px;
  border: 1px solid rgba(251, 191, 36, 0.32);
  border-radius: 8px;
  background: rgba(251, 191, 36, 0.08);
  color: #d9b56b;
}

.fs { position: fixed; inset: 0; z-index: 60; background: #0b1022; }

.fs iframe { display: block; width: 100%; height: 100%; border: 0; }

.fs__close {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 61;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(11, 17, 30, 0.9);
  color: var(--text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.fs__close:hover { border-color: var(--accent); }

.page__sheet { padding: 20px 24px 60px; overflow-y: auto; }

.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 22px; }

.meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 11px;
  border: 1px solid var(--line-soft);
  border-radius: 9px;
  font-size: 12px;
}

.meta--wide { grid-column: 1 / -1; }

.meta span { font-size: 10.5px; color: var(--muted); }

.meta b { font-weight: 500; color: #cfdaee; }

.sheet-block { margin-bottom: 26px; }

.sheet-title {
  margin: 0 0 10px;
  font-size: 12.5px;
  letter-spacing: 0.5px;
  color: var(--muted);
}

.params { width: 100%; border-collapse: collapse; font-size: 12px; }

.params th {
  padding: 7px 9px;
  text-align: left;
  font-weight: 500;
  color: var(--muted);
  border-bottom: 1px solid var(--line-soft);
}

.params td { padding: 7px 9px; color: #c6d2e8; border-bottom: 1px solid var(--line-soft); }

code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--panel);
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--accent);
}

.adapter {
  margin: 0;
  padding: 14px;
  border: 1px solid var(--line-soft);
  border-radius: 9px;
  background: rgba(11, 17, 30, 0.7);
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.75;
  color: #9fb0cc;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .page__head { padding: 12px 14px; }
  .page__body { display: block; overflow-y: auto; }
  .page__demo { border-right: 0; border-bottom: 1px solid var(--line-soft); overflow: visible; }
  .page__sheet { overflow: visible; padding: 16px 14px 60px; }
  .meta-grid { grid-template-columns: 1fr; }
}
</style>
