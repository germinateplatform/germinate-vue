<template>
  <div>
    <div class="text-right">
      <!-- Chart options -->
      <b-button-group>
        <b-dropdown no-caret right v-b-tooltip.hover="$t('chartTooltipOptions')" id="additional-options">
          <template v-slot:button-content>
            <i class="mdi mdi-18px mdi-dots-vertical"/>
            <slot name="buttonContent" />
          </template>
          <!-- Download options -->
          <b-dropdown-item @click="getFilename('png')" v-if="supportsPngDownload"><i class="mdi mdi-18px mdi-file-image"/> {{ $t('buttonDownloadPng') }}</b-dropdown-item>
          <b-dropdown-item @click="getFilename('svg')" v-if="supportsSvgDownload"><i class="mdi mdi-18px mdi-file-code"/> {{ $t('buttonDownloadSvg') }}</b-dropdown-item>
          <b-dropdown-item @click="downloadSource()"><i class="mdi mdi-18px mdi-file-document"/> {{ $t('buttonDownloadFile') }}</b-dropdown-item>
          <b-dropdown-item @click="$refs.customChartColorModal.show()" v-if="canChangeColors"><i class="mdi mdi-18px mdi-palette" /> {{ $t('buttonChangeChartColors') }}</b-dropdown-item>
          <!-- Additional options -->
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
        <!-- Additional buttons -->
        <template v-if="additionalButtons && additionalButtons.length > 0">
          <b-button v-for="(button, index) in additionalButtons"
                    :key="`additional-button-${index}`"
                    :disabled="button.disabled ? button.disabled() : false"
                    v-b-tooltip.hover
                    :title="button.title ? button.title() : null"
                    :id="button.id ? button.id : null"
                    @click="button.callback">
            <span v-html="button.html()" />
          </b-button>
        </template>
      </b-button-group>
    </div>

    <!-- Loading indicator -->
    <div class="text-center" v-if="loading">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <!-- This is where the chart goes -->
    <slot name="chart" ref="chart"/>
    <!-- Resize listener that takes care of resizing according to page width -->
    <ResizeObserver v-on:notify-width="handleResize" />

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
import ResizeObserver from '@/components/ResizeObserver'
import CustomChartColorModal from '@/components/modals/CustomChartColorModal'

import { EventBus } from '@/plugins/event-bus.js'

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
    supportsPngDownload: {
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
  components: {
    CustomChartColorModal,
    ResizeObserver
  },
  methods: {
    onColorsChanged: function () {
      EventBus.$emit('chart-colors-changed')
    },
    handleResize: function () {
      if (this.chartType === 'plotly') {
        if (this.$slots.chart[0].elm) {
          this.$plotly.relayout(this.$slots.chart[0].elm, {
            // 'xaxis.autorange': true,
            // 'yaxis.autorange': true
          })
        }
      } else {
        this.$emit('resize')
      }
    },
    downloadSource: function () {
      var request = this.sourceFile()

      request.filename = request.filename + '-' + window.moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')

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
        this.downloadSvgsFromContainer(this.$slots.chart[0].elm, this.chartType === 'plotly', this.userFilename + '-' + window.moment(new Date()).format('YYYY-MM-DD-HH-mm-ss'))
      } else if (this.imageType === 'png') {
        this.$plotly.downloadImage(this.$slots.chart[0].elm, { format: 'png', width: this.width(), height: this.height(), filename: this.userFilename + '-' + window.moment(new Date()).format('YYYY-MM-DD-HH-mm-ss') })
      }
    },
    chartColorsChangedHandler: function () {
      this.$emit('force-redraw')
    }
  },
  mounted: function () {
    EventBus.$on('chart-colors-changed', this.chartColorsChangedHandler)
  },
  destroyed: function () {
    EventBus.$off('chart-colors-changed', this.chartColorsChangedHandler)
  }
}
</script>

<style>

</style>
