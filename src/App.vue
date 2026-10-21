<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BlockCard from './components/BlockCard.vue'
import BlockDrawer from './components/BlockDrawer.vue'
import Composer from './components/Composer.vue'
import FilterBar from './components/FilterBar.vue'
import ProfileSwitcher from './components/ProfileSwitcher.vue'
import SearchBar from './components/SearchBar.vue'
import { useCatalog } from './composables/useCatalog'
import { buildComposerPrompt } from './composables/useComposer'
import { useProfile } from './composables/useProfile'
import { CATEGORY_LABELS, FEEL_LABELS, SCENE_LABELS, labelOf } from './constants'
import type { Block, Profile } from './types'

const { blocks, adapters, loading, error } = useCatalog()
const { profile } = useProfile()

const query = ref('')
const activeCategory = ref('')
const activeScene = ref('')
const selectedIds = ref<string[]>([])
const openId = ref('')
const composerOpen = ref(false)
const composerTitle = ref('')

const categories = computed(() => {
  const counts = new Map<string, number>()
  for (const b of blocks.value) counts.set(b.category, (counts.get(b.category) ?? 0) + 1)
  return [...counts.entries()].map(([key, count]) => ({
    key,
    label: labelOf(CATEGORY_LABELS, key),
    count,
  }))
})

const scenes = computed(() => {
  const counts = new Map<string, number>()
  for (const b of blocks.value) for (const s of b.scenes) counts.set(s, (counts.get(s) ?? 0) + 1)
  return [...counts.entries()].map(([key, count]) => ({ key, label: labelOf(SCENE_LABELS, key), count }))
})

const filtered = computed<Block[]>(() => {
  const q = query.value.trim().toLowerCase()
  return blocks.value.filter((b) => {
    if (activeCategory.value && b.category !== activeCategory.value) return false
    if (activeScene.value && !b.scenes.includes(activeScene.value)) return false
    if (!q) return true
    const haystack = [
      b.name,
      ...b.aka,
      labelOf(CATEGORY_LABELS, b.category),
      ...b.scenes.map((s) => labelOf(SCENE_LABELS, s)),
      ...b.feel.map((f) => labelOf(FEEL_LABELS, f)),
      b.promptRaw,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const openBlock = computed<Block | null>(() => blocks.value.find((b) => b.id === openId.value) ?? null)

const selectedBlocks = computed<Block[]>(() =>
  selectedIds.value
    .map((id) => blocks.value.find((b) => b.id === id))
    .filter((b): b is Block => Boolean(b)),
)

const adapterText = computed(() => {
  const base = adapters.value[profile.value.stack] ?? ''
  const extra = [
    '【本次项目约束】',
    `- 样式方案：${labelOf({ native: '原生 CSS', cssModules: 'CSS Modules', tailwind: 'Tailwind' }, profile.value.styling)}`,
    `- 依赖策略：${profile.value.deps === 'zero' ? '零依赖，不引入任何第三方库' : '允许引入必要的第三方库'}`,
    `- 输出形态：${profile.value.output === 'single' ? '单文件交付' : '多文件组件交付'}`,
  ].join('\n')
  return [base, extra].filter(Boolean).join('\n\n')
})

const composerText = computed(() =>
  buildComposerPrompt({
    blocks: selectedBlocks.value,
    adapter: adapterText.value,
    profile: profile.value,
    pageTitle: composerTitle.value,
  }),
)

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id: string) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((x) => x !== id)
    : [...selectedIds.value, id]
}

function resetFilters() {
  query.value = ''
  activeCategory.value = ''
  activeScene.value = ''
}

function onProfileUpdate(next: Profile) {
  profile.value = next
}

// 调试/分享用：?preview=drawer 直接打开首块详情，?preview=composer 预选并打开拼装器
onMounted(() => {
  const mode = new URLSearchParams(location.search).get('preview')
  if (!mode) return
  const stop = watch(blocks, (list) => {
    if (!list.length) return
    if (mode === 'drawer') openId.value = list[0].id
    if (mode === 'composer') {
      selectedIds.value = list.slice(0, 3).map((b) => b.id)
      composerOpen.value = true
    }
    stop()
  })
})
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand__mark">▦</span>
        <div>
          <h1 class="brand__title">积木库</h1>
          <p class="brand__sub">把想要的效果翻译成 AI 能准确执行的规格 · 提示词与框架无关</p>
        </div>
      </div>
      <ProfileSwitcher :profile="profile" @update="onProfileUpdate" />
    </header>

    <section class="controls">
      <SearchBar v-model="query" />
      <FilterBar
        v-model:category="activeCategory"
        v-model:scene="activeScene"
        :categories="categories"
        :scenes="scenes"
      />
      <div class="summary">
        <span>共 <b>{{ blocks.length }}</b> 块</span>
        <span v-if="filtered.length !== blocks.length">筛选出 <b>{{ filtered.length }}</b> 块</span>
        <span v-if="selectedIds.length">已选 <b>{{ selectedIds.length }}</b> 块</span>
      </div>
    </section>

    <main>
      <p v-if="loading" class="empty">正在加载积木…</p>
      <p v-else-if="error" class="empty">
        加载失败：{{ error }}
        <br />
        请先运行 <code>npm run catalog</code> 生成 catalog.json。
      </p>
      <div v-else-if="filtered.length" class="grid">
        <BlockCard
          v-for="item in filtered"
          :key="item.id"
          :block="item"
          :selected="isSelected(item.id)"
          @open="openId = item.id"
          @toggle="toggleSelect(item.id)"
        />
      </div>
      <div v-else class="empty">
        没有匹配的积木，换个说法试试（比如「发光」「滚动」「跟手」）。
        <br />
        <button type="button" @click="resetFilters">清空筛选</button>
      </div>
    </main>

    <footer class="footer">
      <div>积木 = 一个可独立运行的演示 + 一份与框架无关的规格。技术栈写法只出现在「适配层」，不污染通用提示词。</div>
      <div>
        新增积木：在 <code>effects/&lt;id&gt;/</code> 下放 <code>meta.json</code>、<code>prompt.md</code>、<code>demo.html</code>，然后
        <code>npm run catalog</code>。
      </div>
    </footer>

    <div v-if="selectedIds.length" class="dock">
      <span class="dock__count">已选 <b>{{ selectedIds.length }}</b> 块</span>
      <button type="button" class="btn btn--primary" @click="composerOpen = true">生成组合需求</button>
      <button type="button" class="btn btn--ghost" @click="selectedIds = []">清空</button>
    </div>

    <BlockDrawer
      v-if="openBlock"
      :block="openBlock"
      :adapter="adapterText"
      @close="openId = ''"
    />

    <Composer
      v-if="composerOpen"
      :blocks="selectedBlocks"
      :text="composerText"
      :title="composerTitle"
      @close="composerOpen = false"
      @remove="toggleSelect"
      @update:title="composerTitle = $event"
    />
  </div>
</template>
