#!/usr/bin/env node
/**
 * 单块/多块校验器。并行生产积木时使用，避免扫描到其他代理正在写入的目录。
 * 用法：node scripts/check-block.mjs <id> [id...]
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const EFFECTS = path.join(ROOT, 'effects')
const ids = process.argv.slice(2)

if (ids.length === 0) {
  console.error('用法: node scripts/check-block.mjs <id> [id...]')
  process.exit(1)
}

const REQUIRED_HEADINGS = ['目标', '触发与行为', '参数', '技术中性约束', '降级与可访问性', '验收', '不要做']
const META_REQUIRED = ['id', 'name', 'category', 'scenes', 'feel', 'params', 'a11y', 'notFor', 'preview', 'version', 'updated']
const BANNED = [
  [/\bReact\b/, 'React'],
  [/\buseState\b/, 'useState'],
  [/\buseEffect\b/, 'useEffect'],
  [/\buseRef\b/, 'useRef'],
  [/\bVue\b/, 'Vue'],
  [/\breactive\b/, 'reactive'],
  [/\bdefineComponent\b/, 'defineComponent'],
  [/\bonMounted\b/, 'onMounted'],
  [/\bclassName\b/, 'className'],
  [/\bref\(/, 'ref('],
  [/\.vue\b/, '.vue'],
  [/\.jsx\b/, '.jsx'],
  [/<script setup>/, '<script setup>'],
]

const errors = []

for (const id of ids) {
  const dir = path.join(EFFECTS, id)
  for (const file of ['meta.json', 'prompt.md', 'demo.html']) {
    try {
      await fs.access(path.join(dir, file))
    } catch {
      errors.push(`${id}: 缺少 ${file}`)
      continue
    }
  }
  if (errors.some((e) => e.startsWith(`${id}: 缺少`))) continue

  let meta
  try {
    meta = JSON.parse(await fs.readFile(path.join(dir, 'meta.json'), 'utf8'))
  } catch (e) {
    errors.push(`${id}: meta.json 解析失败 ${e.message}`)
    continue
  }

  for (const key of META_REQUIRED) {
    if (meta[key] === undefined || meta[key] === null) errors.push(`${id}: meta 缺少 ${key}`)
  }
  if (meta.id !== id) errors.push(`${id}: meta.id 与目录名不一致（${meta.id}）`)
  if (!Array.isArray(meta.params)) errors.push(`${id}: params 必须是数组`)
  if (!Array.isArray(meta.scenes) || meta.scenes.length === 0) errors.push(`${id}: scenes 不能为空`)
  if (!Array.isArray(meta.feel) || meta.feel.length === 0) errors.push(`${id}: feel 不能为空`)
  if (!Array.isArray(meta.notFor) || meta.notFor.length === 0) errors.push(`${id}: notFor 不能为空`)

  const promptMd = await fs.readFile(path.join(dir, 'prompt.md'), 'utf8')
  for (const h of REQUIRED_HEADINGS) {
    if (!promptMd.includes(`## ${h}`)) errors.push(`${id}: prompt.md 缺少标题「## ${h}」`)
  }
  for (const [re, label] of BANNED) {
    if (re.test(promptMd)) errors.push(`${id}: 通用层出现框架专有写法「${label}」`)
  }
  const keys = (meta.params ?? []).map((p) => p.key)
  for (const key of keys) {
    if (!promptMd.includes(`{{${key}}}`)) errors.push(`${id}: 参数 {{${key}}} 未在 prompt.md 中使用`)
  }

  const demo = await fs.readFile(path.join(dir, 'demo.html'), 'utf8')
  const links = (demo.match(/https?:\/\/[^\s"'<>)]+/g) ?? []).filter((u) => !u.includes('www.w3.org'))
  if (links.length) errors.push(`${id}: demo.html 有外部资源 ${links.slice(0, 2).join(', ')}`)
  if (!demo.includes('prefers-reduced-motion')) errors.push(`${id}: demo.html 缺少 reduced-motion 降级`)
  if (demo.length < 800) errors.push(`${id}: demo.html 过短（${demo.length} 字节），疑似占位`)

  if (!errors.some((e) => e.startsWith(`${id}:`))) console.log(`✓ ${id}`)
}

if (errors.length) {
  console.error(`\n${errors.length} 项问题：`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(`\n全部通过（${ids.length} 块）`)
