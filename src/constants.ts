export const CATEGORY_LABELS: Record<string, string> = {
  animation: '动画',
  interaction: '交互',
  layout: '布局',
  component: '组件',
  canvas: 'Canvas',
  visual: '视觉',
  feedback: '反馈',
}

export const SCENE_LABELS: Record<string, string> = {
  landing: '落地页',
  pricing: '价格页',
  portfolio: '作品集',
  dashboard: '后台',
  form: '表单页',
  marketing: '营销页',
  mobile: '移动端',
}

export const FEEL_LABELS: Record<string, string> = {
  tech: '科技感',
  premium: '高级',
  subtle: '克制',
  playful: '活泼',
  minimal: '极简',
  bold: '强烈',
  retro: '复古',
}

export const STACK_LABELS: Record<string, string> = {
  vanilla: '原生 HTML/CSS/JS',
  vue3: 'Vue 3',
  react: 'React',
}

export const STYLING_LABELS: Record<string, string> = {
  native: '原生 CSS',
  cssModules: 'CSS Modules',
  tailwind: 'Tailwind',
}

export const DEPS_LABELS: Record<string, string> = {
  zero: '零依赖',
  allowed: '允许依赖',
}

export const OUTPUT_LABELS: Record<string, string> = {
  single: '单文件',
  multi: '多文件组件',
}

export function labelOf(map: Record<string, string>, key: string): string {
  return map[key] ?? key
}

/** 筛选标签固定顺序：不随数据出现顺序跳动 */
export const CATEGORY_ORDER = ['animation', 'interaction', 'layout', 'component', 'canvas', 'visual', 'feedback']

export const SCENE_ORDER = ['landing', 'pricing', 'portfolio', 'dashboard', 'form', 'marketing', 'mobile']

/** 项目画像各维度的展示顺序 */
export const STACK_ORDER = ['vue3', 'react', 'vanilla']

export const STYLING_ORDER = ['native', 'cssModules', 'tailwind']

export const DEPS_ORDER = ['zero', 'allowed']

export const OUTPUT_ORDER = ['single', 'multi']
