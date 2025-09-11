<template>
  <v-container fluid>
    <v-row v-if="stats">
      <v-col v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value">
        <v-card :color="getTemplateColor(index)" :to="category.link">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="text-h5">
                {{ getNumberWithSuffix(stats[category.value], 1) }}
              </v-card-title>

              <v-card-subtitle>{{ category.text() }}</v-card-subtitle>
            </div>

            <v-avatar
              class="ma-3"
              rounded="0"
              size="64"
            >
              <v-icon size="64">{{ category.path }}</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <ImageCarousel class="my-5" />

    <h1 class="text-h4 mb-3">{{ $t('pageDashboardTitle') }}</h1>
    <v-divider class="mb-3" />

    <HtmlTemplateEditor i18n-key="pageDashboardText" />

    <div v-if="showPublicationSection && (showPublications || store.storeUserIsDataCurator)" class="my-5">
      <PublicationTable display-type="grid" :get-data="getPublicationData" :filter-on="publicationsFilter">
        <template #card-text>
          <v-card-text>{{ $t('pageDashboardPublicationsText') }}</v-card-text>
        </template>
      </PublicationTable>
    </div>

    <div v-if="showDataUpdateSection && showDataUpdates" class="my-5">
      <DataUpdateTable display-type="table" :get-data="getDataUpdateData" />
    </div>

    <div v-if="showNewsSection && (showNews || store.storeUserIsDataCurator)" class="my-5">
      <NewsTable display-type="grid" :get-data="getNewsData" />
    </div>
  </v-container>
</template>

<script lang="ts" setup>
  import { apiGetOverviewStats } from '@/plugins/api/stats'
  import type { OverviewStats } from '@/plugins/types/OverviewStats'
  import { coreStore } from '@/stores/app'
  import { statCategories } from '@/plugins/util/types'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import ImageCarousel from '@/components/structure/ImageCarousel.vue'
  import PublicationTable from '@/components/tables/PublicationTable.vue'
  import { apiPostDataImportStats, apiPostNewsTable, apiPostPublicationsTable } from '@/plugins/api/misc'
  import { FilterComparator, FilterOperator, type ViewTableNews, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTablePublications, type ViewTableImportJobs } from '@/plugins/types/germinate'
  import { lookupDoiInformation } from '@/plugins/util'
  import HtmlTemplateEditor from '@/components/widgets/HtmlTemplateEditor.vue'
  import NewsTable from '@/components/tables/NewsTable.vue'
  import DataUpdateTable from '@/components/tables/DataUpdateTable.vue'

  const store = coreStore()
  const stats = ref<OverviewStats>()
  const showPublications = ref<boolean>(true)
  const showNews = ref<boolean>(true)
  const showDataUpdates = ref<boolean>(true)

  const showPublicationSection = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardSections) {
      return store.storeServerSettings.dashboardSections.includes('publications')
    } else {
      return true
    }
  })
  const showNewsSection = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardSections) {
      return store.storeServerSettings.dashboardSections.includes('news')
    } else {
      return true
    }
  })
  const showDataUpdateSection = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardSections) {
      return store.storeServerSettings.dashboardSections.includes('dataupdates')
    } else {
      return true
    }
  })
  const dashboardCategories = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardCategories) {
      return Object.keys(statCategories).filter(k => store.storeServerSettings?.dashboardCategories?.includes(statCategories[k].value)).map(k => statCategories[k])
    } else {
      return Object.values(statCategories)
    }
  })

  const publicationsFilter: ComputedRef<FilterGroup[]> = computed(() => {
    const result = [{
      filters: [{
        column: 'isDatabasePub',
        comparator: FilterComparator.equals,
        values: ['1'],
        canBeChanged: false,
      }],
      operator: FilterOperator.or,
    }]

    return result
  })

  function getPublicationData (data: PaginatedRequest) {
    return apiPostPublicationsTable<PaginatedResult<ViewTablePublications[]>>(data, result => {
      if (result && result.data && result.data.length > 0) {
        result.data.forEach(p => {
          p.lookupDetails = lookupDoiInformation(p)
          try {
            p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache || '')
          } catch {
            //
          }
        })
      } else {
        showPublications.value = false
      }
    })
  }
  function getNewsData (data: PaginatedRequest) {
    return apiPostNewsTable<PaginatedResult<ViewTableNews[]>>(data, result => {
      if (result && result.data && result.data.length > 0) {
        // TODO
      } else {
        showNews.value = false
      }
    })
  }
  function getDataUpdateData (data: PaginatedRequest) {
    return apiPostDataImportStats<PaginatedResult<ViewTableImportJobs[]>>(data, result => {
      if (result && result.data && result.data.length > 0) {
        // TODO
      } else {
        showDataUpdates.value = false
      }
    })
  }

  onBeforeMount(() => {
    apiGetOverviewStats<OverviewStats>((result: OverviewStats) => {
      stats.value = result
    })
  })
</script>
