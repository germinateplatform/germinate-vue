<template>
  <v-container fluid>
    <v-row v-if="stats" class="card-icon-avatar">
      <v-col v-for="(category, index) in dashboardCategories" :key="'dashboard-stats-' + category.value">
        <v-card :color="getTemplateColor(index)" :to="category.link">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="text-headline-small">
                {{ getNumberWithSuffix(stats[category.value] || 0, 1) }}
              </v-card-title>

              <v-card-subtitle>{{ $t(category.text) }}</v-card-subtitle>
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

    <h1 class="text-headline-large mb-3">{{ $t('pageDashboardTitle') }}</h1>
    <v-divider class="mb-3" />

    <HtmlTemplateEditor i18n-key="pageDashboardText" />

    <div v-if="showPublicationSection && (showPublications || store.storeUserIsDataCurator)" class="my-5">
      <PublicationTable display-type="grid" :get-data="getPublicationData" :filter-on="publicationsFilter">
        <template #card-text>
          <v-card-text>{{ $t('pageDashboardPublicationsText') }}</v-card-text>
        </template>
      </PublicationTable>
    </div>

    <div v-if="showDataStoriesSection && hasStoriesData" class="my-5">
      <StoryTable
        :get-data="getStories"
        :filter-on="storiesFilter"
        display-type="grid"
      />
    </div>

    <div v-if="showDataUpdateSection && showDataUpdates" class="my-5">
      <DataUpdateTable display-type="table" :get-data="getDataUpdateData" />
    </div>

    <div v-if="showNewsSection && (showNews || store.storeUserIsDataCurator)" class="my-5">
      <NewsTable display-type="grid" :get-data="getNewsData" />
    </div>
  </v-container>
</template>

<route lang="yaml">
name: home
</route>

<script lang="ts" setup>
  import { apiGetOverviewStats } from '@/plugins/api/stats'
  import { coreStore } from '@/stores/app'
  import { statCategories } from '@/plugins/util/types'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import ImageCarousel from '@/components/structure/ImageCarousel.vue'
  import PublicationTable from '@/components/tables/PublicationTable.vue'
  import { FilterComparator, FilterOperator, type OverviewStats, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { lookupDoiInformation } from '@/plugins/util'
  import HtmlTemplateEditor from '@/components/widgets/HtmlTemplateEditor.vue'
  import NewsTable from '@/components/tables/NewsTable.vue'
  import DataUpdateTable from '@/components/tables/DataUpdateTable.vue'
  import { apiPostStoryTable } from '@/plugins/api/story'
  import { apiPostPublicationsTable } from '@/plugins/api/publication'
  import { apiPostNewsTable } from '@/plugins/api/news'
  import { apiPostDataImportStats } from '@/plugins/api/dataimport'

  const store = coreStore()
  const stats = ref<OverviewStats>()
  const showPublications = ref<boolean>(true)
  const showNews = ref<boolean>(true)
  const showDataUpdates = ref<boolean>(true)
  const hasStoriesData = ref<boolean>(true)

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
  const showDataStoriesSection = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardSections) {
      return store.storeServerSettings.dashboardSections.includes('datastories')
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

  const storiesFilter: ComputedRef<FilterGroup[]> = computed(() => {
    const result = [{
      filters: [{
        column: 'storyFeatured',
        comparator: FilterComparator.equals,
        values: ['1'],
        canBeChanged: false,
      }],
      operator: FilterOperator.or,
    }]

    return result
  })

  function getStories (data: PaginatedRequest) {
    return apiPostStoryTable(data, result => {
      hasStoriesData.value = result.count > 0
    })
  }

  function getPublicationData (data: PaginatedRequest) {
    return apiPostPublicationsTable(data, result => {
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
    return apiPostNewsTable(data, result => {
      if (result && result.data && result.data.length > 0) {
        // TODO
      } else {
        showNews.value = false
      }
    })
  }
  function getDataUpdateData (data: PaginatedRequest) {
    return apiPostDataImportStats(data, result => {
      if (result && result.data && result.data.length > 0) {
        // TODO
      } else {
        showDataUpdates.value = false
      }
    })
  }

  function updateStats () {
    apiGetOverviewStats(store.storeSelectedProjects, (result: OverviewStats) => {
      stats.value = result
    })
  }

  watch(() => store.storeSelectedProjects, async () => updateStats())

  onBeforeMount(() => updateStats())
</script>
