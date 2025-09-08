<template>
  <ScrollSpy :items="scrollSpyItems" ref="scrollSpy" />
  {{ compProps.germplasmId }}

  <section
    class="pt-3"
    v-for="item in scrollSpyItems"
    :key="`scrollspy-section-${item.href}`"
    style="height: 400px"
    :id="item.href.slice(1)"
    v-intersect.quiet="(isIntersecting: boolean, entries: IntersectionObserverEntry[]) => onIntersect(entries)"
  >
    {{ item.title }}
  </section>
</template>

<script setup lang="ts">
  import ScrollSpy from '@/components/widgets/ScrollSpy.vue'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    germplasmId: number
  }>()

  const store = coreStore()
  const scrollSpy = useTemplateRef('scrollSpy')

  const activeStack: string[] = []
  let activeItem: string | undefined = undefined

  const isMarked = computed(() => store.storeMarkedGermplasm.includes(compProps.germplasmId))

  const scrollSpyItems = computed(() => {
    return [
      { href: '#', tooltip: 'tooltipGermplasmMarkedItem', icon: isMarked.value ? 'mdi-bookmark-check' : 'mdi-bookmark-outline', click: () => markItem() },
      { href: '#mcpd', title: 'pagePassportMcpdTitle' },
      { href: '#links', title: 'pagePassportLinksTitle' },
      { href: '#institution', title: 'pagePassportInstitutionTitle' },
      { href: '#publications', title: 'pagePassportPublicationsTitle' },
      // { href: '#performance', title: f="performanceDataCount > 0">{{ $t('pagePassportTraitStatsTitle' },
      { href: '#datasets', title: 'pagePassportDatasetTitle' },
      { href: '#pedigree', title: 'pagePassportPedigreeTitle' },
      // { href: '#location', title: f="germplasmTableData.latitude && germplasmTableData.longitude">{{ $t('pagePassportLocationTitle' },
      { href: '#images', title: 'pagePassportImageTitle' },
      { href: '#groups', title: 'pagePassportGroupTitle' },
      { href: '#entity', title: 'pagePassportEntityTitle' },
      { href: '#attributes', title: 'pagePassportAttributeTitle' },
    ]
  })

  function markItem () {
    if (isMarked.value) {
      store.removeMarkedIds('germplasm', [compProps.germplasmId])
    } else {
      store.addMarkedIds('germplasm', [compProps.germplasmId])
    }
  }

  function onIntersect (entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeStack.push(entry.target.id)
      } else if (activeStack.includes(entry.target.id)) {
        activeStack.splice(activeStack.indexOf(entry.target.id), 1)
      }
    })
    activeItem = activeStack.at(-1) || activeItem || scrollSpyItems.value[0].href || ''

    scrollSpy.value?.setActive(`#${activeItem}`)
  }
</script>
