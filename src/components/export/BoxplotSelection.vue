<template>
  <div>
    <h2>{{ $t(texts.boxplotTitle) }}</h2>
    <p>{{ $t(texts.boxplotText) }}</p>
    <ExportSelection v-bind="$props"
                     :queryId="`${xType}Boxplot`"
                     :min="1"
                     :max="null"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <div v-if="showPlot">
      <TraitBoxplotChart :datasetIds="datasetIds" :traitIds="xIds" :groupIds="yGroupIds" :markedIds="yIds" v-if="xType === 'traits'" ref="boxplot" />
      <ClimateBoxplotChart :datasetIds="datasetIds" :climateIds="xIds" :groupIds="yGroupIds" :markedIds="yIds" v-else ref="boxplot" />
    </div>
  </div>
</template>

<script>
import ClimateBoxplotChart from '@/components/charts/ClimateBoxplotChart'
import TraitBoxplotChart from '@/components/charts/TraitBoxplotChart'
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
    itemType: {
      type: String,
      default: 'germplasm'
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
    },
    groups: {
      type: Array,
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
    ClimateBoxplotChart,
    ExportSelection,
    TraitBoxplotChart
  },
  methods: {
    plot: function (query, selectedItems) {
      this.xIds = selectedItems.filter(t => t.dataType === undefined || t.dataType === 'numeric').map(t => t[this.idKey])
      this.yIds = query.yIds
      this.yGroupIds = query.yGroupIds

      if (this.showPlot) {
        this.$nextTick(() => {
          this.$refs.boxplot.redraw()
        })
      }
      this.showPlot = true

      this.$emit('plot-clicked', query, selectedItems)
    }
  }
}
</script>

<style>

</style>
