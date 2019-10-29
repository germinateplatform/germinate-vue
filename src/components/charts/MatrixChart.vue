<template>
  <div>
    <BaseChart :width="() => 1280"
               :height="() => 1280"
               :sourceFile="getSourceFile"
               :filename="getFilename"
               :supportsSvgDownload="false"
               :additionalMenuItems="additionalMenuItems"
               :additionalButtons="additionalButtons"
               :loading="loading">
      <div slot="chart" id="matrix-chart" ref="matrixChart" />
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
import { plotlyScatterMatrix } from '@/plugins/charts/plotly-scatter-matrix.js'

export default {
  data: function () {
    return {
      sourceFile: null,
      germplasmId: null,
      loading: false,
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
        html: () => '<i class="mdi mdi-18px mdi-delete" />',
        disabled: () => this.markedIds.germplasm.length < 1,
        callback: () => this.clearMarkedList()
      }, {
        html: () => `<span class="badge badge-pill badge-info">${this.markedIds.germplasm.length}</span>`,
        callback: () => this.redirectToList()
      }]
    }
  },
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    }
  },
  components: {
    BaseChart,
    Passport
  },
  methods: {
    clearMarkedList: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', 'germplasm')
    },
    redirectToList: function () {
      this.$router.push('/marked-items/germplasm')
    },
    toggleItems: function (add) {
      if (add === true) {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: this.selectedIds })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: this.selectedIds })
      }
    },
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'trials-' + this.datasetIds.join('-')
    },
    redraw: function (result, colorBy) {
      this.loading = true
      this.sourceFile = result

      this.$plotly.purge(this.$refs.matrixChart)

      var reader = new FileReader()
      reader.onload = () => {
        var dirtyTsv = reader.result
        var firstEOL = dirtyTsv.indexOf('\r\n')
        var tsv = dirtyTsv.substring(firstEOL + 2)
        var data = this.$plotly.d3.tsv.parse(tsv) // Remove the first row (Flapjack header)

        this.loading = false

        this.$plotly.d3.select(this.$refs.matrixChart)
          .datum(data)
          .call(plotlyScatterMatrix()
            .colorBy(colorBy)
            .columnsToIgnore(['name', 'dbId', 'general_identifier', 'dataset_name', 'dataset_description', 'dataset_version', 'license_name', 'location_name', 'trial_site', 'treatments_description', 'year'])
            .onPointClicked(p => {
              this.germplasmId = p

              this.$nextTick(() => this.$refs.passportModal.show())
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
