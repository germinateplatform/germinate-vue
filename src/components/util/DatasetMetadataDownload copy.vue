<template>
  <div>
    <h2 class="mt-4">{{ $t('widgetDatasetDownloadMetadataTitle') }}</h2>
    <p>{{ $t('widgetDatasetDownloadMetadataText') }}</p>
    <b-button @click="downloadMetadata"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</b-button>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { apiPostDatasetAttributeExport } from '@/mixins/api/dataset.js'
import { downloadBlob } from '@/mixins/util'

import { mdiDownload } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
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
  data: function () {
    return {
      mdiDownload
    }
  },
  methods: {
    downloadMetadata: function () {
      emitter.emit('show-loading', true)
      const request = {
        datasetIds: this.datasetIds,
        experimentId: this.experimentId
      }
      apiPostDatasetAttributeExport(request, result => {
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

        downloadBlob(downloadRequext)
        emitter.emit('show-loading', false)
      })
    }
  }
}
</script>

<style>

</style>
