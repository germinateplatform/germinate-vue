<template>
  <div>
    <h2>{{ $t('pageClimateExportClimateBoxplotTitle') }}</h2>
    <p>{{ $t('pageClimateExportClimateBoxplotText') }}</p>
    <ExportSelection :datasetIds="datasetIds"
                     :texts="texts"
                     itemType="locations"
                     groupType="locations"
                     experimentType="climate"
                     idKey="climateId"
                     nameKey="climateName"
                     :min="1"
                     :max="null"
                     :onlyNumeric="true"
                     :getItems="getItems"
                     v-on:button-clicked="plot" />
    <BoxplotChart :datasetIds="datasetIds" :yIds="yIds" :xIds="xIds" :yGroupIds="yGroupIds" itemType="climate" v-if="showPlot" ref="boxplot"/>
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
        title: 'pageClimateExportSelectClimateTitle',
        text: 'pageClimateExportSelectClimateChartText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupChartText',
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
      this.apiPostDatasetClimates(this.datasetIds, callback)
    },
    plot: function (query, selectedClimates) {
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
