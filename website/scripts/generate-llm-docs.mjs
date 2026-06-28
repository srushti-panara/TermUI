#!/usr/bin/env bun
/**
 * generate-llm-docs.mjs
 *
 * Prebuild script that generates:
 *   1. Individual .md files per doc page in public/docs/{section}/{slug}.md
 *   2. Auto-generated llms.txt index linking to all .md endpoints
 *
 * Processing pipeline per MDX file:
 *   - Strip YAML frontmatter (gray-matter)
 *   - Convert HTML <table> blocks to Markdown tables
 *   - Clean MDX escape syntax (\{ \} \*)
 *
 * Mermaid diagrams pass through as-is (they're already clean Markdown).
 * Runs before every `vite build`.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { resolve, join, basename, dirname } from 'path'
import matter from 'gray-matter'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..')
const CONTENT_DIR = join(ROOT, 'content', 'docs')
const PUBLIC_DIR = join(ROOT, 'public')
const DOCS_OUT = join(PUBLIC_DIR, 'docs')
const SITE_URL = 'https://termui.io'

// Section display names and order for llms.txt
const SECTIONS = [
  { dir: 'getting-started', label: 'Getting Started' },
  { dir: 'core', label: 'Core' },
  { dir: 'jsx', label: 'JSX' },
  { dir: 'widgets', label: 'Widgets' },
  { dir: 'ui', label: 'UI Components' },
  { dir: 'tss', label: 'TSS (Theming)' },
  { dir: 'router', label: 'Router' },
  { dir: 'motion', label: 'Motion' },
  { dir: 'store', label: 'Store' },
  { dir: 'data', label: 'Data' },
  { dir: 'adapters', label: 'Adapters' },
  { dir: 'testing', label: 'Testing' },
  { dir: 'cli', label: 'CLI' },
  { dir: 'create-termui-app', label: 'create-termui-app' },
  { dir: 'guides', label: 'Guides' },
]

// ---------------------------------------------------------------------------
// HTML table → Markdown table converter
// ---------------------------------------------------------------------------

function htmlToText(html) {
  if (!html) return ''
  let text = html.replace(/<code>(.*?)<\/code>/gi, '`$1`')
  text = text.replace(/<[^>]+>/g, '')
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#123;/g, '{')
    .replace(/&#125;/g, '}')
    .replace(/&nbsp;/g, ' ')
  return text.trim()
}

function htmlTableToMarkdown(tableHtml) {
  const rows = []
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let trMatch
  while ((trMatch = trRegex.exec(tableHtml)) !== null) {
    const cells = []
    const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
    let cellMatch
    while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
      cells.push(htmlToText(cellMatch[1]))
    }
    if (cells.length > 0) rows.push(cells)
  }

  if (rows.length === 0) return ''

  const colCount = Math.max(...rows.map((r) => r.length))
  for (const row of rows) {
    while (row.length < colCount) row.push('')
  }

  const widths = Array.from({ length: colCount }, (_, i) =>
    Math.max(3, ...rows.map((r) => (r[i] || '').length))
  )

  const lines = []
  const header = rows[0].map((cell, i) => cell.padEnd(widths[i])).join(' | ')
  lines.push(`| ${header} |`)
  const sep = widths.map((w) => '-'.repeat(w)).join(' | ')
  lines.push(`| ${sep} |`)
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r].map((cell, i) => cell.padEnd(widths[i])).join(' | ')
    lines.push(`| ${row} |`)
  }

  return lines.join('\n')
}

function convertHtmlTables(content) {
  return content.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (match) => {
    return htmlTableToMarkdown(match)
  })
}

// ---------------------------------------------------------------------------
// MDX-specific cleanup
// ---------------------------------------------------------------------------

function cleanMdxSyntax(content) {
  // Remove JSX import lines
  content = content.replace(/^import\s+.*$/gm, '')

  // Remove JSX self-closing component tags like <PackageDependencyGraph />
  content = content.replace(/^\s*<[A-Z][A-Za-z]+ \/>\s*$/gm, '')

  // Extract Mermaid from JSX comments: {/* mermaid ... */}
  content = content.replace(
    /\{\/\*\s*mermaid\n([\s\S]*?)\*\/\}/g,
    (_, code) => '```mermaid\n' + code.trim() + '\n```'
  )

  // Replace \{ and \} with { and }
  content = content.replace(/\\{/g, '{').replace(/\\}/g, '}')
  // Replace \* (MDX escape) back to *
  content = content.replace(/\\\*/g, '*')

  // Clean up excess blank lines (3+ → 2)
  content = content.replace(/\n{3,}/g, '\n\n')

  return content
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const pages = []

