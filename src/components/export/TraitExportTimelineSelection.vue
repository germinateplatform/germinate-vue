<template>
  <div>
    <ExportSelection v-bind="$props"
                     queryId="traitTimeline"
                     :multipleItems="false"
                     :min="1"
                     :max="10"
                     :onlyNumeric="true"
                     v-on:button-clicked="plot" />

    <TimelineChart :shapefiles="shapefiles" :trait="trait" :groupIds="groupIds" queryId="traitTimepoint" :markedIds="markedIds" :datasetIds="datasetIds" :timepoints="timepoints" ref="timelineChart" v-if="shapefiles" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ExportSelection from '@/components/export/ExportSelection'
import TimelineChart from '@/components/charts/TimelineChart'
import { apiPostTrialsDataTimepoints } from '@/mixins/api/trait'
import { apiPostDatasetfileresource } from '@/mixins/api/dataset'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

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
    },
    shown: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      timepoints: [],
      trait: null,
      groupIds: null,
      markedIds: null,
      shapefiles: null
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
    },
    datasetIds: function () {
      this.updateFileresources()
    },
    shown: function (newValue) {
      if (newValue) {
        if (!this.shapefiles) {
          this.update()
        }
      }
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
        this.trait = selectedItems[0]
        this.timepoints = result

        this.$nextTick(() => this.$refs.timelineChart.getTraitData())
      })
    },
    updateFileresources: function () {
      apiPostDatasetfileresource({
        datasetIds: this.datasetIds,
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [{
          column: 'fileresourcetypeName',
          comparator: 'equals',
          operator: 'and',
          values: ['Trials Shapefile']
        }]
      }, result => {
        if (result && result.data) {
          this.shapefiles = result.data
        } else {
          this.shapefiles = []
        }
      })
    },
    update: function () {
      if (this.datasetIds && this.datasetIds.length > 0) {
        this.updateFileresources()
      }
    }
  },
  mounted: function () {
    if (this.shown) {
      this.update()
    }
  }
}
</script>

<style scoped>
</style>
