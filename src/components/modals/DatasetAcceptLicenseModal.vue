<template>
  <v-dialog v-model="dialog" scrollable max-width="min(1024px, 75vw)" max-height="75vh">
    <v-card
      class="text-wrap"
      :title="compProps.story.storyName"
      :subtitle="compProps.story.storyDescription"
      v-if="compProps.story"
    >
      <v-card-text>
        <v-alert color="warning" class="mb-3" border="start" variant="tonal" :icon="mdiInformation">{{ $t('modalTextStoryAcceptDataset') }}</v-alert>

        <DatasetTable
          :filter-on="datasetFilter"
          :get-data="getData"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="hide" :text="$t('buttonClose')" />
        <v-btn :disabled="!allAccepted" :text="$t('buttonPreview')" @click="accept" color="primary" variant="tonal" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { FilterComparator, FilterOperator, type ViewTableDatasets, type PaginatedRequest, type ViewTableStoriesEnriched } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { mdiInformation } from '@mdi/js'

  const compProps = defineProps<{
    story: ViewTableStoriesEnriched
  }>()

  const store = coreStore()
  const dialog = ref(false)

  const datasets = shallowRef<ViewTableDatasets[]>([])

  const allAccepted = computed(() => !datasets.value.some(ds => !isAccepted(ds)))

  const datasetFilter = computed(() => {
    return [{
      filters: [{
        column: 'datasetId',
        comparator: FilterComparator.inSet,
        values: (compProps.story.storyRequirements?.datasetIds || []).map(String),
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function accept () {
    emit('accepted')
    hide()
  }

  function getData (data: PaginatedRequest) {
    const copy = JSON.parse(JSON.stringify(data)) as PaginatedRequest
    copy.page = 1
    copy.limit = MAX_JAVA_INTEGER
    return apiPostDatasetTable(copy, result => {
      datasets.value = result?.data || []
    })
  }

  function isAccepted (dataset: ViewTableDatasets) {
    if (store.storeToken) {
      return dataset.acceptedBy && dataset.acceptedBy.includes(store.storeToken.id)
    } else {
      return dataset.acceptedBy && dataset.acceptedBy.includes(-1000)
    }
  }

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  defineExpose({
    show,
    hide,
  })

  const emit = defineEmits(['accepted'])
</script>
