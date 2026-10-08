<template>
  <v-card v-if="displayData && publication" class="d-flex flex-column">
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

      <v-chip label class="me-2 mt-1" v-if="publication.isDatabasePub" :color="publicationTypes.database.color()" :prepend-icon="publicationTypes.database.path" :text="publicationTypes.database.text()" />
      <v-chip label class="me-2 mt-1" v-if="publication.germplasmIds && publication.germplasmIds.length > 0" :color="publicationTypes.germplasm.color()" :prepend-icon="publicationTypes.germplasm.path" :text="publicationTypes.germplasm.text()">
        <template #append>
          <v-badge inline :content="publication.germplasmIds.length" />
        </template>
      </v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.datasetIds && publication.datasetIds.length > 0" :color="publicationTypes.dataset.color()" :prepend-icon="publicationTypes.dataset.path" :text="publicationTypes.dataset.text()">
        <template #append>
          <v-badge inline class="ms-1" color="muted" :content="publication.datasetIds.length" />
        </template>
      </v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.experimentIds && publication.experimentIds.length > 0" :color="publicationTypes.experiment.color()" :prepend-icon="publicationTypes.experiment.path" :text="publicationTypes.experiment.text()">
        <template #append>
          <v-badge inline class="ms-1" color="muted" :content="publication.experimentIds.length" />
        </template>
      </v-chip>
      <v-chip label class="me-2 mt-1" v-if="publication.groupIds && publication.groupIds.length > 0" :color="publicationTypes.group.color()" :prepend-icon="publicationTypes.group.path" :text="publicationTypes.group.text()">
        <template #append>
          <v-badge inline class="ms-1" color="muted" :content="publication.groupIds.length" />
        </template>
      </v-chip>
    </v-card-text>

    <v-card-actions v-if="displayData.URL">
      <v-btn
        icon="$doi"
        color="primary"
        :href="displayData.URL"
        target="_blank"
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
  import type { ViewTablePublications } from '@/plugins/types/germinate'
  import { publicationTypes } from '@/plugins/util/types'
  import { mdiNewspaper } from '@mdi/js'
  import { Pages } from '@/plugins/pages'
  import { getPublicationData } from '@/plugins/util/formatting'

  const store = useCoreStore()
  const route = useRoute()

  const {
    canDelete = true,
    publication = undefined,
  } = defineProps<{
    canDelete?: boolean
    publication?: ViewTablePublications
  }>()

  const emit = defineEmits(['delete'])

  const displayData = computed(() => {
    if (publication) {
      return getPublicationData(publication)
    } else {
      return undefined
    }
  })
</script>
