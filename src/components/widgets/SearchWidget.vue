<template>
  <div>
    <h1 class="text-headline-large mb-3">{{ $t('pageSearchTitle') }}</h1>
    <v-divider class="mb-3" />

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-form @submit.prevent="initiateSearch">
          <v-text-field
            :label="$t('formLabelSearchTerm')"
            v-model="tempLocalSearchTerm"
            hide-details
            :append-inner-icon="mdiMagnify"
            @click:append-inner="initiateSearch"
          />
        </v-form>

        <v-chip-group
          v-model="selectedTypes"
          mandatory
          multiple
          filter
          column
        >
          <v-chip
            v-for="category in allCategories"
            :key="`search-type-${category.key}`"
            :text="category.title"
            :color="category.color"
            :value="category.key"
            :prepend-icon="category.icon"
            label
          />
        </v-chip-group>
      </v-col>
    </v-row>

    <v-tabs
      v-if="hasSearchTerm"
      center-active
      scroll-to-active
      grow
      class="my-5"
    >
      <v-tab
        v-for="(tab, index) in searchCategories" :key="`search-tab-${tab.key}`"
        :text="tab.title"
        :prepend-icon="tab.icon"
        :base-color="visiblePanel === tab.key ? getTemplateColor(index) : 'muted'"
        variant="tonal"
        @click="visiblePanel = tab.key"
      >
        <template #append>
          <v-chip label size="small" :text="getNumberWithSuffix(stats[tab.key].value || 0, 1)" v-if="stats[tab.key].loading === false" />
          <v-progress-circular indeterminate v-else size="small" />
        </template>
      </v-tab>
    </v-tabs>

    <template v-if="hasSearchTerm">
      <GermplasmTable v-if="selectedTypes.includes('germplasm')" v-show="visiblePanel === 'germplasm'" :get-data="getGermplasmData" :get-ids="getGermplasmIds" :download="downloadGermplasmTable" :filter-on="initialFilters.germplasm" />
      <GermplasmAttributeTable v-if="selectedTypes.includes('germplasmAttributes')" v-show="visiblePanel === 'germplasmAttributes'" :get-data="getGermplasmAttributeData" :filter-on="initialFilters.germplasmAttributes" />
      <TraitDataTable v-if="selectedTypes.includes('trialData')" v-show="visiblePanel === 'trialData'" :get-data="getTraitData" :get-ids="getTraitIds" :download="downloadTraitData" :filter-on="initialFilters.traitData" />
      <ClimateDataTable v-if="selectedTypes.includes('climateData')" v-show="visiblePanel === 'climateData'" :get-data="getClimateData" :get-ids="getClimateIds" :download="downloadClimateData" :filter-on="initialFilters.climateData" />
      <MapDefinitionTable v-if="selectedTypes.includes('markers')" v-show="visiblePanel === 'markers'" :get-data="getMarkerData" :get-ids="getMarkerIds" :download="downloadMarkerData" :filter-on="initialFilters.mapdefinitions" />
      <DatasetTable v-if="selectedTypes.includes('datasets')" v-show="visiblePanel === 'datasets'" :get-data="getDatasetData" :filter-on="initialFilters.datasets" />
      <DatasetAttributeTable v-if="selectedTypes.includes('datasetAttributes')" v-show="visiblePanel === 'datasetAttributes'" :get-data="getDatasetAttributeData" :filter-on="initialFilters.datasetAttributes" />
      <PedigreeTable v-if="selectedTypes.includes('pedigreeDefinitions')" v-show="visiblePanel === 'pedigreeDefinitions'" :get-data="getPedigreeData" :filter-on="initialFilters.pedigrees" />
      <LocationTable v-if="selectedTypes.includes('locations')" v-show="visiblePanel === 'locations'" :get-data="getLocationData" :get-ids="getLocationIds" :download="downloadLocationTable" :filter-on="initialFilters.locations" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { columns, validCompsForType } from '@/plugins/util/table-columns'
  import { apiPostGermplasmAttributeTable, apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostLocationTable, apiPostLocationTableIds } from '@/plugins/api/location'
  import { apiPostDatasetAttributeTable, apiPostDatasetTable } from '@/plugins/api/dataset'
  import { mdiDatabase, mdiDna, mdiFamilyTree, mdiMagnify, mdiMapMarker, mdiPlaylistPlus, mdiSprout, mdiTagMultiple, mdiWeatherPartlySnowyRainy } from '@mdi/js'
  import type { SearchStats, SearchStatsField } from '@/plugins/types/client'
  import { apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/plugins/api/trait'
  import { apiPostClimateDataTable, apiPostClimateDataTableIds } from '@/plugins/api/climate'
  import { apiPostMapdefinitionTable, apiPostMapdefinitionTableIds } from '@/plugins/api/genotype'

  const compProps = defineProps<{
    searchTerm?: string
  }>()

  const { t } = useI18n()

  const allCategories = computed(() => {
    let i = 0
    return [{
      key: 'germplasm' as SearchStatsField,
      title: t('pageSearchResultSectionGermplasm'),
      icon: mdiSprout,
      color: getTemplateColor(i++),
    }, {
      key: 'germplasmAttributes' as SearchStatsField,
      title: t('pageSearchResultSectionGermplasmAttributes'),
      icon: mdiPlaylistPlus,
      color: getTemplateColor(i++),
    }, {
      key: 'trialData' as SearchStatsField,
      title: t('pageSearchResultSectionTrialsData'),
      icon: mdiTagMultiple,
      color: getTemplateColor(i++),
    }, {
      key: 'climateData' as SearchStatsField,
      title: t('pageSearchResultSectionClimateData'),
      icon: mdiWeatherPartlySnowyRainy,
      color: getTemplateColor(i++),
    }, {
      key: 'markers' as SearchStatsField,
      title: t('pageSearchResultSectionMapDefinitionData'),
      icon: mdiDna,
      color: getTemplateColor(i++),
    }, {
      key: 'datasets' as SearchStatsField,
      title: t('pageSearchResultSectionDatasets'),
      icon: mdiDatabase,
      color: getTemplateColor(i++),
    }, {
      key: 'datasetAttributes' as SearchStatsField,
      title: t('pageSearchResultSectionDatasetAttributes'),
      icon: mdiPlaylistPlus,
      color: getTemplateColor(i++),
    }, {
      key: 'pedigreeDefinitions' as SearchStatsField,
      title: t('pageSearchResultSectionPedigreeData'),
      icon: mdiFamilyTree,
      color: getTemplateColor(i++),
    }, {
      key: 'locations' as SearchStatsField,
      title: t('pageSearchResultSectionLocationData'),
      icon: mdiMapMarker,
      color: getTemplateColor(i++),
    }]
  })

  const router = useRouter()
  const stats = ref<SearchStats>({
    germplasm: { value: 0, loading: false },
    germplasmAttributes: { value: 0, loading: false },
    datasets: { value: 0, loading: false },
    datasetAttributes: { value: 0, loading: false },
    trialData: { value: 0, loading: false },
    climateData: { value: 0, loading: false },
    locations: { value: 0, loading: false },
    markers: { value: 0, loading: false },
    pedigreeDefinitions: { value: 0, loading: false },
  })
  const tempLocalSearchTerm = ref<string>()
  const localSearchTerm = ref<string>()
  const visiblePanel = ref<string>('germplasm')
  const selectedTypes = ref<SearchStatsField[]>(allCategories.value.map(c => c.key))
  const comparator = ref<FilterComparator>(FilterComparator.equals)

  const hasSearchTerm = computed(() => localSearchTerm.value !== undefined && localSearchTerm.value.trim().length > 0)

  const searchCategories = computed(() => {
    return allCategories.value.filter(c => selectedTypes.value.includes(c.key))
  })

  const initialFilters = computed(() => {
    const result: { [key: string]: FilterGroup[] } = {}

    Object.keys(columns).forEach(table => {
      const filter: FilterGroup[] = [{
        filters: localSearchTerm.value
          ? columns[table].filter(c => c.searchable === true).map(c => {
            let comp = comparator.value
            const validComps = validCompsForType[c.dataType || '']

            if (validComps && validComps.length > 0 && !validComps.includes(comp)) {
              comp = validComps[0]
            }

            return {
              column: c.key || '',
              comparator: comp,
              values: [localSearchTerm.value || ''],
            }
          })
          : [],
        operator: FilterOperator.or,
      }]

      result[table] = filter
    })

    return result
  })

  function getGermplasmData (data: PaginatedRequest) {
    stats.value.germplasm.loading = true
    return apiPostGermplasmTable(data, result => {
      stats.value.germplasm.value = result.count
    }).finally(() => {
      stats.value.germplasm.loading = false
    })
  }
  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadGermplasmTable (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters } as PaginatedRequest, 'germplasm')
  }
  function getDatasetAttributeData (data: PaginatedRequest) {
    stats.value.datasetAttributes.loading = true
    return apiPostDatasetAttributeTable(null, data, result => {
      stats.value.datasetAttributes.value = result.count
    }).finally(() => {
      stats.value.datasetAttributes.loading = false
    })
  }
  function getGermplasmAttributeData (data: PaginatedRequest) {
    stats.value.germplasmAttributes.loading = true
    return apiPostGermplasmAttributeTable(data, result => {
      stats.value.germplasmAttributes.value = result.count
    }).finally(() => {
      stats.value.germplasmAttributes.loading = false
    })
  }
  function getMarkerData (data: PaginatedRequest) {
    stats.value.markers.loading = true
    return apiPostMapdefinitionTable(data, result => {
      stats.value.markers.value = result.count
    }).finally(() => {
      stats.value.markers.loading = false
    })
  }
  function getMarkerIds (data: PaginatedRequest) {
    return apiPostMapdefinitionTableIds(data)
  }
  function downloadMarkerData (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters } as PaginatedRequest, 'map/mapdefinition')
  }
  function getTraitData (data: PaginatedRequest) {
    stats.value.trialData.loading = true
    return apiPostTrialsDataTable(data, result => {
      stats.value.trialData.value = result.count
    }).finally(() => {
      stats.value.trialData.loading = false
    })
  }
  function getTraitIds (data: PaginatedRequest) {
    return apiPostTrialsDataTableIds(data)
  }
  function downloadTraitData (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters } as PaginatedRequest, 'dataset/data/trial')
  }
  function getClimateData (data: PaginatedRequest) {
    stats.value.climateData.loading = true
    return apiPostClimateDataTable(data, result => {
      stats.value.climateData.value = result.count
    }).finally(() => {
      stats.value.climateData.loading = false
    })
  }
  function getClimateIds (data: PaginatedRequest) {
    return apiPostClimateDataTableIds(data)
  }
  function downloadClimateData (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters } as PaginatedRequest, 'dataset/data/climate')
  }
  function getPedigreeData (data: PaginatedRequest) {
    stats.value.pedigreeDefinitions.loading = true
    return apiPostPedigreeTable(data, result => {
      stats.value.pedigreeDefinitions.value = result.count
    }).finally(() => {
      stats.value.pedigreeDefinitions.loading = false
    })
  }
  function getDatasetData (data: PaginatedRequest) {
    stats.value.datasets.loading = true
    return apiPostDatasetTable(data, result => {
      stats.value.datasets.value = result.count
    }).finally(() => {
      stats.value.datasets.loading = false
    })
  }
  function getLocationData (data: PaginatedRequest) {
    stats.value.locations.loading = true
    return apiPostLocationTable(data, result => {
      stats.value.locations.value = result.count
    }).finally(() => {
      stats.value.locations.loading = false
    })
  }
  function getLocationIds (data: PaginatedRequest) {
    return apiPostLocationTableIds(data)
  }
  function downloadLocationTable (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters } as PaginatedRequest, 'location')
  }

  function initiateSearch () {
    localSearchTerm.value = tempLocalSearchTerm.value

    router.replace({ params: { id: tempLocalSearchTerm.value } })
  }

  watch(() => compProps.searchTerm, async (newValue: string | undefined) => {
    if (newValue) {
      localSearchTerm.value = newValue.trim()
      tempLocalSearchTerm.value = newValue.trim()
    }
  })

  onMounted(() => {
    localSearchTerm.value = compProps.searchTerm
    tempLocalSearchTerm.value = compProps.searchTerm
  })
</script>
