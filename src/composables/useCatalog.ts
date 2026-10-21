import { computed, onMounted, ref } from 'vue'
import type { Block, Catalog } from '../types'

export function useCatalog() {
  const catalog = ref<Catalog | null>(null)
  const loading = ref(true)
  const error = ref('')

  onMounted(async () => {
    try {
      const url = `${import.meta.env.BASE_URL}catalog.json`
      const res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) throw new Error(`catalog.json HTTP ${res.status}`)
      catalog.value = (await res.json()) as Catalog
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  })

  const blocks = computed<Block[]>(() => catalog.value?.blocks ?? [])
  const adapters = computed<Record<string, string>>(() => catalog.value?.adapters ?? {})

  return { catalog, blocks, adapters, loading, error }
}
