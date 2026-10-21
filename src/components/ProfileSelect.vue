<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  label: string
  modelValue: string
  options: SelectOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const list = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

const currentLabel = computed(
  () => props.options.find((option) => option.value === props.modelValue)?.label ?? props.modelValue,
)

function scrollActiveIntoView() {
  nextTick(() => {
    list.value?.querySelector<HTMLElement>(`[data-index="${activeIndex.value}"]`)?.scrollIntoView({ block: 'nearest' })
  })
}

function openPanel() {
  if (open.value) return
  const index = props.options.findIndex((option) => option.value === props.modelValue)
  activeIndex.value = index < 0 ? 0 : index
  open.value = true
  scrollActiveIntoView()
}

function closePanel(focusTrigger = false) {
  open.value = false
  if (focusTrigger) trigger.value?.focus()
}

function select(value: string) {
  emit('update:modelValue', value)
  closePanel(true)
}

function move(delta: number) {
  const total = props.options.length
  if (!total) return
  activeIndex.value = (activeIndex.value + delta + total) % total
  scrollActiveIntoView()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (!open.value) return
    event.preventDefault()
    event.stopPropagation()
    closePanel(true)
    return
  }

  if (event.key === 'Tab') {
    if (open.value) closePanel()
    return
  }

  if (!open.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPanel()
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = 0
    scrollActiveIntoView()
  } else if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = props.options.length - 1
    scrollActiveIntoView()
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = props.options[activeIndex.value]
    if (option) select(option.value)
  }
}

function onPointerDown(event: PointerEvent) {
  if (!open.value) return
  if (root.value && !root.value.contains(event.target as Node)) closePanel()
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))
</script>

<template>
  <div ref="root" class="psel" :class="{ 'psel--open': open }" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="psel__trigger"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="`${label}：${currentLabel}`"
      @click="open ? closePanel() : openPanel()"
    >
      <span class="psel__label">{{ label }}</span>
      <span class="psel__value">{{ currentLabel }}</span>
      <BaseIcon class="psel__chev" name="chevron" :size="12" />
    </button>

    <Transition name="psel-pop">
      <div v-if="open" class="psel__panel" role="listbox" :aria-label="label">
        <div ref="list" class="psel__list">
          <button
            v-for="(option, index) in options"
            :key="option.value"
            type="button"
            class="psel__option"
            :class="{ 'is-active': index === activeIndex, 'is-selected': option.value === modelValue }"
            :data-index="index"
            role="option"
            :aria-selected="option.value === modelValue"
            tabindex="-1"
            @mouseenter="activeIndex = index"
            @click="select(option.value)"
          >
            <span class="psel__option-text">{{ option.label }}</span>
            <BaseIcon v-if="option.value === modelValue" class="psel__check" name="check" :size="14" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.psel {
  position: relative;
}

.psel__trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 12.5px;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}

.psel__trigger:hover,
.psel--open .psel__trigger {
  background: var(--bg-soft);
}

.psel--open .psel__trigger {
  border-color: var(--line);
}

.psel__label {
  color: var(--muted);
  font-size: 11.5px;
}

.psel__value {
  font-weight: 500;
  white-space: nowrap;
}

.psel__chev {
  color: var(--muted);
  transition: transform 160ms ease;
}

.psel--open .psel__chev {
  transform: rotate(180deg);
}

.psel__panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  min-width: 168px;
  max-width: min(260px, calc(100vw - 32px));
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--panel-2);
  box-shadow: var(--shadow-pop);
}

.psel__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  max-height: 264px;
  overflow-y: auto;
}

.psel__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-regular);
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.psel__option.is-active {
  background: var(--bg-soft);
  color: var(--text);
}

.psel__option.is-selected {
  color: var(--accent);
}

.psel__check {
  color: var(--accent);
}

.psel__option-text {
  white-space: nowrap;
}

.psel-pop-enter-active,
.psel-pop-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}

.psel-pop-enter-from,
.psel-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
