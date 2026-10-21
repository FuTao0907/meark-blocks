#!/usr/bin/env node
/**
 * 扫描 effects/ 目录，校验每块积木，生成 public/catalog.json 并复制 demo。
 *
 * 校验项：
 *  1. meta.json 必填字段齐全，id 与目录名一致且唯一
 *  2. prompt.md 七个固定标题齐全
 *  3. 通用提示词中不得出现框架专有写法（这是"提示词通用"的硬保证）
 *  4. demo.html 不得引用外部网络资源
 *
 * 用法：
 *   node scripts/build-catalog.mjs           生成 catalog.json + 复制 demo
 *   node scripts/build-catalog.mjs --check   只校验，不写文件
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const EFFECTS_DIR = path.join(ROOT, 'effects')
const ADAPTERS_DIR = path.join(ROOT, 'adapters')
const PUBLIC_DIR = path.join(ROOT, 'public')
const CHECK_ONLY = process.argv.includes('--check')

const REQUIRED_HEADINGS = [
  '目标',
  '触发与行为',
  '参数',
  '技术中性约束',
  '降级与可访问性',
  '验收',
  '不要做',
]

const HEADING_TO_KEY = {
  目标: 'goal',
  触发与行为: 'behavior',
  参数: 'params',
  技术中性约束: 'constraints',
  降级与可访问性: 'a11y',
  验收: 'acceptance',
  不要做: 'avoid',
}

/** 通用层禁词：出现即说明提示词绑死了某个框架 */
const BANNED_PATTERNS = [
  { re: /\bReact\b/, why: 'React' },
  { re: /\buseState\b/, why: 'useState' },
  { re: /\buseEffect\b/, why: 'useEffect' },
  { re: /\buseRef\b/, why: 'useRef' },
  { re: /\bVue\b/, why: 'Vue' },
  { re: /\breactive\b/, why: 'reactive' },
  { re: /\bdefineComponent\b/, why: 'defineComponent' },
  { re: /\bonMounted\b/, why: 'onMounted' },
  { re: /\bclassName\b/, why: 'className' },
  { re: /\bref\(/, why: 'ref()' },
  { re: /\.vue\b/, why: '.vue' },
  { re: /\.jsx\b/, why: '.jsx' },
  { re: /<script setup>/, why: '<script setup>' },
]

const META_REQUIRED = ['id', 'name', 'category', 'scenes', 'feel', 'params', 'a11y', 'notFor', 'preview', 'version', 'updated']

const errors = []
const warnings = []

function err(msg) {
  errors.push(msg)
}
function warn(msg) {
  warnings.push(msg)
}

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`${path.relative(ROOT, file)} JSON 解析失败：${e.message}`)
  }
}

/** 把 prompt.md 按二级标题切成段 */
function parsePrompt(md, id) {
  const sections = {}
  const lines = md.split(/\r?\n/)
  let current = null
  const body = {}
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) {
      current = m[1].trim()
      body[current] = []
    } else if (current) {
      body[current].push(line)
    }
  }
  for (const heading of REQUIRED_HEADINGS) {
    if (!(heading in body)) {
      err(`${id}: prompt.md 缺少标题「## ${heading}」`)
      continue
    }
    const text = body[heading].join('\n').trim()
    if (!text) err(`${id}: prompt.md 的「${heading}」为空`)
    sections[HEADING_TO_KEY[heading]] = text
  }
  return sections
}

function checkBanned(text, id, where) {
  for (const { re, why } of BANNED_PATTERNS) {
    if (re.test(text)) {
      err(`${id}: ${where} 出现框架专有写法「${why}」，通用层必须与框架无关`)
    }
  }
}

function checkDemoExternal(html, id) {
  const matches = html.match(/https?:\/\/[^\s"'<>)]+/g) ?? []
  const external = matches.filter((u) => !u.includes('www.w3.org'))
  if (external.length > 0) {
    err(`${id}: demo.html 引用了外部资源（${external.slice(0, 3).join(', ')}），演示必须零外链`)
  }
}

async function main() {
  const entries = await fs.readdir(EFFECTS_DIR, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()

  const ids = new Set()
  const blocks = []
  const demos = []

  for (const dir of dirs) {
    const base = path.join(EFFECTS_DIR, dir)
    const metaFile = path.join(base, 'meta.json')
    const promptFile = path.join(base, 'prompt.md')
    const demoFile = path.join(base, 'demo.html')

    for (const [file, label] of [
      [metaFile, 'meta.json'],
      [promptFile, 'prompt.md'],
      [demoFile, 'demo.html'],
    ]) {
      try {
        await fs.access(file)
      } catch {
        err(`${dir}: 缺少 ${label}`)
      }
    }
    if (errors.some((e) => e.startsWith(`${dir}: 缺少`))) continue

    const meta = await readJson(metaFile)
    for (const key of META_REQUIRED) {
      if (meta[key] === undefined || meta[key] === null) {
        err(`${dir}: meta.json 缺少字段「${key}」`)
      }
    }
    if (meta.id !== dir) {
      err(`${dir}: meta.json 的 id「${meta.id}」与目录名不一致`)
    }
    if (ids.has(meta.id)) err(`${dir}: id「${meta.id}」重复`)
    ids.add(meta.id)
    if (!Array.isArray(meta.params)) err(`${dir}: params 必须是数组`)

    const promptMd = await fs.readFile(promptFile, 'utf8')
    const prompt = parsePrompt(promptMd, dir)
    checkBanned(promptMd, dir, 'prompt.md')

    const demoHtml = await fs.readFile(demoFile, 'utf8')
    checkDemoExternal(demoHtml, dir)

    blocks.push({
      ...meta,
      prompt,
      promptRaw: promptMd.trim(),
    })
    demos.push({ id: dir, html: demoHtml })
  }

  // 适配层
  const adapters = {}
  try {
    const files = (await fs.readdir(ADAPTERS_DIR)).filter((f) => f.endsWith('.md'))
    for (const f of files) {
      adapters[path.basename(f, '.md')] = (await fs.readFile(path.join(ADAPTERS_DIR, f), 'utf8')).trim()
    }
  } catch {
    warn('未找到 adapters/ 目录，技术栈适配层为空')
  }
  if (!adapters.vue3) warn('缺少 adapters/vue3.md')
  if (!adapters.react) warn('缺少 adapters/react.md')
  if (!adapters.vanilla) warn('缺少 adapters/vanilla.md')

  console.log(`\n扫描 effects/：${dirs.length} 个目录，${blocks.length} 块有效积木`)
  for (const b of blocks) {
    console.log(`  ✓ ${b.id.padEnd(20)} ${b.name}`)
  }
  for (const w of warnings) console.log(`  ! ${w}`)

  if (errors.length > 0) {
    console.error(`\n校验失败（${errors.length} 项）：`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exit(1)
  }

  if (CHECK_ONLY) {
    console.log('\n校验通过（--check 模式，未写文件）。\n')
    return
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true })
  for (const d of demos) {
    const outDir = path.join(PUBLIC_DIR, 'effects', d.id)
    await fs.mkdir(outDir, { recursive: true })
    await fs.writeFile(path.join(outDir, 'demo.html'), d.html, 'utf8')
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    adapters,
    blocks: blocks.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
  }
  await fs.writeFile(path.join(PUBLIC_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8')
  console.log(`\n已生成 public/catalog.json（${blocks.length} 块）与 ${demos.length} 个 demo。\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
