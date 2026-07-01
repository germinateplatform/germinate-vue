<template>
  <div>
    <v-select
      v-model="selectedShapefile"
      :items="shapefiles"
      :label="$t('formLabelTraitTimelineShapefile')"
      return-object
      clearable
      item-key="fileresourceId"
      item-title="fileresourceName"
      v-if="shapefiles"
    />

    <template v-if="datasetsWithLayout">
      <TrialLayout
        v-for="dataset in datasetsWithLayout"
        :key="`trial-layout-${dataset.datasetId}`"
        :dataset="dataset"
        :traits="traits"
      />
    </template>

    <LocationMap map-type="cluster" :shapefile-id="selectedShapefile?.fileresourceId" :locations="locations" ref="map" />
  </div>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetfileresource } from '@/plugins/api/dataset'
  import { apiPostTrialLocations } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableDatasets, type ViewTableFileresources, type ViewTableLocations, type ViewTableTraits } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    datasets: ViewTableDatasets[]
    traits: ViewTableTraits[]
    hasLayout?: boolean[]
  }>()

  const locations = ref<ViewTableLocations[]>([])
  const shapefiles = ref<ViewTableFileresources[]>([])
  const selectedShapefile = ref<ViewTableFileresources>()
  const map = useTemplateRef('map')

  const datasetsWithLayout = computed(() => {
    if (compProps.datasets && compProps.hasLayout && compProps.datasets.length === compProps.hasLayout.length) {
      return compProps.datasets.filter((ds, index) => compProps.hasLayout?.[index] === true)
    } else {
      return []
    }
  })

  function update () {
    if (!compProps.datasets || compProps.datasets.length === 0) {
      return
    }

    const query = {
      datasetIds: compProps.datasets.map(ds => ds.datasetId || -1),
    }

    emitter.emit('show-loading', true)

    apiPostTrialLocations(query, result => {
      if (result) {
        locations.value = result
      } else {
        locations.value = []
      }

      emitter.emit('show-loading', false)
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no data.
        emitter.emit('show-loading', false)
      },
    })

    apiPostDatasetfileresource<PaginatedResult<ViewTableFileresources[]>>({
      datasetIds: compProps.datasets.map(ds => ds.datasetId || -1),
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'fileresourcetypeName',
          comparator: FilterComparator.equals,
          values: ['Trials Shapefile'],
        }],
        operator: FilterOperator.and,
      }],
    }, result => {
      if (result && result.data) {
        shapefiles.value = result.data
      } else {
        shapefiles.value = []
      }
    })
  }

  function invalidateSize () {
    map.value?.invalidateSize()
  }

  onMounted(() => update())

  defineExpose({
    invalidateSize,
  })
</script>
