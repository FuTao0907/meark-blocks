<script setup lang="ts">
import type { Profile, Stack } from '../types'
import { DEPS_LABELS, OUTPUT_LABELS, STACK_LABELS, STYLING_LABELS } from '../constants'

const props = defineProps<{ profile: Profile }>()
const emit = defineEmits<{ update: [value: Profile] }>()

const stacks: Stack[] = ['vue3', 'react', 'vanilla']

function patch(partial: Partial<Profile>) {
  emit('update', { ...props.profile, ...partial })
}

function setStack(event: Event) {
  patch({ stack: (event.target as HTMLSelectElement).value as Stack })
}

function setStyling(event: Event) {
  patch({ styling: (event.target as HTMLSelectElement).value as Profile['styling'] })
}

function setDeps(event: Event) {
  patch({ deps: (event.target as HTMLSelectElement).value as Profile['deps'] })
}

function setOutput(event: Event) {
  patch({ output: (event.target as HTMLSelectElement).value as Profile['output'] })
}
</script>

<template>
  <div class="profile">
    <div class="profile__title">项目画像<span>复制时自动附加适配层</span></div>
    <div class="profile__row">
      <label>
        <span>技术栈</span>
        <select :value="profile.stack" @change="setStack">
          <option v-for="s in stacks" :key="s" :value="s">{{ STACK_LABELS[s] }}</option>
        </select>
      </label>
      <label>
        <span>样式</span>
        <select :value="profile.styling" @change="setStyling">
          <option v-for="(label, key) in STYLING_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label>
        <span>依赖</span>
        <select :value="profile.deps" @change="setDeps">
          <option v-for="(label, key) in DEPS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label>
        <span>输出</span>
        <select :value="profile.output" @change="setOutput">
          <option v-for="(label, key) in OUTPUT_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.profile {
  min-width: 300px;
  padding: 10px 12px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  background: rgba(17, 26, 46, 0.6);
}

.profile__title {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--muted);
}

.profile__title span { font-size: 10.5px; opacity: 0.6; }

.profile__row { display: flex; flex-wrap: wrap; gap: 8px; }

.profile__row label { display: flex; flex-direction: column; gap: 3px; }

.profile__row label > span { font-size: 10.5px; color: #61708f; }

@media (max-width: 640px) {
  .profile { min-width: 0; width: 100%; }
  .profile__row label { flex: 1 1 44%; min-width: 0; }
  .profile__row select { width: 100%; }
}

select {
  padding: 5px 7px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--text);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

select:focus { border-color: var(--accent); }
</style>
