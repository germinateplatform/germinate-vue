<template>
  <div>
    <div class="text-right">
      <b-button-group>
        <b-dropdown no-caret>
          <template v-slot:button-content>
            <i class="mdi mdi-18px mdi-dots-vertical"/>
            <slot name="buttonContent" />
          </template>
          <b-dropdown-item @click="getFilename('png')"><i class="mdi mdi-18px mdi-file-image"/> {{ $t('buttonDownloadPng') }}</b-dropdown-item>
          <b-dropdown-item @click="getFilename('svg')" v-if="supportsSvgDownload"><i class="mdi mdi-18px mdi-file-xml"/> {{ $t('buttonDownloadSvg') }}</b-dropdown-item>
          <b-dropdown-item @click="downloadSource()"><i class="mdi mdi-18px mdi-file-document"/> {{ $t('buttonDownloadFile') }}</b-dropdown-item>
          <template v-if="additionalMenuItems && additionalMenuItems.length > 0">
            <b-dropdown-divider />
            <b-dropdown-item v-for="(item, index) in additionalMenuItems"
                            :key="`additional-option-${index}`"
                            :disabled="item.disabled()"
                            @click="item.callback">
              <i :class="`mdi mdi-18px ${item.icon}`" /> <span> {{ item.text() }}</span>
            </b-dropdown-item>
          </template>
        </b-dropdown>
        <template v-if="additionalButtons && additionalButtons.length > 0">
          <b-button v-for="(button, index) in additionalButtons"
                    :key="`additional-button-${index}`"
                    @click="button.callback">
            <span v-html="button.html()" />
          </b-button>
        </template>
      </b-button-group>
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
    supportsSvgDownload: {
      type: Boolean,
      default: true
    },
    filename: {
      type: Function,
      default: null
    },
    sourceFile: {
      type: Function,
      default: () => null
    },
    additionalMenuItems: {
      type: Array,
      default: null
    },
    additionalButtons: {
      type: Array,
      default: null
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
      var request = this.sourceFile()

      if (!request.extension) {
        request.extension = 'txt'
      }

      this.downloadBlob(request)
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
