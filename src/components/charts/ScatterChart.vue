<template>
  <div>
    <BaseChart :width="() => 1280" :height="() => 1280" :sourceFile="getSourceFile" :filename="getFilename" :supportsSvgDownload="false" ref="container" :additionalMenuItems="additionalMenuItems" :additionalButtons="additionalButtons">
      <div slot="chart" id="scatter-chart" ref="scatterChart" class="text-center" />
      <span slot="buttonContent" class="badge badge-pill badge-info selection-count" v-if="selectedIds && selectedIds.length > 0">{{ selectedIds.length }}</span>
    </BaseChart>
    <b-modal size="xl" ref="passportModal" v-if="germplasmId" @hidden="germplasmId = null" ok-only hide-header :ok-title="$t('buttonClose')">
      <Passport :germplasmId="germplasmId" :isPopup="true" />
    </b-modal>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import Passport from '@/views/data/germplasm/Passport'
import { plotlyScatterPlot } from '@/plugins/charts/plotly-scatter-plot.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    x: {
      type: String,
      default: ''
    },
    y: {
      type: String,
      default: ''
    },
    experimentType: {
      type: String,
      default: 'trials'
    },
    itemType: {
      type: String,
      default: 'germplasm'
    }
  },
  data: function () {
    return {
      sourceFile: null,
      germplasmId: null,
      selectedIds: [],
      additionalMenuItems: [{
        icon: 'mdi-checkbox-marked',
        disabled: () => !this.selectedIds || this.selectedIds.length < 1,
        text: () => this.$t('widgetChartMarkSelectedItems'),
        callback: () => this.toggleItems(true)
      }, {
        icon: 'mdi-checkbox-blank-outline',
        disabled: () => !this.selectedIds || this.selectedIds.length < 1,
        text: () => this.$t('widgetChartUnarkSelectedItems'),
        callback: () => this.toggleItems(false)
      }],
      additionalButtons: [{
        html: () => '<i class="mdi mdi-18px mdi-delete" />',
        disabled: () => this.markedIds[this.itemType].length < 1,
        callback: () => this.clearMarkedList()
      }, {
        html: () => `<span class="badge badge-pill badge-info">${this.markedIds[this.itemType].length}</span>`,
        callback: () => this.redirectToList()
      }]
    }
  },
  components: {
    BaseChart,
    Passport
  },
  methods: {
    clearMarkedList: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', this.itemType)
    },
    redirectToList: function () {
      this.$router.push('/marked-items/' + this.itemType)
    },
    toggleItems: function (add) {
      if (add === true) {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: this.selectedIds })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: this.selectedIds })
      }
    },
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return this.experimentType + '-' + this.datasetIds.join('-')
    },
    redraw: function (result, colorBy) {
      this.sourceFile = result

      this.$plotly.purge(this.$refs.scatterChart)

      var reader = new FileReader()
      reader.onload = () => {
        var dirtyTsv = reader.result
        var firstEOL = dirtyTsv.indexOf('\r\n')
        var tsv = this.experimentType === 'trials' ? dirtyTsv.substring(firstEOL + 2) : dirtyTsv
        var data = this.$plotly.d3.tsv.parse(tsv) // Remove the first row (Flapjack header)

        this.$plotly.d3.select(this.$refs.scatterChart)
          .datum(data)
          .call(plotlyScatterPlot()
            .colorBy(colorBy)
            .xCategory(this.x)
            .yCategory(this.y)
            .onPointClicked(p => {
              if (this.experimentType === 'trials' || this.experimentType === 'compounds') {
                this.germplasmId = p
                this.$nextTick(() => this.$refs.passportModal.show())
              }
            })
            .onPointsSelected(ps => {
              this.selectedIds = ps
            })
            .colors(this.serverSettings.colorsCharts))
      }
      reader.readAsText(result)
    }
  }
}
</script>

<style scoped>
.selection-count {
  position: absolute;
  padding: 6px;
  margin-top: -10px;
  left: -10px;
}
</style>
