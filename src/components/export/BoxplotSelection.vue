<template>
  <div>
    <h2>{{ $t(texts.boxplotTitle) }}</h2>
    <p>{{ $t(texts.boxplotText) }}</p>
    <ExportSelection v-bind="$props"
                     :min="1"
                     :max="null"
                     :onlyNumeric="true"
                     v-on:button-clicked="plot" />
    <BoxplotChart :datasetIds="datasetIds" :yIds="yIds" :xIds="xIds" :yGroupIds="yGroupIds" :xType="xType" v-if="showPlot" ref="boxplot"/>
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
    },
    texts: {
      type: Object,
      default: () => {}
    },
    getItems: {
      type: Function,
      default: () => []
    },
    xType: {
      type: String,
      default: 'traits'
    },
    groupType: {
      type: String,
      default: 'germinatebase'
    },
    itemType: {
      type: String,
      default: 'germplasm'
    },
    datasetType: {
      type: String,
      default: null
    },
    downloadKey: {
      type: String,
      default: null
    },
    idKey: {
      type: String,
      default: null
    },
    nameKey: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      showPlot: false,
      xIds: null,
      yIds: null,
      yGroupIds: null
    }
  },
  components: {
    BoxplotChart,
    ExportSelection
  },
  methods: {
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
