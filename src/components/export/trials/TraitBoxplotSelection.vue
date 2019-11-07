<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitBoxplotTitle') }}</h2>
    <p>{{ $t('pageTrialsExportTraitBoxplotText') }}</p>
    <ExportSelection :datasetIds="datasetIds"
                     :texts="texts"
                     itemType="germplasm"
                     groupType="germinatebase"
                     experimentType="trials"
                     idKey="traitId"
                     nameKey="traitName"
                     :min="1"
                     :max="null"
                     :onlyNumeric="true"
                     :getItems="getItems"
                     v-on:button-clicked="plot" />
    <BoxplotChart :datasetIds="datasetIds" :yIds="yIds" :xIds="xIds" :yGroupIds="yGroupIds" itemType="traits" v-if="showPlot" ref="boxplot"/>
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
        title: 'pageTrialsExportSelectTraitTitle',
        text: 'pageTrialsExportSelectTraitChartText',
        groupTitle: 'pageTrialsExportSelectGroupTitle',
        groupText: 'pageTrialsExportSelectGroupChartText',
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
      this.apiPostDatasetTraits(this.datasetIds, callback)
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
