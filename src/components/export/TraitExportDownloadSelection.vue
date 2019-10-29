<template>
  <div>
    <TraitExportSelection :datasetIds="datasetIds" exportType="export" v-on:button-clicked="download" />

    <h2 class="mt-4">Download metadata</h2>
    <p>Something here</p>
    <b-button @click="downloadMetadata"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownload') }}</b-button>
  </div>
</template>

<script>
import TraitExportSelection from '@/components/export/TraitExportSelection'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    }
  },
  components: {
    TraitExportSelection
  },
  methods: {
    download: function (query, selectedTraits) {
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport('trial', query, result => {
        var downloadRequest = {
          blob: result,
          filename: 'trial-dataset-' + this.datasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequest)
        EventBus.$emit('show-loading', false)
      })
    },
    downloadMetadata: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        datasetIds: this.datasetIds
      }
      this.apiPostDatasetAttributeExport(request, result => {
        var downloadRequext = {
          blob: result,
          filename: 'trial-dataset-metadata-' + this.datasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequext)
        EventBus.$emit('show-loading', false)
      })
    }
  }
}
</script>

<style>
</style>
