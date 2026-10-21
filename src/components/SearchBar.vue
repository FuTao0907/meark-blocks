<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)

function focusInput() {
  nextTick(() => {
    inputEl.value?.focus()
    inputEl.value?.select()
  })
}

function openSearch() {
  open.value = true
  focusInput()
}

function closeSearch(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) triggerEl.value?.focus()
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clear() {
  emit('update:modelValue', '')
  focusInput()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeSearch(true)
  } else if (event.key === 'Enter' && props.modelValue.trim()) {
    event.preventDefault()
    closeSearch(false)
    inputEl.value?.blur()
  }
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  if (!element) return false
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}

function onWindowKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return

  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
    if (isTypingTarget(event.target)) return
    event.preventDefault()
    if (open.value) focusInput()
    else openSearch()
    return
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (open.value) focusInput()
    else openSearch()
  }
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
  <div class="search" :class="{ 'search--open': open }">
    <button
      v-if="!open"
      ref="triggerEl"
      type="button"
      class="icon-btn search__trigger"
      aria-label="搜索积木（快捷键 /）"
      title="搜索积木（/）"
      @click="openSearch"
    >
      <BaseIcon name="search" :size="18" />
      <span v-if="modelValue" class="search__dot" aria-hidden="true" />
    </button>

    <div v-else class="search__field">
      <BaseIcon class="search__icon" name="search" :size="16" />
      <input
        ref="inputEl"
        class="search__input"
        type="search"
        :value="modelValue"
        placeholder="搜「感觉」：发光、跟手、滚动、粒子…"
        aria-label="搜索积木"
        @input="onInput"
        @keydown="onKeydown"
        @blur="closeSearch(false)"
      />
      <button
        v-if="modelValue"
        type="button"
        class="search__clear"
        aria-label="清空搜索"
        title="清空"
        @mousedown.prevent
        @click="clear"
      >
        <BaseIcon name="close" :size="13" />
      </button>
      <kbd class="search__kbd" aria-hidden="true">Esc</kbd>
    </div>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  min-width: 0;
}

.search__trigger {
  position: relative;
}

.search__dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.search__field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
  max-width: 100%;
  height: 36px;
  padding: 0 8px 0 11px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-field);
  background: var(--panel-2);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.search__field:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.search__icon {
  color: var(--muted);
}

.search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.search__input::placeholder {
  color: var(--placeholder);
}

.search__input::-webkit-search-cancel-button,
.search__input::-webkit-search-decoration {
  display: none;
}

.search__clear {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.search__clear:hover {
  background: var(--bg-soft);
  color: var(--text);
}

.search__kbd {
  padding: 1px 5px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--placeholder);
  font-family: var(--mono);
  font-size: 10.5px;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .search__field {
    width: 100%;
  }

  .search__kbd {
    display: none;
  }
}
</style>
