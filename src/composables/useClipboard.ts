import { ref } from 'vue'

export function useClipboard() {
  const copiedKey = ref('')
  let timer: number | undefined

  function fallbackCopy(text: string): boolean {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }

  async function copy(text: string, key = 'default'): Promise<boolean> {
    let ok = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        ok = true
      } else {
        ok = fallbackCopy(text)
      }
    } catch {
      ok = fallbackCopy(text)
    }
    if (ok) {
      copiedKey.value = key
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        copiedKey.value = ''
      }, 1800)
    }
    return ok
  }

  return { copy, copiedKey }
}
