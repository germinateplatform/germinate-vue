import { Pages } from '@/plugins/pages' // adjust to wherever your Pages class lives
import type { Page } from '@/plugins/types/Page'
import type { MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

// Shared across all components, replaces Nuxt's useState
const dynamicTitle = ref<string | undefined>()

export interface BreadcrumbEntry {
  key: string
  title: string
  icon?: string
  iconRotate?: 90 | 180 | 270
  isLast: boolean
  to?: string
  disabled: boolean
}

/**
 * Call from a page to override the label of the last breadcrumb.
 * Resets automatically when the page unmounts.
 */
export function useBreadcrumbTitle (title: MaybeRefOrGetter<string | undefined>) {
  watchEffect(() => {
    dynamicTitle.value = toValue(title)
  })
  onBeforeUnmount(() => {
    dynamicTitle.value = undefined
  })
}

export function useBreadcrumbs () {
  const route = useRoute()
  const { t, te } = useI18n()

  return computed<BreadcrumbEntry[]>(() => {
    const chain: Page[] = []
    let page = Pages.getByRoute(route.path)
    while (page) {
      chain.unshift(page)
      page = page.parent ? Pages.getByName(page.parent) : undefined
    }

    return chain.map((p, i) => {
      const isLast = i === chain.length - 1
      const navigable = p.navigable !== false && !isLast
      return {
        key: p.i18n || p.name,
        title: isLast && dynamicTitle.value ? dynamicTitle.value : ((p.i18n && te(p.i18n)) ? t(p.i18n) : p.name),
        icon: iconOverrides[p.name]?.icon
          ?? (i === 0 ? iconOverrides.first?.icon : undefined)
          ?? (isLast ? iconOverrides.last?.icon : undefined)
          ?? p.icon,
        iconRotate: p.iconRotate,
        isLast,
        to: navigable ? Pages.fillPath(p, route.params) : undefined,
        i18n: p.i18n,
        disabled: false,
      }
    })
  })
}

type IconTarget = 'first' | 'last' | (string & {}) // or a page name, e.g. 'germplasm'

interface IconOverride { owner: symbol, icon: string | undefined }

const iconOverrides = reactive<Record<string, IconOverride | undefined>>({})

/**
 * Call from a page or child component to override a breadcrumb icon.
 * Defaults to the first element. Cleans up on unmount.
 */
export function useBreadcrumbIcon (
  icon: MaybeRefOrGetter<string | undefined>,
  target: IconTarget = 'first',
) {
  const owner = Symbol('breadcrumb-icon')

  watchEffect(() => {
    iconOverrides[target] = { owner, icon: toValue(icon) }
  })

  onBeforeUnmount(() => {
    // only clear if nobody else has taken over in the meantime
    if (iconOverrides[target]?.owner === owner) {
      delete iconOverrides[target]
    }
  })
}
