export interface HelpEntryConfig {
  key?: string
  label?: string
  content?: string
  url?: string
  teleportTargetId?: string
}

export interface HelpEntry extends Omit<HelpEntryConfig, 'key'> {
  id: symbol
  key?: string
  count: number
}

const entries = ref<HelpEntry[]>([])
const isDrawerOpen = ref(false)
const isTargetReady = ref(false)

export function useHelpRegistryProvider () {
  const hasHelp = computed(() => entries.value.length > 0)

  async function openDrawer () {
    isDrawerOpen.value = true
    await nextTick()

    const targetIds = entries.value
      .map(entry => entry.teleportTargetId)
      .filter(function (id): id is string {
        return Boolean(id)
      })

    isTargetReady.value = targetIds.every(id => Boolean(document.getElementById(id)))
  }

  function closeDrawer () {
    isDrawerOpen.value = false
    isTargetReady.value = false
  }

  return {
    entries,
    hasHelp,
    isDrawerOpen,
    isTargetReady,
    openDrawer,
    closeDrawer,
  }
}

export function useHelpRegistration (config: HelpEntryConfig) {
  const existingIndex = config.key
    ? entries.value.findIndex(item => item.key === config.key)
    : -1

  let activeEntry: HelpEntry

  if (existingIndex !== -1) {
    const existing = entries.value[existingIndex]
    const updated: HelpEntry = {
      ...existing,
      count: existing.count + 1,
    }
    const nextEntries = [...entries.value]
    nextEntries[existingIndex] = updated
    entries.value = nextEntries
    activeEntry = updated
  } else {
    activeEntry = {
      ...config,
      id: Symbol('help-entry'),
      count: 1,
    }
    entries.value = [...entries.value, activeEntry]
  }

  onScopeDispose(function () {
    const idx = entries.value.findIndex(item => item.id === activeEntry.id)
    if (idx === -1) {
      return
    }

    const current = entries.value[idx]
    if (current.count > 1) {
      const nextEntries = [...entries.value]
      nextEntries[idx] = {
        ...current,
        count: current.count - 1,
      }
      entries.value = nextEntries
    } else {
      entries.value = entries.value.filter(item => item.id !== current.id)
    }
  })

  return activeEntry
}
