<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="search">
    <span class="search__icon" aria-hidden="true">⌕</span>
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
  padding: 0 14px;
  height: 50px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(17, 26, 46, 0.72);
  transition: border-color 160ms ease, background 160ms ease;
}

.search:focus-within {
  border-color: var(--accent);
  background: rgba(17, 26, 46, 0.95);
}

.search__icon { color: var(--muted); font-size: 18px; line-height: 1; }

.search__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 14px;
}

.search__input::placeholder { color: #61708f; }

.search__input::-webkit-search-cancel-button { display: none; }

.search__clear {
  padding: 4px 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
}

.search__clear:hover { color: var(--text); border-color: var(--accent); }
</style>
