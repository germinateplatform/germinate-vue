<template>
  <b-modal id="license-modal" ref="licenseModal" scrollable :title="$t('modalTitleLicense')" size="lg" modal-class="d-print-none">
    <div v-if="license">
      <div v-html="license.licenseContent" class="d-print-block"></div>
      <a :href="htmlData" target="_blank" rel="noopener noreferrer" style="display: none;" :download="htmlFilename" ref="htmlDownloadLink" />
    </div>
    <div slot="modal-footer">
      <b-button-group>
        <!-- Options to download the license -->
        <b-dropdown>
          <template slot="button-content"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</template>
          <b-dropdown-item @click="onPrint"><MdiIcon :path="mdiPrinter" /> {{ $t('buttonPrint') }}</b-dropdown-item>
          <b-dropdown-item @click="onDownload"><MdiIcon :path="mdiFileCode" /> {{ $t('buttonHtml') }}</b-dropdown-item>
        </b-dropdown>
        <!-- Close the dialog -->
        <b-button v-if="isAccepted" @click="hide"><MdiIcon :path="mdiCancel" /> {{ $t('buttonClose') }}</b-button>
        <!-- Accept/decline the license -->
        <template v-else>
          <b-button variant="success" @click="accept"><MdiIcon :path="mdiCheck" /> {{ $t('buttonAccept') }}</b-button>
          <b-button variant="danger" @click="hide"><MdiIcon :path="mdiCancel" /> {{ $t('buttonDecline') }}</b-button>
        </template>
      </b-button-group>
    </div>
  </b-modal>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import datasetApi from '@/mixins/api/dataset.js'

import { mdiDownload, mdiPrinter, mdiFileCode, mdiCancel, mdiCheck } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
  props: {
    license: {
      type: Object,
      default: null
    },
    dataset: {
      type: Object,
      default: null
    },
    isAccepted: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      mdiDownload,
      mdiPrinter,
      mdiFileCode,
      mdiCancel,
      mdiCheck,
      htmlData: null,
      htmlFilename: null
    }
  },
  mixins: [datasetApi],
  methods: {
    show: function () {
      this.$refs.licenseModal.show()
    },
    hide: function () {
      this.$refs.licenseModal.hide()
    },
    accept: function () {
      this.apiGetAcceptLicense(this.license.licenseId, () => {
        emitter.emit('license-accepted', this.license.licenseId)

        this.hide()
      })
    },
    onPrint: function () {
      emitter.emit('on-print', this.license.licenseContent)
    },
    onDownload: function () {
      this.htmlData = 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(this.license.licenseContent)))
      let filename = this.license.licenseName.replace(' ', '-') + '.html'
      if (this.dataset) {
        filename = this.dataset.datasetId + '-' + filename
      }

      this.htmlFilename = filename

      setTimeout(() => {
        this.$refs.htmlDownloadLink.click()
      }, 0)
    }
  }
}
</script>

<style>
</style>
