<template>
  <v-card variant="tonal" v-if="displayData">
    <v-card-text>
      <div>{{ displayData.container }}</div>

      <p class="text-h5 font-weight-black">{{ displayData.title }}</p>

      <p v-if="displayData.date">
        {{ displayData.date }}
      </p>

      <div class="text-medium-emphasis limit-rows">
        <span v-html="displayData.fullReference" />
      </div>
    </v-card-text>

    <v-card-actions v-if="displayData.URL">
      <v-btn
        color="primary"
        :href="displayData.URL"
        :text="$t('buttonReadMore')"
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

  const store = coreStore()

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

<style scoped>
.limit-rows {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
}
</style>
