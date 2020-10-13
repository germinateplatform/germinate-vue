<template>
  <div>
    <h2 class="mt-4">{{ $t('widgetDatasetDownloadMetadataTitle') }}</h2>
    <p>{{ $t('widgetDatasetDownloadMetadataText') }}</p>
    <b-button @click="downloadMetadata"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownload') }}</b-button>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    experimentId: {
      type: Number,
      default: null
    },
    datasetType: {
      type: String,
      default: ''
    }
  },
  mixins: [ datasetApi ],
  methods: {
    downloadMetadata: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        datasetIds: this.datasetIds,
        experimentId: this.experimentId
      }
      this.apiPostDatasetAttributeExport(request, result => {
        let filename
        if (this.experimentId) {
          filename = 'experiment-metadata-' + this.experimentId
        } else {
          filename = this.datasetType + '-dataset-metadata-' + this.datasetIds.join('-')
        }

        const downloadRequext = {
          blob: result,
          filename: filename,
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
