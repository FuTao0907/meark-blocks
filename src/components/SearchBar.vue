<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="search">
    <span class="search__icon" aria-hidden="true"><BaseIcon name="search" :size="18" /></span>
    <input
      class="search__input"
      type="search"
      :value="modelValue"
      placeholder="搜你想要的「感觉」：发光、跟手、滚动出现、卡片、粒子…"
      aria-label="搜索积木"
      @input="onInput"
    />
    <button v-if="modelValue" type="button" class="search__clear" @click="emit('update:modelValue', '')">
      清空
    </button>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-field);
  background: var(--panel-2);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.search__icon { display: grid; place-items: center; color: var(--muted); }

.search__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 14px;
}

.search__input::placeholder { color: var(--placeholder); }

.search__input::-webkit-search-cancel-button { display: none; }

.search__clear {
  padding: 4px 9px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
}

.search__clear:hover { color: var(--accent); border-color: var(--accent); }
</style>

