export interface ParamDef {
  key: string
  label: string
  default: string | number
  type: 'number' | 'string' | 'select'
  unit?: string
  options?: string[]
}

export interface BlockPrompt {
  goal: string
  behavior: string
  params: string
  constraints: string
  a11y: string
  acceptance: string
  avoid: string
}

export interface Block {
  id: string
  name: string
  aka: string[]
  category: string
  subcategory: string
  scenes: string[]
  feel: string[]
  params: ParamDef[]
  a11y: string
  notFor: string[]
  preview: string
  version: number
  updated: string
  prompt: BlockPrompt
  promptRaw: string
}

export interface Catalog {
  generatedAt: string
  adapters: Record<string, string>
  blocks: Block[]
}

export type Stack = 'vanilla' | 'vue3' | 'react'

export interface Profile {
  stack: Stack
  styling: 'native' | 'cssModules' | 'tailwind'
  deps: 'zero' | 'allowed'
  output: 'single' | 'multi'
}
