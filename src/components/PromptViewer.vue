<script setup lang="ts">
import { computed } from 'vue'
import type { BlockPrompt } from '../types'

const props = defineProps<{ prompt: BlockPrompt }>()

const sections = computed(() =>
  [
    { label: '目标', text: props.prompt.goal },
    { label: '触发与行为', text: props.prompt.behavior },
    { label: '参数', text: props.prompt.params },
    { label: '技术中性约束', text: props.prompt.constraints },
    { label: '降级与可访问性', text: props.prompt.a11y },
    { label: '验收', text: props.prompt.acceptance },
    { label: '不要做', text: props.prompt.avoid },
  ].filter((s) => s.text?.trim()),
)
</script>

<template>
  <div class="prompt">
    <section v-for="s in sections" :key="s.label" class="prompt__section">
      <h4 class="prompt__label">{{ s.label }}</h4>
      <p class="prompt__text">{{ s.text }}</p>
    </section>
  </div>
</template>

<style scoped>
.prompt { display: flex; flex-direction: column; gap: 14px; }

.prompt__section {
  padding: 11px 13px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--panel);
}

.prompt__label {
  margin: 0 0 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: var(--accent);
}

.prompt__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-regular);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
