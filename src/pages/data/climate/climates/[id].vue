<template>
  <v-container fluid v-if="climate">
    <PageHeaderBreadcrumbs :items="breadcrumbs" :icon="mdiWeatherSnowyRainy" />
    <v-divider class="mb-3" />

    <ClimateDetails :climate="climate" />
  </v-container>
</template>

<route lang="yaml">
name: climateDetails
</route>

<script setup lang="ts">
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type ViewTableClimates } from '@/plugins/types/germinate'
  import { mdiWeatherSnowyRainy } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const route = useRoute('climateDetails')

  const climate = ref<ViewTableClimates>()
  const climateId = ref<number>()

  const breadcrumbs = computed(() => {
    if (climate.value) {
      return [{
        title: t('pageClimatesTitle'),
        to: Pages.climates.path,
      }, {
        title: climate.value.climateName || '',
        to: Pages.getPath(Pages.climateDetails, `${climate.value.climateId}`),
      }]
    } else {
      return []
    }
  })

  onMounted(() => {
    if (route && route.params && route.params.id) {
      climateId.value = +route.params.id

      apiPostClimateTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'climateId',
            comparator: FilterComparator.equals,
            values: [`${climateId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          climate.value = result.data[0]
        }
      })
    }
  })
</script>
