<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 1280" :sourceFile="getSourceFile" :filename="getFilename" :supportsSvgDownload="false" ref="container" :additionalMenuItems="additionalMenuItems" :additionalButtons="additionalButtons" v-on:force-redraw="redraw">
      <div slot="chart" id="scatter-chart" ref="scatterChart" class="text-center" />
      <span slot="buttonContent" class="badge badge-pill badge-info selection-count" v-if="selectedIds && selectedIds.length > 0">{{ selectedIds.length }}</span>
    </BaseChart>

    <!-- Modal to show passport page on data point click -->
    <b-modal size="xl" ref="passportModal" v-if="germplasmId" @hidden="germplasmId = null" ok-only hide-header :ok-title="$t('buttonClose')">
      <Passport :germplasmId="germplasmId" :isPopup="true" />
    </b-modal>

    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import Passport from '@/views/data/germplasm/Passport'
import Tour from '@/components/util/Tour'
import colorMixin from '@/mixins/colors.js'
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
    datasetType: {
      type: String,
      default: 'trials'
    },
    itemType: {
      type: String,
      default: 'germplasm'
    }
  },
  data: function () {
    const id = 'chart-' + this.uuidv4()

    return {
      id: id,
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
        text: () => this.$t('widgetChartUnmarkSelectedItems'),
        callback: () => this.toggleItems(false)
      }],
      additionalButtons: [{
        html: () => '<i class="mdi mdi-18px mdi-help-circle-outline" />',
        title: () => this.$t('chartTooltipMatrixTour'),
        callback: () => this.showTour()
      }, {
        html: () => '<i class="mdi mdi-18px mdi-delete" />',
        disabled: () => this.markedIds[this.itemType].length < 1,
        title: () => this.$t('chartTooltipMarkedItemsClear'),
        id: 'marked-items-delete',
        callback: () => this.clearMarkedList()
      }, {
        html: () => `<span class="badge badge-pill badge-info">${this.markedIds[this.itemType].length}</span>`,
        title: () => this.$t('chartTooltipMarkedItemsCount'),
        callback: () => this.redirectToList(),
        id: 'marked-items-count'
      }],
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourGenericModebarTitle'),
        text: () => this.$t('popoverChartTourGenericModebarText'),
        target: () => `#${id} .modebar`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionText'),
        target: () => `#${id} #scatter-chart`,
        position: 'top'
      }, {
        title: () => this.$t('popoverChartTourMarkableCountTitle'),
        text: () => this.$t('popoverChartTourMarkableCountText'),
        target: () => `#${id} #marked-items-count`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableClearTitle'),
        text: () => this.$t('popoverChartTourMarkableClearText'),
        target: () => `#${id} #marked-items-delete`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionToggleTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionToggleText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  components: {
    BaseChart,
    Passport,
    Tour
  },
  mixins: [ colorMixin ],
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    clearMarkedList: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', this.itemType)
      this.$nextTick(() => this.$root.$emit('bv::hide::tooltip', 'marked-items-delete'))
    },
    redirectToList: function () {
      this.$router.push({ name: 'marked-items-type', params: { itemType: this.itemType } })
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
      return this.datasetType + '-' + this.datasetIds.join('-')
    },
    redraw: function (result, colorBy, markedIds) {
      this.sourceFile = result
      this.selectedIds = []

      this.$plotly.purge(this.$refs.scatterChart)

      var reader = new FileReader()
      reader.onload = () => {
        // Remove the first row (Flapjack header)
        var dirtyTsv = reader.result
        var firstEOL = dirtyTsv.indexOf('\r\n')
        var tsv = this.datasetType === 'trials' ? dirtyTsv.substring(firstEOL + 2) : dirtyTsv
        var data = this.$plotly.d3.tsv.parse(tsv)

        this.$plotly.d3.select(this.$refs.scatterChart)
          .datum(data)
          .call(plotlyScatterPlot()
            .colorBy(colorBy)
            .markedIdsForColoring(markedIds)
            .xCategory(this.x)
            .yCategory(this.y)
            .onPointClicked(p => {
              // For trials and compounds, we show the passport page on click
              if (this.datasetType === 'trials' || this.datasetType === 'compounds') {
                this.germplasmId = p
                this.$nextTick(() => this.$refs.passportModal.show())
              }
            })
            .onPointsSelected(ps => {
              this.selectedIds = ps
            })
            .colors(this.getColors()))
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
