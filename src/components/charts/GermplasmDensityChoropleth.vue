<template>
  <BaseChart
    title="pageStatisticsLocationsTitle"
    :chart-id="id"
    filename="choropleth"
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
      <div :id="id" ref="choroplethChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import { apiGetStatsFile } from '@/plugins/api/stats'
  import { DEFAULT_PLOTLY_CONFIG, uuidv4, type DownloadBlob } from '@/plugins/util'
  import { mdiEarth } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  import choropleth from 'plotly.js/lib/choropleth'
  import { tsvParse } from 'd3-dsv'
  import { coreStore } from '@/stores/app'
  import { getColor } from '@/plugins/util/colors'

  const id = ref('choropleth-' + uuidv4())
  const loading = ref(false)

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const choroplethChart = useTemplateRef('choroplethChart')
  const baseChart = useTemplateRef('baseChart')

  async function redraw (source: Blob) {
    emitter.emit('show-loading', true)

    loading.value = true

    if (source) {
      sourceFile.value = {
        blob: source,
        filename: 'choropleth',
        extension: 'tsv',
      }
    }

    if (choroplethChart.value) {
      const text = await sourceFile.value?.blob.text()

      const chartData = tsvParse(text || '').filter(r => r.code !== 'UNK')

      let gradientColors: string[] = []

      const cg = store.storeServerSettings?.colorsGradient
      if (cg && cg.length > 0) {
        gradientColors = store.storeServerSettings.colorsGradient.concat()
      } else {
        gradientColors.push('#ffffff', getColor(0))
      }

      const gradient: any[][] = []

      gradientColors.forEach((c, i) => {
        const position = i * (1 / (gradientColors.length - 1))
        gradient.push([position, c])
      })

      const data = [{
        type: 'choropleth' as const,
        locations: chartData.map(r => r['code']),
        z: chartData.map(r => r['count']),
        text: chartData.map(r => r['country']),
        colorscale: gradient,
        autocolorscale: false,
        reversescale: false,
        marker: {
          line: {
            color: 'rgb(180,180,180)',
            width: 0.1,
          },
        },
        tick0: 0,
        zmin: 0,
        dtick: 1000,
        colorbar: {
          autotic: false,
          tickprefix: '',
          thickness: 6,
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }]

      const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        autosize: true,
        height: 800,
        geo: {
          bgcolor: 'rgba(0,0,0,0)',
          showframe: true,
          fitbounds: false,
          showcountries: true,
          showcoastlines: false,
          projection: {
            type: 'natural earth',
          },
        },
      }

      const config = {
        ...DEFAULT_PLOTLY_CONFIG,
        displayModeBar: true,
        scrollZoom: false,
      }

      baseChart.value?.react(choroplethChart.value, data, layout, config)
        .then(element => {
          if (element) {
            element.on('plotly_click', data => {
              if (data && data.points && data.points.length > 0) {
                console.log(data.points[0])
                // this.navigateToGermplasmPageFilteredByCountry(data.points[0].text)
              }
            })
          }
        })
    }

    loading.value = false
    emitter.emit('show-loading', false)
  }

  onMounted(() => {
    // Only register the chart types we're actually using to reduce the final bundle size
    baseChart.value?.register([
      choropleth,
    ])

    apiGetStatsFile('country', result => redraw(result))
  })
</script>
