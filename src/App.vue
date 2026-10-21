<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseIcon from './components/BaseIcon.vue'
import AboutPage from './components/AboutPage.vue'
import BlockCard from './components/BlockCard.vue'
import BlockDrawer from './components/BlockDrawer.vue'
import Composer from './components/Composer.vue'
import FilterBar from './components/FilterBar.vue'
import ProfileSwitcher from './components/ProfileSwitcher.vue'
import SearchBar from './components/SearchBar.vue'
import { useCatalog } from './composables/useCatalog'
import { buildComposerPrompt } from './composables/useComposer'
import { useProfile } from './composables/useProfile'
import { useTheme } from './composables/useTheme'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  FEEL_LABELS,
  SCENE_LABELS,
  SCENE_ORDER,
  STYLING_LABELS,
  labelOf,
} from './constants'
import type { Block, Profile } from './types'

const { blocks, adapters, loading, error } = useCatalog()
const { profile } = useProfile()
const { theme, toggle: toggleTheme } = useTheme()

const query = ref('')
const activeCategory = ref('')
const activeScene = ref('')
const selectedIds = ref<string[]>([])
const openId = ref('')
const composerOpen = ref(false)
const composerTitle = ref('')
const aboutOpen = ref(false)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const haystacks = computed(
  () =>
    new Map(
      blocks.value.map((block) => [
        block.id,
        [
          block.name,
          ...block.aka,
          labelOf(CATEGORY_LABELS, block.category),
          ...block.scenes.map((scene) => labelOf(SCENE_LABELS, scene)),
          ...block.feel.map((feel) => labelOf(FEEL_LABELS, feel)),
          block.promptRaw,
        ]
          .join(' ')
          .toLowerCase(),
      ]),
    ),
)

function matchesQuery(block: Block) {
  if (!normalizedQuery.value) return true
  return haystacks.value.get(block.id)?.includes(normalizedQuery.value) ?? false
}

function matchesCategory(block: Block) {
  return !activeCategory.value || block.category === activeCategory.value
}

function matchesScene(block: Block) {
  return !activeScene.value || block.scenes.includes(activeScene.value)
}

const filtered = computed<Block[]>(() =>
  blocks.value.filter((block) => matchesQuery(block) && matchesCategory(block) && matchesScene(block)),
)

/** 分面统计：只统计「其它维度已生效」的结果，保证不出现点了就会空的选项 */
const categorySource = computed<Block[]>(() =>
  blocks.value.filter((block) => matchesQuery(block) && matchesScene(block)),
)

const sceneSource = computed<Block[]>(() =>
  blocks.value.filter((block) => matchesQuery(block) && matchesCategory(block)),
)

function countBy(source: Block[], pick: (block: Block) => string[]) {
  const counts = new Map<string, number>()
  for (const block of source) for (const key of pick(block)) counts.set(key, (counts.get(key) ?? 0) + 1)
  return counts
}

function facetOf(
  source: Block[],
  pick: (block: Block) => string[],
  labels: Record<string, string>,
  order: string[],
  selected: string,
) {
  const counts = countBy(source, pick)
  return order
    .filter((key) => (counts.get(key) ?? 0) > 0 || key === selected)
    .map((key) => ({ key, label: labelOf(labels, key), count: counts.get(key) ?? 0 }))
}

const categories = computed(() =>
  facetOf(categorySource.value, (block) => [block.category], CATEGORY_LABELS, CATEGORY_ORDER, activeCategory.value),
)

const scenes = computed(() =>
  facetOf(sceneSource.value, (block) => block.scenes, SCENE_LABELS, SCENE_ORDER, activeScene.value),
)

const categoryTotal = computed(() => categorySource.value.length)
const sceneTotal = computed(() => sceneSource.value.length)

const openBlock = computed<Block | null>(() => blocks.value.find((block) => block.id === openId.value) ?? null)

const selectedBlocks = computed<Block[]>(() =>
  selectedIds.value
    .map((id) => blocks.value.find((block) => block.id === id))
    .filter((block): block is Block => Boolean(block)),
)

const adapterText = computed(() => {
  const base = adapters.value[profile.value.stack] ?? ''
  const extra = [
    '【本次项目约束】',
    `- 样式方案：${labelOf(STYLING_LABELS, profile.value.styling)}`,
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
    ? selectedIds.value.filter((item) => item !== id)
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

function syncAboutFromHash() {
  aboutOpen.value = location.hash === '#about'
}

function openAbout() {
  location.hash = 'about'
}

function closeAbout() {
  aboutOpen.value = false
  if (location.hash === '#about') history.replaceState(null, '', `${location.pathname}${location.search}`)
}

// 调试/分享用：?preview=drawer 直接打开首块详情，?preview=composer 预选并打开拼装器
onMounted(() => {
  syncAboutFromHash()
  window.addEventListener('hashchange', syncAboutFromHash)

  const mode = new URLSearchParams(location.search).get('preview')
  if (!mode) return
  const stop = watch(blocks, (list) => {
    if (!list.length) return
    if (mode === 'drawer') openId.value = list[0].id
    if (mode === 'composer') {
      selectedIds.value = list.slice(0, 3).map((block) => block.id)
      composerOpen.value = true
    }
    stop()
  })
})

onBeforeUnmount(() => window.removeEventListener('hashchange', syncAboutFromHash))
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="brand__mark"><BaseIcon name="blocks" :size="22" /></span>
        <div>
          <h1 class="brand__title">积木库</h1>
          <p class="brand__sub">把想要的效果翻译成 AI 能准确执行的规格 · 提示词与框架无关</p>
        </div>
      </div>
      <div class="topbar__tools">
        <SearchBar v-model="query" />
        <button
          type="button"
          class="icon-btn"
          :aria-label="theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
          :title="theme === 'light' ? '深色模式' : '浅色模式'"
          @click="toggleTheme"
        >
          <BaseIcon :name="theme === 'light' ? 'moon' : 'sun'" :size="18" />
        </button>
      </div>
    </header>

    <ProfileSwitcher :profile="profile" @update="onProfileUpdate" />

    <section class="controls">
      <FilterBar
        v-model:category="activeCategory"
        v-model:scene="activeScene"
        :categories="categories"
        :scenes="scenes"
        :category-total="categoryTotal"
        :scene-total="sceneTotal"
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
      <span class="footer__copy">© 2026 积木库 · meark-blocks</span>
      <nav class="footer__links" aria-label="站点信息">
        <button type="button" class="footer__link" @click="openAbout">
          <BaseIcon name="info" :size="13" />
          关于
        </button>
        <a
          class="footer__link"
          href="https://github.com/FuTao0907/meark-blocks"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
          <BaseIcon name="external" :size="12" />
        </a>
      </nav>
    </footer>

    <div v-if="selectedIds.length" class="dock">
      <span class="dock__count">已选 <b>{{ selectedIds.length }}</b> 块</span>
      <button type="button" class="btn btn--primary" @click="composerOpen = true">生成组合需求</button>
      <button type="button" class="btn btn--ghost" @click="selectedIds = []">清空</button>
    </div>

    <BlockDrawer v-if="openBlock" :block="openBlock" :adapter="adapterText" @close="openId = ''" />

    <Composer
      v-if="composerOpen"
      :blocks="selectedBlocks"
      :text="composerText"
      :title="composerTitle"
      @close="composerOpen = false"
      @remove="toggleSelect"
      @update:title="composerTitle = $event"
    />

    <AboutPage v-if="aboutOpen" @close="closeAbout" />
  </div>
</template>
