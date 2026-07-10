<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageStatisticsTitle') }}<small> - {{ $t('pageStatisticsSubtitle') }}</small></h1>
    <v-divider class="mb-3" />

    <h2 class="text-headline-small mb-3">{{ $t('pageStatisticsTaxonomyTitle') }}</h2>
    <p>{{ $t('pageStatisticsTaxonomyText') }}</p>

    <v-row>
      <v-col cols="12" sm="6">
        <TaxonomySunburst class="mb-5" />
      </v-col>
      <v-col cols="12" sm="6">
        <TaxonomyTreemap class="mb-5" />
      </v-col>
    </v-row>

    <StatsChart
      class="mb-5"
      :data="germplasmMetaData"
      :title="$t('pageStatisticsBiologicalStatusTitle')"
      x-value="sampstat"
      filename="biological-status"
      :selection-modes="['taxonomies']"
      sort-by-x
      @bar-clicked="biologicalStatusClicked"
      v-if="germplasmMetaData"
    >
      <template #text>
        <span v-html="$t('pageStatisticsBiologicalStatusText')" />
      </template>
    </StatsChart>

    <StatsChart
      class="mb-5"
      :data="germplasmMetaData"
      :title="$t('pageStatisticsPdciTitle')"
      x-value="pdci"
      filename="pdci"
      :x-values="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
      :x-labels="['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10']"
      @bar-clicked="pdciClicked"
      v-if="germplasmMetaData"
    >
      <template #text>
        <span v-html="$t('pagePassportPdciModal')" />
      </template>
    </StatsChart>

  </v-container>
</template>

<route lang="yaml">
name: statistics
</route>

<script setup lang="ts">
  import type { BarClickEvent } from '@/components/charts/StatsBarChart.vue'
  import StatsChart from '@/components/charts/StatsChart.vue'
  import TaxonomySunburst from '@/components/charts/TaxonomySunburst.vue'
  import TaxonomyTreemap from '@/components/charts/TaxonomyTreemap.vue'
  import { apiGetMetaStats } from '@/plugins/api/stats'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type GermplasmMetaStats, type FilterGroup } from '@/plugins/types/germinate'

  const germplasmMetaData = ref<GermplasmMetaStats[]>()

  const router = useRouter()

  function pdciClicked (point: BarClickEvent) {
    const filter: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]
    filter[0].filters?.push({
      column: 'pdci',
      comparator: FilterComparator.between,
      values: [point.x, point.x + 1],
    })

    if (point.trace && point.trace !== 'All data') {
      const [genus, species] = point.trace.split(' ')
      filter[0].filters?.push({
        column: 'genus',
        comparator: FilterComparator.equals,
        values: [genus],
      })

      if (species) {
        filter[0].filters?.push({
          column: 'species',
          comparator: FilterComparator.equals,
          values: [species],
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

    if (point.trace && point.trace !== 'All data') {
      const [genus, species] = point.trace.split(' ')
      filter[0].filters?.push({
        column: 'genus',
        comparator: FilterComparator.equals,
        values: [genus],
      })

      if (species) {
        filter[0].filters?.push({
          column: 'species',
          comparator: FilterComparator.equals,
          values: [species],
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
    apiGetMetaStats(result => {
      germplasmMetaData.value = result
    })
  })
</script>
