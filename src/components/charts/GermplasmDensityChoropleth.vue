<template>
  <BaseChart
    title="pageStatisticsLocationsTitle"
    :chart-id="id"
    filename="choropleth"
    chart-type="svg"
    :supports-png-download="false"
    :can-change-colors="false"
    :source-file="sourceFile"
    v-model:loading="loading"
    :header-icon="mdiEarth"
    @force-redraw="redraw"
    ref="baseChart"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageStatisticsLocationsText') }}</p>
      </v-card-text>
    </template>
    <template #chart-content>
      <SvgHeatMapChart :chart-data="chartData" :id="id" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import { apiGetCountryStats } from '@/plugins/api/stats'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'
  import { mdiEarth } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  import { createMultiColorGradient, GRADIENT_VIRIDIS } from '@/plugins/util/colors'
  import type { ViewStatsCountry } from '@/plugins/types/germinate'

  const id = ref('choropleth-' + uuidv4())
  const loading = ref(false)

  const sourceFile = ref<DownloadBlob>()

  export interface CountryData extends ViewStatsCountry {
    color: string
  }

  const chartData = shallowRef<CountryData[]>([])

  async function redraw (source: CountryData[]) {
    emitter.emit('show-loading', true)

    loading.value = true

    if (source) {
      sourceFile.value = {
        blob: new Blob([JSON.stringify(source)], { type: 'text/plain' }),
        filename: 'choropleth',
        extension: 'json',
      }
    }

    let max = 0
    const cd = source.map(r => {
      r.color = 'muted'
      max = Math.max(max, +r.count)
      return r
    })

    const mapGradient = createMultiColorGradient(GRADIENT_VIRIDIS, max + 1)

    cd.forEach(c => {
      c.color = mapGradient[c.count]
    })

    chartData.value = cd

    loading.value = false
    emitter.emit('show-loading', false)
  }

  onMounted(() => {
    apiGetCountryStats(result => redraw(result as CountryData[]))
  })
</script>
