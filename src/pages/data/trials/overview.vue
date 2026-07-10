<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageTrialsOverviewTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageTrialsOverviewText')" />

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
            title="pageTrialsOverviewDpTitle"
            subtitle="pageTrialsOverviewDpText"
            :icon="mdiSpade"
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
            title="pageTrialsOverviewDsTitle"
            subtitle="pageTrialsOverviewDsText"
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
            title="pageTrialsOverviewDtTitle"
            subtitle="pageTrialsOverviewDtText"
            :icon="mdiTagMultiple"
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
name: trials
</route>

<script setup lang="ts">
  import { apiGetTrialStats } from '@/plugins/api/trait'
  import type { TrialStats } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { mdiChartBellCurveCumulative, mdiChartLine, mdiDatabase, mdiSpade, mdiTagMultiple } from '@mdi/js'

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

  const trialStats = shallowRef<TrialStats>()

  const data: ComputedRef<VisData | undefined> = computed(() => {
    const stats = trialStats.value

    // Guard clause: If any required source data is missing, exit early
    if (!stats?.dataPointsByYear || !stats?.trialsDatasetsPerYear || !stats?.traitsPerYear) {
      return undefined
    }

    return {
      dps: formatChartData(stats.dataPointsByYear),
      dss: formatChartData(stats.trialsDatasetsPerYear),
      dts: formatChartData(stats.traitsPerYear),
    }
  })

  onMounted(() => {
    apiGetTrialStats(result => {
      trialStats.value = result
    }).finally(() => {
      loading.value = false
    })
  })
</script>
