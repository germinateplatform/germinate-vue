<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 1280" :sourceFile="baseSourceFile" :filename="baseFilename" :supportsSvgDownload="false" ref="container" v-on:force-redraw="() => redraw(sourceFile, colorBy)">>
      <div slot="chart" id="scatter-chart" ref="scatterChart" class="text-center" />
      <span slot="buttonContent" class="badge badge-pill badge-info selection-count" v-if="selectedIds && selectedIds.length > 0">{{ selectedIds.length }}</span>

      <template slot="additionalMenuItems">
        <b-dropdown-divider />
        <b-dropdown-item :disabled="!selectedIds || selectedIds.length < 1"
                         @click="toggleItems(true)">
          <i class="mdi mdi-18px mdi-checkbox-marked" /> <span> {{ $t('widgetChartMarkSelectedItems') }}</span>
        </b-dropdown-item>
        <b-dropdown-item :disabled="!selectedIds || selectedIds.length < 1"
                         @click="toggleItems(false)">
          <i class="mdi mdi-18px mdi-checkbox-blank-outline" /> <span> {{ $t('widgetChartUnmarkSelectedItems') }}</span>
        </b-dropdown-item>
      </template>

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <i class="mdi mdi-18px mdi-help-circle-outline" />
        </b-button>
        <MarkedItems :itemType="itemType" />
      </template>
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
import MarkedItems from '@/components/tables/MarkedItems'
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
      colorBy: null,
      selectedIds: [],
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
        target: () => `#${id} #marked-items-clear`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionToggleTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionToggleText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return this.datasetType + '-' + this.datasetIds.join('-')
    }
  },
  components: {
    BaseChart,
    MarkedItems,
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
      this.$nextTick(() => this.$root.$emit('bv::hide::tooltip', 'marked-items-clear'))
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
    redraw: function (result, colorBy) {
      this.sourceFile = result
      this.colorBy = colorBy
      this.selectedIds = []

      this.$plotly.purge(this.$refs.scatterChart)

      const reader = new FileReader()
      reader.onload = () => {
        // Remove the first row (Flapjack header)
        const dirtyTsv = reader.result
        const firstEOL = dirtyTsv.indexOf('\r\n')
        const tsv = this.datasetType === 'trials' ? dirtyTsv.substring(firstEOL + 2) : dirtyTsv
        const data = this.$plotly.d3.tsv.parse(tsv)

        this.$plotly.d3.select(this.$refs.scatterChart)
          .datum(data)
          .call(plotlyScatterPlot()
            .colorBy(colorBy)
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
            .onColorByStatsLoaded(stats => {
              this.$emit('color-by-stats-changed', stats)
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
