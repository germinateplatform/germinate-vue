<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" v-on:force-redraw="redraw">
      <div slot="chart" id="bar-chart" ref="barChart" class="chart-bar text-center" />

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <MdiIcon :path="mdiHelpCircleOutline" />
        </b-button>
      </template>
    </BaseChart>

    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import { plotlyBarChart } from '@/plugins/charts/plotly-bar-chart.js'
import { getColors } from '@/mixins/colors.js'
import { uuidv4 } from '@/mixins/util'

import { mdiHelpCircleOutline } from '@mdi/js'

const d3Dsv = require('d3-dsv')
const d3Select = require('d3-selection')

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/bar')
])

export default {
  props: {
    xTitle: {
      type: String,
      default: null
    },
    yTitle: {
      type: String,
      default: null
    },
    xColumn: {
      type: String,
      default: ''
    },
    xLabels: {
      type: Array,
      default: () => null
    },
    groupBy: {
      type: String,
      default: null
    },
    downloadName: {
      type: String,
      default: 'bar-chart'
    },
    mode: {
      type: String,
      default: 'traces'
    },
    sourceFile: {
      type: Blob,
      default: null
    },
    height: {
      type: Number,
      default: 500
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      mdiHelpCircleOutline,
      id: id,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return this.downloadName
    }
  },
  components: {
    BaseChart,
    Tour,
    MdiIcon
  },
  watch: {
    sourceFile: function () {
      this.redraw()
    }
  },
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    redraw: function () {
      if (this.sourceFile) {
        Plotly.purge(this.$refs.barChart)

        if (this.sourceFile) {
          const reader = new FileReader()
          reader.onload = () => {
            const data = d3Dsv.tsvParse(reader.result)

            d3Select.select(this.$refs.barChart)
              .datum(data)
              .call(plotlyBarChart(Plotly)
                .darkMode(this.storeDarkMode)
                .height(this.height)
                .colors(getColors())
                .x(this.xColumn)
                .columnsToIgnore(['genus'])
                .xCategory(this.xTitle)
                .yCategory(this.yTitle)
                .xLabels(this.xLabels)
                .groupBy(this.groupBy)
                .mode(this.mode)
                .onPointClicked(data => {
                  this.$emit('bar-clicked', data)
                }))
          }
          reader.readAsText(this.sourceFile)
        }
      }
    }
  },
  mounted: function () {
    this.redraw()
  }
}
</script>

<style>

</style>
