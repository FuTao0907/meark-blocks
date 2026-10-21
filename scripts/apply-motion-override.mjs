#!/usr/bin/env node
/**
 * 给所有 demo 注入「演示动效覆盖」：
 *  1. 在 <head> 起始注入脚本：?motion=1 时忽略系统的 prefers-reduced-motion，
 *     并给 <html> 加 .motion-force 类（供 CSS 侧放行）。
 *  2. 把 @media (prefers-reduced-motion: reduce) 里的选择器加上 html:not(.motion-force) 前缀，
 *     使「强制动效」时这些降级规则不生效。
 *  3. 注入统一的自绘滚动条样式。
 * 幂等：已处理过的文件会跳过。
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const EFFECTS = path.join(ROOT, 'effects')

const OVERRIDE = `<script>
  // 演示模式：?motion=1 时忽略系统「减少动态效果」，方便查看完整效果；默认遵循系统设置
  (function () {
    var force = new URLSearchParams(location.search).get('motion') === '1'
    if (!force) return
    document.documentElement.classList.add('motion-force')
    var nativeMatchMedia = window.matchMedia.bind(window)
    window.matchMedia = function (query) {
      if (/prefers-reduced-motion/.test(query)) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addEventListener: function () {},
          removeEventListener: function () {},
          addListener: function () {},
          removeListener: function () {},
          dispatchEvent: function () { return false }
        }
      }
      return nativeMatchMedia(query)
    }
  })()
</script>`

const SCROLLBAR = `<style>
  /* 统一的自绘滚动条，避免系统默认样式破坏深色版式 */
  * { scrollbar-width: thin; scrollbar-color: #2b3a5c transparent; }
  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 999px;
    background: #2b3a5c;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover { background: #3a4d78; background-clip: content-box; }
</style>`

const MEDIA_RE = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g

/** 找到与 start 处 '{' 匹配的 '}' 下标 */
function matchBrace(text, openIndex) {
  let depth = 0
  for (let i = openIndex; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1
    else if (text[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/** 给 reduce 媒体块内的每条选择器加前缀 */
function guardReducedMotion(css) {
  let result = ''
  let last = 0
  let match
  MEDIA_RE.lastIndex = 0
  while ((match = MEDIA_RE.exec(css)) !== null) {
    const openBrace = css.indexOf('{', match.index)
    const closeBrace = matchBrace(css, openBrace)
    if (closeBrace === -1) break
    const inner = css.slice(openBrace + 1, closeBrace)
    if (inner.includes('motion-force')) {
      last = closeBrace + 1
      continue
    }
    const guarded = inner.replace(/(^|\})\s*([^{}]+?)\s*\{/g, (whole, prefix, selectors) => {
      const parts = selectors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `html:not(.motion-force) ${s}`)
      return `${prefix}${parts.join(', ')} {`
    })
    result += css.slice(last, openBrace + 1) + guarded + '}'
    last = closeBrace + 1
  }
  result += css.slice(last)
  return result
}

const entries = await fs.readdir(EFFECTS, { withFileTypes: true })
let changed = 0

for (const entry of entries) {
  if (!entry.isDirectory()) continue
  const file = path.join(EFFECTS, entry.name, 'demo.html')
  let html
  try {
    html = await fs.readFile(file, 'utf8')
  } catch {
    continue
  }
  if (html.includes('motion-force')) {
    console.log(`skip  ${entry.name}`)
    continue
  }

  html = html.replace(/<head>/, `<head>\n${OVERRIDE}\n${SCROLLBAR}`)
  html = guardReducedMotion(html)
  await fs.writeFile(file, html, 'utf8')
  console.log(`patch ${entry.name}`)
  changed += 1
}

console.log(`\n处理完成：${changed} 个 demo 已注入动效覆盖与滚动条样式`)
