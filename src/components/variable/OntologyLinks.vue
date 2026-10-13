<template>
  <v-chip-group v-if="ontologyInfo && ontologyInfo.length > 0">
    <v-chip
      v-for="ont in asLinks"
      :key="`ontology-info-${ont.text}-${ont.to}`"
      :href="ont.to"
      :text="ont.text"
      label
      target="_blank"
      :prepend-icon="types[ont.type]?.icon || mdiOpenInNew"
      v-tooltip:top="types[ont.type]?.name"
      size="small"
    />
  </v-chip-group>
</template>

<script setup lang="ts">
  import type { OntologyInfo } from '@/plugins/types/germinate'
  import { toAgroPortalUrl, toCropOntologyUrl } from '@/plugins/util/formatting'
  import { mdiOpenInNew } from '@mdi/js'

  const compProps = defineProps<{
    ontologyInfo: OntologyInfo[]
  }>()

  interface Link {
    text: string
    type: 'agroportal' | 'cropontology'
    to?: string
  }

  interface Type {
    name: string
    icon: string
  }

  const types = ref<{ [index: string]: Type }>({
    agroportal: {
      name: 'AgroPortal',
      icon: '$agroportal',
    },
    cropontology: {
      name: 'CropOntology',
      icon: '$cropontology',
    }
  })

  const asLinks: ComputedRef<Link[]> = computed(() => {
    const result: Link[] = []
    compProps.ontologyInfo.forEach(oi => {
      result.push({
        text: oi.ontologyPuid,
        type: 'agroportal',
        to: toAgroPortalUrl(oi.ontologyPuid),
      })
    })

    compProps.ontologyInfo.forEach(oi => {
      result.push({
        text: oi.ontologyPuid,
        type: 'cropontology',
        to: toCropOntologyUrl(oi.ontologyPuid),
      })
    })

    return result.filter(r => r.to !== undefined)
  })
</script>
