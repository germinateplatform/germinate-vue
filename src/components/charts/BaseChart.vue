<template>
  <div class="base-chart">
    <div class="text-right">
      <!-- Chart options -->
      <b-button-group>
        <b-dropdown no-caret right v-b-tooltip.hover="$t('chartTooltipOptions')" id="additional-options">
          <template v-slot:button-content>
            <MdiIcon :path="mdiDotsVertical" />
            <slot name="buttonContent" />
          </template>
          <!-- Download options -->
          <b-dropdown-item @click="getFilename('png')" v-if="supportsPngDownload"><MdiIcon :path="mdiFileImage" /> {{ $t('buttonDownloadPng') }}</b-dropdown-item>
          <b-dropdown-item @click="getFilename('svg')" v-if="supportsSvgDownload"><MdiIcon :path="mdiFileCode" /> {{ $t('buttonDownloadSvg') }}</b-dropdown-item>
          <b-dropdown-item @click="downloadSource()" v-if="sourceFile"><MdiIcon :path="mdiFileDocument" /> {{ $t('buttonDownloadFile') }}</b-dropdown-item>
          <b-dropdown-item @click="$refs.customChartColorModal.show()" v-if="canChangeColors"><MdiIcon :path="mdiPalette" /> {{ $t('buttonChangeChartColors') }}</b-dropdown-item>
          <!-- Additional options -->
          <slot name="additionalMenuItems" />
        </b-dropdown>
        <!-- Additional buttons -->
        <slot name="additionalButtons" />
      </b-button-group>
    </div>

    <!-- Loading indicator -->
    <div class="text-center" v-if="loading">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <!-- This is where the chart goes -->
    <slot name="chart" ref="chart"/>

    <!-- Modal to ask for filenames -->
    <b-modal ref="chartModal" :title="$t('modalTitleChartFilename')" :ok-title="$t('buttonOk')" :cancel-title="$t('buttonCancel')" @ok="download">
      <b-form v-on:submit.prevent="download">
        <b-form-input v-model="userFilename" autofocus />
      </b-form>
    </b-modal>

    <CustomChartColorModal ref="customChartColorModal" v-on:colors-changed="onColorsChanged" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import CustomChartColorModal from '@/components/modals/CustomChartColorModal'
import { getDateTimeString } from '@/mixins/formatting'
import { downloadBlob, downloadSvgsFromContainer } from '@/mixins/util'

import { mdiDotsVertical, mdiFileImage, mdiFileCode, mdiFileDocument, mdiPalette } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

const Plotly = require('plotly.js/lib/core')

export default {
  data: function () {
    return {
      mdiDotsVertical,
      mdiFileImage,
      mdiFileCode,
      mdiFileDocument,
      mdiPalette,
      userFilename: 'plotly-chart',
      imageType: null
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ])
  },
  props: {
    width: {
      type: Function,
      default: () => 1280
    },
    height: {
      type: Function,
      default: () => 600
    },
    supportsSvgDownload: {
      type: Boolean,
      default: true
    },
    supportsPngDownload: {
      type: Boolean,
      default: true
    },
    filename: {
      type: String,
      default: null
    },
    sourceFile: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    chartType: {
      type: String,
      default: 'plotly'
    },
    canChangeColors: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    storeDarkMode: function () {
      this.$emit('force-redraw')
    }
  },
  components: {
    MdiIcon,
    CustomChartColorModal
  },
  methods: {
    onColorsChanged: function () {
      emitter.emit('chart-colors-changed')
    },
    downloadSource: function () {
      const request = this.sourceFile

      request.filename = request.filename + '-' + getDateTimeString()

      if (!request.extension) {
        request.extension = 'txt'
      }

      downloadBlob(request)
    },
    getFilename: function (imageType) {
      this.imageType = imageType
      if (this.filename) {
        this.userFilename = this.filename
      }
      this.$refs.chartModal.show()
    },
    download: function () {
      this.$refs.chartModal.hide()

      if (this.imageType === 'svg') {
        downloadSvgsFromContainer(this.$slots.chart[0].elm, this.chartType === 'plotly', this.userFilename + '-' + getDateTimeString())
      } else if (this.imageType === 'png') {
        Plotly.downloadImage(this.$slots.chart[0].elm, { format: 'png', width: this.width(), height: this.height(), filename: this.userFilename + '-' + getDateTimeString() })
      }
    },
    chartColorsChangedHandler: function () {
      this.$emit('force-redraw')
    }
  },
  mounted: function () {
    emitter.on('chart-colors-changed', this.chartColorsChangedHandler)
  },
  destroyed: function () {
    emitter.off('chart-colors-changed', this.chartColorsChangedHandler)
  }
}
</script>

<style>
.text-center .plotly .svg-container {
  margin-left: auto!important;
  margin-right: auto!important;
}
</style>
