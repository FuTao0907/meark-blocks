<script setup lang="ts">
import { computed } from 'vue'
import type { Block } from '../types'
import { CATEGORY_LABELS, FEEL_LABELS, SCENE_LABELS, labelOf } from '../constants'

const props = defineProps<{ block: Block; selected: boolean }>()
const emit = defineEmits<{ open: []; toggle: [] }>()

const categoryLabel = computed(() => labelOf(CATEGORY_LABELS, props.block.category))
const feelLabels = computed(() => props.block.feel.slice(0, 3).map((f) => labelOf(FEEL_LABELS, f)))
const sceneLabels = computed(() => props.block.scenes.slice(0, 2).map((s) => labelOf(SCENE_LABELS, s)))
const aka = computed(() => props.block.aka.slice(0, 3).join(' / '))
</script>

<template>
  <article
    class="card"
    :class="{ 'card--on': selected }"
    tabindex="0"
    role="button"
    @click="emit('open')"
    @keydown.enter.prevent="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <div class="card__head">
      <span class="chip chip--on">{{ categoryLabel }}</span>
      <button
        type="button"
        class="card__pick"
        :class="{ 'card__pick--on': selected }"
        :aria-pressed="selected"
        :title="selected ? '从组合中移除' : '加入组合'"
        @click.stop="emit('toggle')"
      >
        {{ selected ? '✓' : '+' }}
      </button>
    </div>

    <h3 class="card__name">{{ block.name }}</h3>
    <p class="card__aka">{{ aka }}</p>

    <div class="card__tags">
      <span v-for="f in feelLabels" :key="f" class="chip">{{ f }}</span>
    </div>

    <div class="card__foot">
      <span>{{ block.params.length }} 个参数</span>
      <span class="dot">·</span>
      <span>{{ sceneLabels.join(' / ') || '通用' }}</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 14px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-card);
  background: var(--panel);
  cursor: pointer;
  outline: none;
  transition: border-color 160ms ease, transform 160ms ease;
}

.card:hover {
  border-color: var(--line);
  transform: translateY(-2px);
}

.card:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(232, 184, 109, 0.16);
}

.card--on {
  border-color: rgba(232, 184, 109, 0.55);
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card__pick {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius-field);
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: all 150ms ease;
}

.card__pick:hover { color: var(--text); border-color: var(--accent); }

.card__pick--on {
  border-color: transparent;
  background: var(--accent);
  color: #241a08;
  font-weight: 700;
}

.card__name { margin: 13px 0 6px; font-size: 15.5px; letter-spacing: 0.2px; }

.card__aka {
  margin: 0;
  min-height: 32px;
  font-size: 12px;
  line-height: 1.55;
  color: #6f7f9e;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 10px;
}

.card__foot {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  font-size: 11.5px;
  color: #6f7f9e;
}

.dot { opacity: 0.5; }
</style>


