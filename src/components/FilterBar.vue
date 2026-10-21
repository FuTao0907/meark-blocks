<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface FacetOption {
  key: string
  label: string
  count: number
}

const props = defineProps<{
  categories: FacetOption[]
  scenes: FacetOption[]
  category: string
  scene: string
  categoryTotal: number
  sceneTotal: number
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:scene': [value: string]
}>()

const catRow = ref<HTMLElement | null>(null)
const sceneRow = ref<HTMLElement | null>(null)
const catScrollable = ref(false)
const sceneScrollable = ref(false)

let observer: ResizeObserver | null = null

function isScrollable(element: HTMLElement | null) {
  return Boolean(element) && (element as HTMLElement).scrollWidth - (element as HTMLElement).clientWidth > 2
}

function measure() {
  catScrollable.value = isScrollable(catRow.value)
  sceneScrollable.value = isScrollable(sceneRow.value)
}

function scrollSelectedIntoView() {
  nextTick(() => {
    const targets = [catRow.value, sceneRow.value]
    for (const row of targets) {
      row?.querySelector<HTMLElement>('.chip--on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  })
}

watch(
  () => [props.categories, props.scenes, props.category, props.scene],
  () => {
    nextTick(measure)
    scrollSelectedIntoView()
  },
  { deep: true },
)

function chooseCategory(key: string) {
  emit('update:category', props.category === key ? '' : key)
}

function chooseScene(key: string) {
  emit('update:scene', props.scene === key ? '' : key)
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  if ('ResizeObserver' in window) {
    observer = new ResizeObserver(measure)
    if (catRow.value) observer.observe(catRow.value)
    if (sceneRow.value) observer.observe(sceneRow.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <div class="filters">
    <div v-show="categoryTotal > 0" class="facet" :class="{ 'facet--scroll': catScrollable }">
      <span class="facet__label" id="facet-category">类型</span>
      <div ref="catRow" class="facet__row" role="group" aria-labelledby="facet-category">
        <button
          type="button"
          class="chip"
          :class="{ 'chip--on': !category }"
          :aria-pressed="!category"
          @click="emit('update:category', '')"
        >
          全部<span class="chip__n">{{ categoryTotal }}</span>
        </button>
        <button
          v-for="item in categories"
          :key="item.key"
          type="button"
          class="chip"
          :class="{ 'chip--on': category === item.key }"
          :aria-pressed="category === item.key"
          @click="chooseCategory(item.key)"
        >
          {{ item.label }}<span class="chip__n">{{ item.count }}</span>
        </button>
      </div>
    </div>

    <div v-show="sceneTotal > 0" class="facet" :class="{ 'facet--scroll': sceneScrollable }">
      <span class="facet__label" id="facet-scene">场景</span>
      <div ref="sceneRow" class="facet__row" role="group" aria-labelledby="facet-scene">
        <button
          type="button"
          class="chip"
          :class="{ 'chip--on': !scene }"
          :aria-pressed="!scene"
          @click="emit('update:scene', '')"
        >
          全部<span class="chip__n">{{ sceneTotal }}</span>
        </button>
        <button
          v-for="item in scenes"
          :key="item.key"
          type="button"
          class="chip"
          :class="{ 'chip--on': scene === item.key }"
          :aria-pressed="scene === item.key"
          @click="chooseScene(item.key)"
        >
          {{ item.label }}<span class="chip__n">{{ item.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.facet {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.facet__label {
  flex: none;
  width: 34px;
  color: var(--muted);
  font-size: 12px;
}

.facet__row {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 2px 1px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.facet__row::-webkit-scrollbar {
  display: none;
}

.facet--scroll .facet__row {
  mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 22px), transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 22px), transparent 100%);
}

.chip__n {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  opacity: 0.65;
}
</style>
