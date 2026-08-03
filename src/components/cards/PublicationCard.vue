<template>
  <v-card variant="tonal" v-if="displayData && publication" class="d-flex flex-column">
    <v-card-text class="flex-grow-1">
      <v-chip label color="muted" variant="tonal" :prepend-icon="mdiNewspaper">{{ displayData['container-title'] }}</v-chip>

      <p class="text-headline-small font-weight-black">
        <router-link
          v-if="route.name !== Pages.publicationDetails.name"
          :to="Pages.getPath(Pages.publicationDetails, `${publication.publicationId}`)"
        >
          <span v-html="displayData.title" class="g-trim-rows-3" />
        </router-link>
        <span v-html="displayData.title" class="g-trim-rows-3" v-else />
      </p>

      <p v-if="displayData.date">
        {{ displayData.date }}
      </p>

      <div class="text-medium-emphasis g-trim-rows-2">
        <span v-html="displayData.fullReference" />
      </div>

      <v-chip label class="me-2 mt-1" v-if="publication.isDatabasePub" :color="publicationTypes.database.color()" :prepend-icon="publicationTypes.database.path">{{ publicationTypes.database.text() }}</v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.germplasmIds && publication.germplasmIds.length > 0" :color="publicationTypes.germplasm.color()" :prepend-icon="publicationTypes.germplasm.path">{{ publicationTypes.germplasm.text() }} ({{ publication.germplasmIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.datasetIds && publication.datasetIds.length > 0" :color="publicationTypes.dataset.color()" :prepend-icon="publicationTypes.dataset.path">{{ publicationTypes.dataset.text() }} ({{ publication.datasetIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.experimentIds && publication.experimentIds.length > 0" :color="publicationTypes.experiment.color()" :prepend-icon="publicationTypes.experiment.path">{{ publicationTypes.experiment.text() }} ({{ publication.experimentIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.groupIds && publication.groupIds.length > 0" :color="publicationTypes.group.color()" :prepend-icon="publicationTypes.group.path">{{ publicationTypes.group.text() }} ({{ publication.groupIds.length }})</v-chip>
    </v-card-text>

    <v-card-actions v-if="displayData.URL">
      <v-btn
        icon="$doi"
        color="primary"
        :href="displayData.URL"
        v-tooltip:top="$t('buttonReadMore')"
      />

      <v-spacer />

      <v-btn
        v-if="canDelete && store.storeUserIsDataCurator"
        @click="emit('delete')"
        color="error"
        :text="$t('buttonDelete')"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { PublicationDoiLookupDetails, ViewTablePublications } from '@/plugins/types/germinate'
  // @ts-ignore
  import { Cite } from '@citation-js/core'
  import '@citation-js/plugin-doi'
  import '@citation-js/plugin-csl'
  import { coreStore } from '@/stores/app'
  import { publicationTypes } from '@/plugins/util/types'
  import { mdiNewspaper } from '@mdi/js'
  import { Pages } from '@/plugins/pages'

  const store = coreStore()
  const route = useRoute()

  const {
    canDelete = true,
    publication = undefined,
  } = defineProps<{
    canDelete?: boolean
    publication?: ViewTablePublications
  }>()

  const emit = defineEmits(['delete'])

  function getFromCache () {
    if (!publication) {
      return undefined
    }

    try {
      const citation = new Cite(publication.publicationFallbackCache)

      if (citation && citation.data && citation.data.length > 0) {
        const result = citation.format('data', { format: 'object' })[0]
        result.fullReference = citation.format('bibliography', { format: 'html', template: 'apa' })
        return result
      } else {
        return {
          title: 'N/A',
          fullReference: 'N/A',
          URL: publication.publicationDoi,
        }
      }
    } catch {
      return {
        title: 'N/A',
        fullReference: 'N/A',
        URL: publication.publicationDoi,
      }
    }
  }

  const displayData = computed(() => {
    if (publication) {
      let result: PublicationDoiLookupDetails

      if (publication.publicationFallbackCache) {
        result = getFromCache()
      } else {
        try {
          const citation = Cite.async(publication.publicationDoi.trim())
          if (citation && citation.data && citation.data.length > 0) {
            const temp = citation.format('data', { format: 'object' })[0]
            result = {
              title: temp.title,
              fullReference: citation.format('bibliography', { format: 'html', template: 'apa' }),
              URL: temp.URL,
              date: (temp.issued && temp.issued['date-parts'] && temp.issued['date-parts'].length > 0 && temp.issued['date-parts'][0].length > 0) ? temp.issued['date-parts'][0][0] : undefined,
              'container-title': temp['container-title'],
            }
          } else {
            result = getFromCache()
          }
        } catch {
          result = getFromCache()
        }
      }
      return result
    } else {
      return undefined
    }
  })
</script>
