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

              <v-card-subtitle>{{ $t(category.textI18n) }}</v-card-subtitle>
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
    <p v-html="$t('pageDashboardText')" />

    <div v-if="showPublicationSection && (showPublications || store.storeUserIsDataCurator)" class="my-5">
      <h2 class="text-h5">{{ $t('pageDashboardPublicationsTitle') }}</h2>
      <p>{{ $t('pageDashboardPublicationsText') }}</p>

      <Publications reference-type="database" @publication-count-changed="count => showPublications = count > 0" />
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
  import Publications from '@/components/widgets/Publications.vue'

  const store = coreStore()
  const stats = ref<OverviewStats>()
  const showPublications = ref<boolean>(true)

  const showPublicationSection = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardSections) {
      return store.storeServerSettings.dashboardSections.includes('publications')
    } else {
      return true
    }
  })

  const dashboardCategories = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.dashboardCategories) {
      return statCategories.filter(d => store.storeServerSettings?.dashboardCategories?.includes(d.value))
    } else {
      return statCategories
    }
  })

  onBeforeMount(() => {
    apiGetOverviewStats<OverviewStats>((result: OverviewStats) => {
      stats.value = result
    })
  })
</script>