for (const section of SECTIONS) {
  const sectionDir = join(CONTENT_DIR, section.dir)
  let files
  try {
    files = readdirSync(sectionDir).filter((f) => f.endsWith('.mdx')).sort()
  } catch {
    continue
  }

  for (const file of files) {
    const slug = basename(file, '.mdx')
    const fullPath = join(sectionDir, file)
    const raw = readFileSync(fullPath, 'utf-8')
    const { data: frontmatter, content } = matter(raw)

    let processed = content.trim()
    processed = convertHtmlTables(processed)
    processed = cleanMdxSyntax(processed)

    pages.push({
      section: section.dir,
      sectionLabel: section.label,
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      content: processed,
    })
  }
}

// 1. Write individual .md files
let count = 0
for (const page of pages) {
  const outDir = join(DOCS_OUT, page.section)
  mkdirSync(outDir, { recursive: true })

  const outPath = join(outDir, `${page.slug}.md`)
  writeFileSync(outPath, page.content + '\n', 'utf-8')
  count++
}

console.log(`[generate-llm-docs] Generated ${count} .md files in public/docs/`)

// 2. Generate llms.txt
const llmsTxtLines = [
  '# TermUI',
  '',
  '> TypeScript framework for building terminal user interfaces.',
  '> 15 packages, 230 components, MIT license, Node.js 18+, zero C extensions.',
  '> Own JSX runtime (no React dependency). Flexbox layout, CSS-like theming,',
  '> spring animations, history-based routing, Zustand-style state, hot-reload dev server.',
  '> Unlike Ink (which depends on React), TermUI ships its own JSX runtime.',
  '',
  `Install with \`npx create-termui-app my-app\`, add a component with \`npx termuijs add spinner\`, or add a package directly with \`npm install @termuijs/core\`.`,
  '',
  `The 15 packages are: \`@termuijs/core\`, \`@termuijs/widgets\`, \`@termuijs/ui\`, \`@termuijs/jsx\`, \`@termuijs/store\`, \`@termuijs/tss\`, \`@termuijs/router\`, \`@termuijs/motion\`, \`@termuijs/data\`, \`@termuijs/adapters\`, \`@termuijs/testing\`, \`@termuijs/dev-server\`, \`@termuijs/quick\`, \`@termuijs/cli\`, and \`create-termui-app\`.`,
  '',
  `- [Full Documentation](${SITE_URL}/llms-full.txt): Complete reference with code examples and FAQ in one file.`,
  '',
]

let currentSection = ''
for (const page of pages) {
  if (page.sectionLabel !== currentSection) {
    currentSection = page.sectionLabel
    llmsTxtLines.push(`## ${currentSection}`)
    llmsTxtLines.push('')
  }

  const mdUrl = `${SITE_URL}/docs/${page.section}/${page.slug}.md`
  const desc = page.description ? `: ${page.description}` : ''
  llmsTxtLines.push(`- [${page.title}](${mdUrl})${desc}`)
}

llmsTxtLines.push('')

writeFileSync(join(PUBLIC_DIR, 'llms.txt'), llmsTxtLines.join('\n'), 'utf-8')
console.log(`[generate-llm-docs] Generated llms.txt with ${pages.length} entries`)
