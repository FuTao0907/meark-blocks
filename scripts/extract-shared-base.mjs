#!/usr/bin/env node
/**
 * 把 demo 里重复的基础层迁移到 effects/shared/base.css：
 *  1. 删除此前注入的滚动条 <style> 块；
 *  2. 在 viewport meta 后插入共享样式 <link>；
 *  3. 从 :root 中删掉共享 token（保留 demo 自己的变量）；
 *  4. 从 body 规则里删掉底色/文字色/字体声明（由共享层提供）；
 *  5. 把硬编码的旧底色/文字色换成 token。
 * 幂等：已含 shared/base.css 的跳过。
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const EFFECTS = path.join(ROOT, 'effects')

const SHARED_TOKENS = /^\s*--(bg|bg-soft|panel|card|line|line-soft|text|muted|accent)\s*:/

function stripSharedTokens(css) {
  let changed = false
  const out = css.replace(/:root\s*\{([\s\S]*?)\}/, (whole, body) => {
    const kept = body
      .split('\n')
      .filter((line) => !SHARED_TOKENS.test(line))
      .join('\n')
      .replace(/\s+$/, '')
    if (kept.trim() === '') {
      changed = true
      return ''
    }
    changed = true
    return `:root {${kept}\n}`
  })
  return { css: out, changed }
}

/** 按分号切分声明，忽略括号内的分号（如 radial-gradient 参数） */
function splitDeclarations(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '(') depth += 1
    else if (ch === ')') depth -= 1
    if (ch === ';' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

function stripBodyBase(css) {
  return css.replace(/(^|[\n}])\s*body\s*\{([\s\S]*?)\}/g, (whole, lead, body) => {
    const decls = splitDeclarations(body)
    const kept = decls.filter(
      (d) =>
        !/^\s*(background|background-color|background-image|color|font-family|-webkit-font-smoothing|-webkit-text-size-adjust)\b/.test(
          d,
        ),
    )
    if (kept.join('').trim() === '') return lead
    return `${lead}body {\n${kept.map((d) => '  ' + d.trim()).join(';\n')};\n}`
  })
}

const entries = await fs.readdir(EFFECTS, { withFileTypes: true })
let changed = 0

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name === 'shared') continue
  const file = path.join(EFFECTS, entry.name, 'demo.html')
  let html
  try {
    html = await fs.readFile(file, 'utf8')
  } catch {
    continue
  }
  if (html.includes('shared/base.css')) {
    console.log(`skip  ${entry.name}`)
    continue
  }

  // 1. 移除注入的滚动条样式块
  html = html.replace(/<style>\s*\/\* 统一的自绘滚动条[\s\S]*?<\/style>\s*/g, '')

  // 2. 插入共享样式
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    '$1\n<link rel="stylesheet" href="../shared/base.css" />',
  )

  // 3. 去掉共享 token
  html = stripSharedTokens(html).css

  // 4. 去掉 body 的基础视觉声明
  html = stripBodyBase(html)

  // 5. 统一旧色值
  html = html.replace(/#0b1020/gi, 'var(--bg)').replace(/#e6ebf5/gi, 'var(--text)')

  await fs.writeFile(file, html, 'utf8')
  console.log(`patch ${entry.name}`)
  changed += 1
}

console.log(`\n完成：${changed} 个 demo 已接入共享基础层`)
