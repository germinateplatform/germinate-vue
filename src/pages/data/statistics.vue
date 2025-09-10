<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageStatisticsTitle') }}<small> - {{ $t('pageStatisticsSubtitle') }}</small></h1>
    <v-divider class="mb-3" />

    <h2 class="text-h5 mb-3">{{ $t('pageStatisticsTaxonomyTitle') }}</h2>
    <p>{{ $t('pageStatisticsTaxonomyText') }}</p>

    <v-row>
      <v-col cols="12" sm="6">
        <TaxonomySunburst class="mb-5" />
      </v-col>
      <v-col cols="12" sm="6">
        <TaxonomyTreemap class="mb-5" />
      </v-col>
    </v-row>

    <BarChart
      x-column="biologicalstatus"
      group-by="genus"
      x-title="pageStatisticsBiologicalStatusXAxis"
      y-title="genericCount"
      :title="$t('pageStatisticsBiologicalStatusTitle')"
      download-name="biological-status"
      @bar-clicked="biologicalStatusClicked"
      ref="biologicalStatusBarChart"
      class="mb-5"
    >
      <template #card-text>
        <v-card-text>
          {{ $t('pageStatisticsBiologicalStatusText') }}
        </v-card-text>
      </template>
    </BarChart>

  </v-container>
</template>

<script setup lang="ts">
  import BarChart, { type BarClickEvent } from '@/components/charts/BarChart.vue'
  import TaxonomySunburst from '@/components/charts/TaxonomySunburst.vue'
  import TaxonomyTreemap from '@/components/charts/TaxonomyTreemap.vue'
  import { apiGetStatsFile } from '@/plugins/api/stats'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'

  const biologicalStatusBarChart = useTemplateRef('biologicalStatusBarChart')

  const router = useRouter()

  function biologicalStatusClicked (point: BarClickEvent) {
    const filter: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]
    filter[0].filters?.push({
      column: 'biologicalStatusName',
      comparator: FilterComparator.startsWith,
      values: [point.x],
    })

    if (point.trace) {
      if (point.trace === 'N/A') {
        filter[0].filters?.push({
          column: 'genus',
          comparator: FilterComparator.isNull,
          values: [],
        })
      } else {
        filter[0].filters?.push({
          column: 'genus',
          comparator: FilterComparator.equals,
          values: [point.trace],
        })
      }
    }

    router.push({
      path: Pages.germplasm.path,
      query: {
        'germplasm-filter': JSON.stringify(filter),
      },
    })
  }

  onMounted(() => {
    apiGetStatsFile<Blob>('biologicalstatus', result => {
      biologicalStatusBarChart.value?.redraw(result)
    })
  })
</script>
