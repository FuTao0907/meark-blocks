<script setup lang="ts">
interface Option {
  key: string
  label: string
  count: number
}

defineProps<{
  categories: Option[]
  scenes: Option[]
  category: string
  scene: string
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:scene': [value: string]
}>()

function pick(kind: 'category' | 'scene', key: string) {
  if (kind === 'category') emit('update:category', key)
  else emit('update:scene', key)
}
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <span class="filters__label">类型</span>
      <button
        type="button"
        class="chip"
        :class="{ 'chip--on': category === '' }"
        @click="pick('category', '')"
      >
        全部
      </button>
      <button
        v-for="c in categories"
        :key="c.key"
        type="button"
        class="chip"
        :class="{ 'chip--on': category === c.key }"
        @click="pick('category', category === c.key ? '' : c.key)"
      >
        {{ c.label }}<span class="chip__n">{{ c.count }}</span>
      </button>
    </div>
    <div v-if="scenes.length" class="filters__row">
      <span class="filters__label">场景</span>
      <button
        type="button"
        class="chip"
        :class="{ 'chip--on': scene === '' }"
        @click="pick('scene', '')"
      >
        全部
      </button>
      <button
        v-for="s in scenes"
        :key="s.key"
        type="button"
        class="chip"
        :class="{ 'chip--on': scene === s.key }"
        @click="pick('scene', scene === s.key ? '' : s.key)"
      >
        {{ s.label }}<span class="chip__n">{{ s.count }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filters { display: flex; flex-direction: column; gap: 9px; }

.filters__row { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }

.filters__label {
  width: 34px;
  flex: none;
  white-space: nowrap;
  font-size: 12px;
  color: var(--muted);
}

.chip {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
  padding: 5px 11px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 12.5px;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
}

.chip:hover { color: var(--text); border-color: var(--line); }

.chip--on {
  border-color: rgba(94, 234, 212, 0.5);
  background: var(--accent-dim);
  color: var(--accent);
}

.chip__n { font-size: 10.5px; opacity: 0.65; }
</style>
