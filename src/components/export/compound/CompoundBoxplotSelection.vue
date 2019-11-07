<template>
  <div>
    <h2>{{ $t('pageCompoundExportCompoundBoxplotTitle') }}</h2>
    <p>{{ $t('pageCompoundExportCompoundBoxplotText') }}</p>
    <ExportSelection :datasetIds="datasetIds"
                     :texts="texts"
                     itemType="germplasm"
                     groupType="germinatebase"
                     experimentType="compound"
                     idKey="compoundId"
                     nameKey="compoundName"
                     :min="1"
                     :max="null"
                     :onlyNumeric="true"
                     :getItems="getItems"
                     v-on:button-clicked="plot" />
    <BoxplotChart :datasetIds="datasetIds" :yIds="yIds" :xIds="xIds" :yGroupIds="yGroupIds" itemType="compounds" v-if="showPlot" ref="boxplot"/>
  </div>
</template>

<script>
import BoxplotChart from '@/components/charts/BoxplotChart'
import ExportSelection from '@/components/export/ExportSelection'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    return {
      showPlot: false,
      xIds: null,
      yIds: null,
      yGroupIds: null,
      texts: {
        title: 'pageCompoundExportSelectCompoundTitle',
        text: 'pageCompoundExportSelectCompoundChartText',
        groupTitle: 'pageCompoundExportSelectGroupTitle',
        groupText: 'pageCompoundExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        button: 'buttonPlot'
      }
    }
  },
  components: {
    BoxplotChart,
    ExportSelection
  },
  methods: {
    getItems: function (callback) {
      this.apiPostDatasetCompounds(this.datasetIds, callback)
    },
    plot: function (query, selectedTraits) {
      this.xIds = query.xIds
      this.yIds = query.yIds
      this.yGroupIds = query.yGroupIds

      if (this.showPlot) {
        this.$nextTick(() => {
          this.$refs.boxplot.redraw()
        })
      }
      this.showPlot = true
    }
  }
}
</script>

<style>

</style>
