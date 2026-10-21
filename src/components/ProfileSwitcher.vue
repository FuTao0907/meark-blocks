<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import ProfileSelect from './ProfileSelect.vue'
import {
  DEPS_LABELS,
  DEPS_ORDER,
  OUTPUT_LABELS,
  OUTPUT_ORDER,
  STACK_LABELS,
  STACK_ORDER,
  STYLING_LABELS,
  STYLING_ORDER,
  labelOf,
} from '../constants'
import type { Profile } from '../types'

const props = defineProps<{ profile: Profile }>()
const emit = defineEmits<{ update: [value: Profile] }>()

function optionsOf(order: string[], labels: Record<string, string>) {
  return order.map((value) => ({ value, label: labelOf(labels, value) }))
}

const stackOptions = computed(() => optionsOf(STACK_ORDER, STACK_LABELS))
const stylingOptions = computed(() => optionsOf(STYLING_ORDER, STYLING_LABELS))
const depsOptions = computed(() => optionsOf(DEPS_ORDER, DEPS_LABELS))
const outputOptions = computed(() => optionsOf(OUTPUT_ORDER, OUTPUT_LABELS))

function patch(next: Partial<Profile>) {
  emit('update', { ...props.profile, ...next })
}
</script>

<template>
  <section class="profile" aria-label="项目画像">
    <span class="profile__lead">
      <BaseIcon name="sliders" :size="15" />
      <span>项目画像</span>
    </span>

    <div class="profile__fields">
      <ProfileSelect
        label="技术栈"
        :model-value="profile.stack"
        :options="stackOptions"
        @update:model-value="(value: string) => patch({ stack: value as Profile['stack'] })"
      />
      <ProfileSelect
        label="样式"
        :model-value="profile.styling"
        :options="stylingOptions"
        @update:model-value="(value: string) => patch({ styling: value as Profile['styling'] })"
      />
      <ProfileSelect
        label="依赖"
        :model-value="profile.deps"
        :options="depsOptions"
        @update:model-value="(value: string) => patch({ deps: value as Profile['deps'] })"
      />
      <ProfileSelect
        label="输出"
        :model-value="profile.output"
        :options="outputOptions"
        @update:model-value="(value: string) => patch({ output: value as Profile['output'] })"
      />
    </div>

    <span class="profile__hint">复制时自动附加适配层</span>
  </section>
</template>

<style scoped>
.profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  padding: 16px 0 2px;
}

.profile__lead {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.profile__fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}

.profile__hint {
  margin-left: auto;
  color: var(--placeholder);
  font-size: 11.5px;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .profile {
    gap: 4px 10px;
    padding-top: 14px;
  }

  .profile__hint {
    display: none;
  }

  .profile__fields {
    gap: 0;
  }
}
</style>
