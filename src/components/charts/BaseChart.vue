<template>
  <div>
    <div class="text-right">
      <b-dropdown no-caret>
        <template v-slot:button-content>
          <i class="mdi mdi-18px mdi-dots-vertical"/>
        </template>
        <b-dropdown-item @click="getFilename('png')"><i class="mdi mdi-18px mdi-file-image"/> {{ $t('buttonDownloadPng') }}</b-dropdown-item>
        <b-dropdown-item @click="getFilename('svg')"><i class="mdi mdi-18px mdi-file-xml"/> {{ $t('buttonDownloadSvg') }}</b-dropdown-item>
        <b-dropdown-item @click="downloadSource()"><i class="mdi mdi-18px mdi-file-document"/> {{ $t('buttonDownloadFile') }}</b-dropdown-item>
      </b-dropdown>
    </div>
    <slot name="chart" ref="chart" />
    <ResizeObserver v-on:notify-width="handleResize" />

    <b-modal ref="chartModal" :title="$t('modalTitleChartFilename')" @ok="download">
      <b-form v-on:submit.prevent="download">
        <b-form-input v-model="userFilename" autofocus />
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import ResizeObserver from '@/components/ResizeObserver'
export default {
  data: function () {
    return {
      userFilename: 'plotly-chart',
      imageType: null
    }
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
    filename: {
      type: Function,
      default: null
    },
    sourceFile: {
      type: Function,
      default: () => null
    }
  },
  components: {
    ResizeObserver
  },
  methods: {
    handleResize: function () {
      this.$plotly.relayout(this.$slots.chart[0].elm, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
      })
    },
    downloadSource: function () {
      this.downloadBlob(this.sourceFile(), 'tsv')
    },
    getFilename: function (imageType) {
      this.imageType = imageType
      if (this.filename) {
        this.userFilename = this.filename()
      }
      this.$refs.chartModal.show()
    },
    download: function () {
      this.$refs.chartModal.hide()

      if (this.imageType === 'svg') {
        this.downloadSvgsFromContainer(this.$slots.chart[0].elm, this.userFilename)
      } else if (this.imageType === 'png') {
        this.$plotly.downloadImage(this.$slots.chart[0].elm, { format: 'png', width: this.width(), height: this.height(), filename: this.userFilename })
      }
    }
  }
}
</script>

<style>

</style>
