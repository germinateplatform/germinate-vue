<template>
  <div>
    <h1 class="text-h4 mb-3">{{ $t('pageSearchTitle') }}</h1>
    <v-divider class="mb-3" />

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-form @submit.prevent="initiateSearch">
          <v-text-field
            :label="$t('formLabelSearchTerm')"
            v-model="tempLocalSearchTerm"
            hide-details
            append-inner-icon="mdi-magnify"
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

    <v-row v-if="hasSearchTerm" class="mb-5">
      <v-col v-for="category in searchCategories" :key="'search-categories-' + category.key">
        <v-card :color="visiblePanel === category.key ? category.color : 'muted'" @click="visiblePanel = category.key">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="text-h5">
                {{ getNumberWithSuffix(stats[category.key], 1) }}
              </v-card-title>

              <v-card-subtitle>{{ category.title }}</v-card-subtitle>
            </div>

            <v-avatar
              class="ma-3"
              rounded="0"
              size="64"
            >
              <v-icon size="64" :icon="category.icon" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <template v-if="hasSearchTerm">
      <GermplasmTable ref="germplasmTable" v-if="selectedTypes.includes('germplasm')" v-show="visiblePanel === 'germplasm'" :get-data="getGermplasmData" :get-ids="getGermplasmIds" :download="downloadGermplasmTable" :filter-on="initialFilters.germplasm" />
      <DatasetTable ref="datasetTable" v-if="selectedTypes.includes('datasets')" v-show="visiblePanel === 'datasets'" :get-data="getDatasetData" :filter-on="initialFilters.datasets" />
      <PedigreeTable ref="pedigreeTable" v-if="selectedTypes.includes('pedigrees')" v-show="visiblePanel === 'pedigrees'" :get-data="getPedigreeData" :filter-on="initialFilters.pedigrees" />
      <LocationTable ref="locationTable" v-if="selectedTypes.includes('locations')" v-show="visiblePanel === 'locations'" :get-data="getLocationData" :get-ids="getLocationIds" :download="downloadLocationTable" :filter-on="initialFilters.locations" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { OverviewStats } from '@/plugins/types/OverviewStats'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'
  import GermplasmTable from '@/components/tables/GermplasmTable.vue'
  import LocationTable from '@/components/tables/LocationTable.vue'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableGermplasm, type FilterGroup, type PaginatedRequest, type ViewTablePedigrees, type ViewTableDatasets } from '@/plugins/types/germinate'
  import { columns, validCompsForType } from '@/plugins/util/table-columns'
  import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostLocationTable, apiPostLocationTableIds } from '@/plugins/api/location'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'

  const compProps = defineProps<{
    searchTerm?: string
  }>()

  const { t } = useI18n()

  const allCategories = computed(() => {
    return [{
      key: 'germplasm',
      title: t('pageSearchResultSectionGermplasm'),
      icon: 'mdi-sprout',
      color: getTemplateColor(0),
    }, {
      key: 'datasets',
      title: t('pageSearchResultSectionDatasets'),
      icon: 'mdi-database',
      color: getTemplateColor(1),
    }, {
      key: 'pedigrees',
      title: t('pageSearchResultSectionPedigreeData'),
      icon: 'mdi-family-tree',
      color: getTemplateColor(2),
    }, {
      key: 'locations',
      title: t('pageSearchResultSectionLocationData'),
      icon: 'mdi-map-marker',
      color: getTemplateColor(3),
    }]
  })

  const router = useRouter()
  const stats = ref<OverviewStats>({})
  const tempLocalSearchTerm = ref<string>()
  const localSearchTerm = ref<string>()
  const visiblePanel = ref<string>('germplasm')
  const selectedTypes = ref<string[]>(allCategories.value.map(c => c.key))
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
    return apiPostGermplasmTable<PaginatedResult<ViewTableGermplasm[]>>(data, result => {
      stats.value.germplasm = result.count
    })
  }
  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadGermplasmTable (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'germplasm')
  }
  function getPedigreeData (data: PaginatedRequest) {
    return apiPostPedigreeTable<PaginatedResult<ViewTablePedigrees[]>>(data, result => {
      stats.value.pedigrees = result.count
    })
  }
  function getDatasetData (data: PaginatedRequest) {
    return apiPostDatasetTable<PaginatedResult<ViewTableDatasets[]>>(data, result => {
      stats.value.datasets = result.count
    })
  }
  function getLocationData (data: PaginatedRequest) {
    return apiPostLocationTable<PaginatedResult<ViewTableGermplasm[]>>(data, result => {
      stats.value.locations = result.count
    })
  }
  function getLocationIds (data: PaginatedRequest) {
    return apiPostLocationTableIds(data)
  }
  function downloadLocationTable (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'location')
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
