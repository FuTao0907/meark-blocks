<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number; stroke?: number }>(), {
  size: 18,
  stroke: 1.7,
})

const paths: Record<string, string[]> = {
  blocks: ['M4 4h5.5v5.5H4z', 'M14.5 4H20v5.5h-5.5z', 'M4 14.5h5.5V20H4z', 'M14.5 14.5H20V20h-5.5z'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  check: ['M4 12.5l5 5L20 6.5'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.35-4.35'],
  moon: ['M20.5 14.4A8.6 8.6 0 1 1 9.6 3.5a6.9 6.9 0 0 0 10.9 10.9z'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
  copy: ['M9 9h10v10H9z', 'M15 9V5H5v10h4'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M10 4H5v15h15v-5'],
  chevron: ['M6 9l6 6 6-6'],
  play: ['M8 5.5v13l11-6.5z'],
  sliders: ['M3.5 7.5h17', 'M3.5 16.5h17', 'M9 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M15 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5.5', 'M12 7.6h.01'],
}
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in paths[name] ?? []" :key="d" :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  display: block;
  flex: none;
}
</style>
