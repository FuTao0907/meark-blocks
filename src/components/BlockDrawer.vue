<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PromptViewer from './PromptViewer.vue'
import { useClipboard } from '../composables/useClipboard'
import { CATEGORY_LABELS, FEEL_LABELS, SCENE_LABELS, labelOf } from '../constants'
import type { Block } from '../types'

const props = defineProps<{ block: Block; adapter: string }>()
const emit = defineEmits<{ close: [] }>()

const { copy, copiedKey } = useClipboard()
const showPreview = ref(false)

const universalPrompt = computed(() => props.block.promptRaw)
const fullPrompt = computed(() => `${props.block.promptRaw}\n\n【技术栈适配】\n${props.adapter}`.trim())
const demoUrl = computed(() => `${import.meta.env.BASE_URL}effects/${props.block.id}/demo.html`)

const sceneText = computed(() =>
  props.block.scenes.map((s) => labelOf(SCENE_LABELS, s)).join(' / ') || '通用',
)
const feelText = computed(() => props.block.feel.map((f) => labelOf(FEEL_LABELS, f)).join(' / ') || '—')
const categoryText = computed(() => labelOf(CATEGORY_LABELS, props.block.category))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <aside class="drawer" role="dialog" aria-modal="true" :aria-label="block.name">
      <header class="drawer__head">
        <div>
          <div class="drawer__cat">{{ categoryText }}</div>
          <h2 class="drawer__name">{{ block.name }}</h2>
          <p class="drawer__aka">{{ block.aka.join(' / ') }}</p>
        </div>
        <button type="button" class="drawer__close" aria-label="关闭" @click="emit('close')">×</button>
      </header>

      <div class="drawer__actions">
        <button type="button" class="btn btn--primary btn--sm" @click="copy(universalPrompt, 'universal')">
          {{ copiedKey === 'universal' ? '已复制 ✓' : '复制通用提示词' }}
        </button>
        <button type="button" class="btn btn--sm" @click="copy(fullPrompt, 'full')">
          {{ copiedKey === 'full' ? '已复制 ✓' : '复制 + 技术栈适配' }}
        </button>
        <button type="button" class="btn btn--ghost btn--sm" @click="showPreview = !showPreview">
          {{ showPreview ? '收起演示' : '查看演示' }}
        </button>
      </div>

      <div v-if="showPreview" class="drawer__preview">
        <iframe :src="demoUrl" sandbox="allow-scripts" title="效果演示" loading="lazy"></iframe>
      </div>

      <div class="drawer__meta">
        <div class="meta"><span>适用场景</span><b>{{ sceneText }}</b></div>
        <div class="meta"><span>感觉</span><b>{{ feelText }}</b></div>
        <div class="meta"><span>可访问性</span><b>{{ block.a11y }}</b></div>
        <div class="meta"><span>不适用</span><b>{{ block.notFor.join(' / ') || '—' }}</b></div>
      </div>

      <div v-if="block.params.length" class="drawer__params">
        <h3 class="drawer__h3">参数</h3>
        <table>
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
      </div>

      <h3 class="drawer__h3">通用规格（与框架无关）</h3>
      <PromptViewer :prompt="block.prompt" />

      <h3 class="drawer__h3">技术栈适配（复制时附加）</h3>
      <pre class="drawer__adapter">{{ adapter }}</pre>
    </aside>
  </div>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 51;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(660px, 100%);
  overflow-y: auto;
  padding: 22px 24px 48px;
  border-left: 1px solid var(--line);
  background: #0b1222;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
  animation: slide-in 220ms ease;
}

@keyframes slide-in {
  from { transform: translateX(28px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.drawer__head { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; }

.drawer__cat { font-size: 11px; letter-spacing: 1px; color: var(--accent); }

.drawer__name { margin: 6px 0 4px; font-size: 21px; }

.drawer__aka { margin: 0; font-size: 12px; color: var(--muted); }

.drawer__close {
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
}

.drawer__close:hover { color: var(--text); border-color: var(--accent); }

.drawer__actions { display: flex; flex-wrap: wrap; gap: 8px; }

.drawer__preview {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: #0d1324;
}

.drawer__preview iframe { display: block; width: 100%; height: 360px; border: 0; }

.drawer__meta { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }

.meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 11px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.meta span { font-size: 10.5px; color: var(--muted); }

.meta b { font-weight: 500; color: #cfdaee; }

.drawer__h3 { margin: 6px 0 0; font-size: 12.5px; letter-spacing: 0.5px; color: var(--muted); }

.drawer__params table { width: 100%; border-collapse: collapse; font-size: 12px; }

.drawer__params th {
  padding: 7px 9px;
  text-align: left;
  font-weight: 500;
  color: var(--muted);
  border-bottom: 1px solid var(--line-soft);
}

.drawer__params td { padding: 7px 9px; color: #c6d2e8; border-bottom: 1px solid var(--line-soft); }

code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--panel);
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--accent);
}

.drawer__adapter {
  margin: 0;
  padding: 13px;
  overflow-x: auto;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  background: rgba(11, 17, 30, 0.6);
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.7;
  color: #9fb0cc;
  white-space: pre-wrap;
}
</style>
