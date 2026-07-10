<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGenotypeOverviewTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageGenotypeOverviewText')" />

    <v-row v-if="loading">
      <v-col cols="12" lg="4">
        <v-skeleton-loader type="card" />
      </v-col>
      <v-col cols="12" lg="4">
        <v-skeleton-loader type="card" />
      </v-col>
      <v-col cols="12" lg="4">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <div v-else-if="data">
      <v-btn-toggle
        v-model="aggregation"
        class="mb-3"
        variant="tonal"
        color="primary"
      >
        <v-btn value="values" :prepend-icon="mdiChartLine" :text="$t('buttonValues')" />
        <v-btn value="cumulative" :prepend-icon="mdiChartBellCurveCumulative" :text="$t('buttonCumulative')" />
      </v-btn-toggle>

      <v-row>
        <v-col cols="12" lg="4" v-if="data.dps">
          <DataStatsCard
            title="pageGenotypeOverviewDpTitle"
            subtitle="pageGenotypeOverviewDpText"
            :icon="mdiDna"
            :bg-color="getTemplateColor(0)"
            :color="getTemplateColor(0)"
            :values="data.dps.values"
            :keys="data.dps.keys"
            highlight="cumulative"
            :aggregation="aggregation"
          />
        </v-col>
        <v-col cols="12" lg="4" v-if="data.dss">
          <DataStatsCard
            title="pageGenotypeOverviewDsTitle"
            subtitle="pageGenotypeOverviewDsText"
            :icon="mdiDatabase"
            :bg-color="getTemplateColor(1)"
            :color="getTemplateColor(1)"
            :values="data.dss.values"
            :keys="data.dss.keys"
            highlight="cumulative"
            :aggregation="aggregation"
          />
        </v-col>
        <v-col cols="12" lg="4" v-if="data.dts">
          <DataStatsCard
            title="pageGenotypeOverviewMkTitle"
            subtitle="pageGenotypeOverviewMkText"
            :icon="mdiFormatIndentIncrease"
            :bg-color="getTemplateColor(2)"
            :color="getTemplateColor(2)"
            :values="data.dts.values"
            :keys="data.dts.keys"
            highlight="cumulative"
            :aggregation="aggregation"
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<route lang="yaml">
name: genotypes
</route>

<script setup lang="ts">
  import { apiGetGenotypeStats } from '@/plugins/api/genotype'
  import type { GenotypeStats } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { mdiChartBellCurveCumulative, mdiChartLine, mdiDatabase, mdiDna, mdiFormatIndentIncrease } from '@mdi/js'

  interface ChartData {
    keys: string[]
    values: number[]
  }

  interface VisData {
    dps?: ChartData
    dss?: ChartData
    dts?: ChartData
  }

  const loading = shallowRef(true)
  const aggregation = shallowRef<'values' | 'cumulative'>('cumulative')

  // Helper function to transform Record<string, number> into ChartData
  function formatChartData (source: Record<string, number>): ChartData {
    return {
      keys: Object.keys(source),
      values: Object.values(source),
    }
  }

  const genotypeStats = shallowRef<GenotypeStats>()

  const data: ComputedRef<VisData | undefined> = computed(() => {
    const stats = genotypeStats.value

    // Guard clause: If any required source data is missing, exit early
    if (!stats?.dataPointsByYear || !stats?.genotypeDatasetsPerYear || !stats?.markersPerYear) {
      return undefined
    }

    return {
      dps: formatChartData(stats.dataPointsByYear),
      dss: formatChartData(stats.genotypeDatasetsPerYear),
      dts: formatChartData(stats.markersPerYear),
    }
  })

  onMounted(() => {
    apiGetGenotypeStats(result => {
      genotypeStats.value = result
    }).finally(() => {
      loading.value = false
    })
  })
</script>
