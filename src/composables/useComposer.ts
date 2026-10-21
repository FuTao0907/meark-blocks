import type { Block, Profile } from '../types'
import { DEPS_LABELS, OUTPUT_LABELS, STYLING_LABELS } from '../constants'

export interface ComposerOptions {
  blocks: Block[]
  adapter: string
  profile: Profile
  pageTitle: string
}

/**
 * 把选中的积木拼成一份可直接使用的需求。
 * 顺序：任务 → 页面结构 → 效果清单（通用规格）→ 技术栈适配 → 全局约束。
 */
export function buildComposerPrompt(options: ComposerOptions): string {
  const { blocks, adapter, profile, pageTitle } = options
  if (blocks.length === 0) return ''

  const lines: string[] = []

  lines.push(`【任务】实现一个包含 ${blocks.length} 个效果的页面：${pageTitle.trim() || '未命名页面'}。`)
  lines.push('')

  lines.push('【页面结构】')
  lines.push('按下列顺序从上到下排布；每个效果独占一个区块，区块之间使用统一间距。')
  blocks.forEach((b, i) => lines.push(`${i + 1}. ${b.name}`))
  lines.push('')

  lines.push('【效果清单】')
  blocks.forEach((b, i) => {
    lines.push(`### ${i + 1}. ${b.name}`)
    // 去掉 prompt.md 的首行标题，避免和小标题重复
    lines.push(b.promptRaw.replace(/^#\s+.+\r?\n+/, ''))
    lines.push('')
  })

  if (adapter.trim()) {
    lines.push('【技术栈适配】')
    lines.push(adapter.trim())
    lines.push('')
  }

  lines.push('【全局约束】')
  lines.push('- 所有效果共用同一套设计变量（颜色、间距、圆角、时长），不要每个区块各写一套。')
  lines.push('- 所有动效都必须支持「减弱动态效果」降级，降级后信息不丢失。')
  lines.push(
    `- 依赖策略：${DEPS_LABELS[profile.deps]}；样式方案：${STYLING_LABELS[profile.styling]}；输出形态：${OUTPUT_LABELS[profile.output]}。`,
  )
  lines.push('- 页面在 375px 宽度下不得横向滚动。')
  lines.push('- 不要实现需求之外的功能、页面或数据。')

  return lines.join('\n')
}
