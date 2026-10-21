<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useClipboard } from '../composables/useClipboard'
import type { Block } from '../types'

const props = defineProps<{
  blocks: Block[]
  text: string
  title: string
}>()

const emit = defineEmits<{
  close: []
  remove: [id: string]
  'update:title': [value: string]
}>()

const { copy, copiedKey } = useClipboard()
const editable = ref(false)
const draft = ref(props.text)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function onTitleInput(event: Event) {
  emit('update:title', (event.target as HTMLInputElement).value)
}

function toggleEditable() {
  if (!editable.value) draft.value = props.text
  editable.value = !editable.value
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <section class="composer" role="dialog" aria-modal="true" aria-label="组合需求">
      <header class="composer__head">
        <div>
          <h2>组合需求</h2>
          <p>把 {{ blocks.length }} 块积木拼成一份可直接交给 AI 的需求</p>
        </div>
        <button type="button" class="composer__close" aria-label="关闭" @click="emit('close')">×</button>
      </header>

      <div class="composer__chips">
        <span v-for="b in blocks" :key="b.id" class="chip">
          {{ b.name }}
          <button type="button" :aria-label="'移除 ' + b.name" @click="emit('remove', b.id)">×</button>
        </span>
      </div>

      <label class="composer__field">
        <span>页面标题（可留空）</span>
        <input :value="title" type="text" placeholder="例如：产品官网首页" @input="onTitleInput" />
      </label>

      <div class="composer__editor">
        <div class="composer__bar">
          <span>生成结果</span>
          <div class="composer__bar-actions">
            <button type="button" class="btn btn--ghost btn--sm" @click="toggleEditable">
              {{ editable ? '只读' : '编辑' }}
            </button>
          </div>
        </div>
        <pre v-if="!editable" class="composer__text">{{ text }}</pre>
        <textarea v-else v-model="draft" class="composer__textarea"></textarea>
        <p v-if="editable" class="composer__hint">编辑内容仅用于预览，复制的是下方预览文本。</p>
      </div>

      <footer class="composer__foot">
        <button type="button" class="btn btn--primary" @click="copy(editable ? draft : text, 'composer')">
          {{ copiedKey === 'composer' ? '已复制 ✓' : '复制完整需求' }}
        </button>
        <button type="button" class="btn btn--ghost" @click="emit('close')">关闭</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.composer {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 51;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(780px, calc(100% - 32px));
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 22px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #0b1222;
  box-shadow: var(--shadow);
  transform: translate(-50%, -50%);
  animation: pop-in 200ms ease;
}

@keyframes pop-in {
  from { opacity: 0; transform: translate(-50%, -47%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}

.composer__head { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; }

.composer__head h2 { margin: 0 0 4px; font-size: 18px; }

.composer__head p { margin: 0; font-size: 12px; color: var(--muted); }

.composer__close {
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

.composer__close:hover { color: var(--text); border-color: var(--accent); }

.composer__chips { display: flex; flex-wrap: wrap; gap: 7px; }

.chip {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 4px 6px 4px 11px;
  border: 1px solid rgba(94, 234, 212, 0.4);
  border-radius: 999px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 12px;
}

.chip button {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border: 0;
  border-radius: 50%;
  background: rgba(94, 234, 212, 0.18);
  color: var(--accent);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.composer__field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--muted); }

.composer__field input {
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--panel);
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.composer__field input:focus { border-color: var(--accent); }

.composer__editor {
  overflow: hidden;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
}

.composer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 11px;
  border-bottom: 1px solid var(--line-soft);
  background: rgba(17, 26, 46, 0.7);
  font-size: 11.5px;
  color: var(--muted);
}

.composer__text,
.composer__textarea {
  margin: 0;
  padding: 14px;
  max-height: 320px;
  overflow-y: auto;
  background: rgba(8, 12, 23, 0.7);
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.75;
  color: #9fb0cc;
  white-space: pre-wrap;
  word-break: break-word;
}

.composer__textarea {
  display: block;
  width: 100%;
  min-height: 280px;
  border: 0;
  outline: none;
  resize: vertical;
}

.composer__hint { margin: 0; padding: 0 14px 12px; font-size: 11px; color: #61708f; }

.composer__foot { display: flex; gap: 9px; justify-content: flex-end; }
</style>
