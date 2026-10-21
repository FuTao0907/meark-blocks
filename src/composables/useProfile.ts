import { ref, watch } from 'vue'
import type { Profile } from '../types'

const STORAGE_KEY = 'meark.blocks.profile.v1'

const DEFAULT_PROFILE: Profile = {
  stack: 'vue3',
  styling: 'native',
  deps: 'zero',
  output: 'multi',
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROFILE }
    const parsed = JSON.parse(raw) as Partial<Profile>
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

export function useProfile() {
  const profile = ref<Profile>(load())

  watch(
    profile,
    (p) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
      } catch {
        /* 忽略隐私模式下的写入失败 */
      }
    },
    { deep: true },
  )

  function reset() {
    profile.value = { ...DEFAULT_PROFILE }
  }

  return { profile, reset, DEFAULT_PROFILE }
}
