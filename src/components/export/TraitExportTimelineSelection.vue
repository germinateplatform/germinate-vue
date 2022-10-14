<template>
  <div>
    <ExportSelection v-bind="$props"
                     :multipleItems="false"
                     :min="1"
                     :max="10"
                     :onlyNumeric="true"
                     v-on:button-clicked="plot" />

    <TimelineChart :trait="trait" :groupIds="groupIds" :markedIds="markedIds" :datasetIds="datasetIds" :timepoints="timepoints" ref="timelineChart" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ExportSelection from '@/components/export/ExportSelection'
import TimelineChart from '@/components/charts/TimelineChart'
import { apiPostTrialsDataTimepoints } from '@/mixins/api/trait'

export default {
  components: {
    ExportSelection,
    TimelineChart
  },
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
    itemType: {
      type: String,
      default: 'germplasm'
    },
    groupType: {
      type: String,
      default: 'germinatebase'
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
      timepoints: [],
      trait: null,
      groupIds: null,
      markedIds: null
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedGermplasm'
    ])
  },
  watch: {
    storeMarkedGermplasm: function () {
      // if (this.colorBySelection === 'marked_items') {
      //   this.onColorByChanged()
      // }
    }
  },
  methods: {
    plot: function (query, selectedItems) {
      apiPostTrialsDataTimepoints({
        datasetIds: this.datasetIds,
        markedIds: query.yIds,
        groupIds: query.yGroupIds,
        traitIds: query.xIds
      }, result => {
        this.groupIds = query.yGroupIds
        this.markedIds = query.yIds
        this.trait = selectedItems
        this.timepoints = result

        this.$nextTick(() => this.$refs.timelineChart.getTraitData())
      })
    }
  }
}
</script>

<style scoped>
</style>
