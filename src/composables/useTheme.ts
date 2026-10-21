import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'meark-theme'

function initial(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const theme = ref<Theme>(initial())

watchEffect(() => {
  const root = document.documentElement
  root.dataset.theme = theme.value
  root.style.colorScheme = theme.value
  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {
    /* 隐私模式下忽略 */
  }
})

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  return { theme, toggle }
}
