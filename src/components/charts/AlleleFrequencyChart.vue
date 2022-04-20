<template>
  <div class="mt-3">
    <div v-if="dataCount > 0">
      <h2>{{ $t('pageAlleleFrequencyBinningTitle') }}</h2>
      <p>{{ $t('pageAlleleFrequencyBinningText') }}</p>
      <b-row>
        <!-- Equal width binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('equal')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><MdiIcon :path="mdiFormatAlignJustify" :rotate="90" /> {{ $t('pageAlleleFrequencyBinningEqualTitle') }} <span v-b-tooltip.hover :title="$t('pageAlleleFrequencyBinningEqualText')"><MdiIcon :path="mdiHelpCircle" /></span></h5>
              <b-form-group :label="$t('formLabelAllelefreqNrOfBins')" for="nrOfBins">
                <b-input min="2" max="20" id="nrOfBins" type="number" v-model.number="equalBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('equal')"><MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}</b-button>
          </b-card>
        </b-col>
        <!-- Split point binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('split')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><MdiIcon :path="mdiFormatIndentIncrease" :rotate="270"/> {{ $t('pageAlleleFrequencyBinningSplitTitle') }} <span v-b-tooltip.hover :title="$t('pageAlleleFrequencyBinningSplitText')"><MdiIcon :path="mdiHelpCircle" /></span></h5>
              <b-form-group :label="$t('formLabelAllelefreqNrOfBinsLeft')" for="nrOfLeftBins">
                <b-input min="1" max="10" id="nrOfLeftBins" type="number" v-model.number="splitLeftBins"/>
              </b-form-group>
              <b-form-group :label="$t('formLabelAllelefreqSplitPoint')" for="splitPoint">
                <b-input id="splitPoint" type="number" v-model.number="splitPoint"/>
              </b-form-group>
              <b-form-group :label="$t('formLabelAllelefreqNrOfBinsRight')" for="nrOfRightBins">
                <b-input min="1" max="10" id="nrOfRightBins" type="number" v-model.number="splitRightBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('split')"><MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}</b-button>
          </b-card>
        </b-col>
        <!-- Automatic binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('auto')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><MdiIcon :path="mdiFormatAlignLeft" :rotate="270" /> {{ $t('pageAlleleFrequencyBinningAutoTitle') }} <span v-b-tooltip.hover :title="$t('pageAlleleFrequencyBinningAutoText')"><MdiIcon :path="mdiHelpCircle" /></span></h5>
              <b-form-group :label="$t('formLabelAllelefreqNrOfBins')" for="nrOfBins">
                <b-input min="2" max="20" id="nrOfBins" type="number" v-model.number="autoBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('auto')"><MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}</b-button>
          </b-card>
        </b-col>
      </b-row>

      <h2>{{ $t('pageAlleleFrequencyBinningChartTitle') }}</h2>
      <p>{{ $t('pageAlleleFrequencyBinningChartText') }}</p>
      <!-- Plotly.js bar chart -->
      <BaseChart :id="id" :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" :canChangeColors="false" v-on:force-redraw="redraw">
        <div slot="chart" id="allelefreq-chart" ref="allelefreqChart" />

        <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <MdiIcon :path="mdiHelpCircleOutline" />
        </b-button>
      </template>
      </BaseChart>
      <p>{{ $t('pageAlleleFrequencyBinningChartColors') }}</p>

      <h2>{{ $t('pageAlleleFrequencyBinningExportTitle') }}</h2>
      <p>{{ $t('pageAlleleFrequencyBinningExportText') }}</p>
      <!-- Export button -->
      <b-button variant="primary" @click="$emit('trigger-export', getExportSettings())"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('buttonExport') }}</b-button>
    </div>
    <h3 class="mt-3" v-else>{{ $t('headingNoData') }}</h3>

    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import colorMixin from '@/mixins/colors.js'
import baseApiMixin from '@/mixins/api/base'
import utilMixin from '@/mixins/util'
import { plotlyAlleleFreqChart } from '@/plugins/charts/plotly-allelefreq-chart.js'

import { mdiFormatAlignJustify, mdiFormatIndentIncrease, mdiFormatAlignLeft, mdiHelpCircle, mdiRefresh, mdiHelpCircleOutline, mdiArrowRightBox } from '@mdi/js'

const d3Select = require('d3-selection')
const d3Dsv = require('d3-dsv')

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/bar')
])

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    sourceFile: {
      type: Blob,
      default: null
    }
  },
  data: function () {
    const id = 'chart-' + this.uuidv4()

    return {
      mdiFormatAlignJustify,
      mdiFormatIndentIncrease,
      mdiFormatAlignLeft,
      mdiHelpCircle,
      mdiRefresh,
      mdiHelpCircleOutline,
      mdiArrowRightBox,
      id: id,
      maxBins: 20,
      minBins: 2,
      currentWidths: null,
      dataCount: 0,
      tabIndex: 0,
      binning: 'equal',
      equalBins: 10,
      autoBins: 10,
      splitLeftBins: 5,
      splitRightBins: 5,
      splitPoint: 0.5,
      widths: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      serverFilePath: null,
      serverFileBinning: null,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    gradient: function () {
      return this.createColorGradient('#ff7878', '#78fd78', this.widths.length)
    },
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return 'allelefreq-' + this.datasetIds.join('-')
    }
  },
  components: {
    BaseChart,
    MdiIcon,
    Tour
  },
  watch: {
    sourceFile: function () {
      this.parseFile()
      this.redraw()
    },
    widths: function () {
      this.redraw()
    }
  },
  mixins: [baseApiMixin, colorMixin, utilMixin],
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    parseFile: function () {
      // Read the file
      const reader = new FileReader()
      reader.onload = () => {
        this.serverFileBinning = d3Dsv.tsvParse(reader.result)
        this.serverFileBinning.forEach(d => {
          // Parse the content
          d.position = parseFloat(d.position)
          d.count = parseInt(d.count)
        })
      }
      reader.readAsText(this.sourceFile)
    },
    getStyle: function (binning) {
      return this.binning === binning ? 'active' : ''
    },
    updateBinning: function (binning) {
      this.binning = binning

      switch (this.binning) {
        case 'equal':
          this.equalBins = this.adjustBinCount(this.equalBins)
          this.widths = new Array(this.equalBins).fill(100 / this.equalBins)
          this.update()
          break
        case 'split': {
          this.splitLeftBins = this.adjustBinCount(this.splitLeftBins)
          this.splitRightBins = this.adjustBinCount(this.splitRightBins)
          this.splitPoint = Math.min(0.99, Math.max(0.01, this.splitPoint))
          // Create width arrays for left and right
          const left = new Array(this.splitLeftBins).fill(this.splitPoint / this.splitLeftBins * 100)
          const right = new Array(this.splitRightBins).fill((1 - this.splitPoint) / this.splitRightBins * 100)
          this.widths = left.concat(right)
          this.update()
          break
        }
        case 'auto': {
          this.autoBins = this.adjustBinCount(this.autoBins)

          // Using the input file, compute the bins so that each contains roughly the same number of data points
          let total = 0
          this.serverFileBinning.forEach(d => {
            total += d.count
          })

          const cutoff = total / this.autoBins
          const binWidths = []
          let current = 0
          let start = 0
          for (let i = 0; i < this.serverFileBinning.length; i++) {
            current += this.serverFileBinning[i].count

            if (current >= cutoff) {
              binWidths.push((this.serverFileBinning[i].position - start) * 100)
              start = this.serverFileBinning[i].position

              current = 0
            }
          }
          binWidths.push((1 - start) * 100)

          this.widths = binWidths
          break
        }
      }
    },
    update: function () {
      this.redraw()
    },
    getExportSettings: function () {
      switch (this.binning) {
        case 'equal':
          return {
            binningMethod: 'equal',
            binsLeft: this.equalBins
          }
        case 'split':
          return {
            binningMethod: 'split',
            binsLeft: this.splitLeftBins,
            splitPoint: this.splitPoint,
            binsRight: this.splitRightBins
          }
        case 'auto':
          return {
            binningMethod: 'auto',
            binsLeft: this.autoBins
          }
      }
    },
    adjustBinCount: function (value) {
      if (this.binning === 'split') {
        // Restrict to (min/2, max/2) and round
        return Math.min(this.maxBins / 2, Math.max(this.minBins / 2, Math.round(value)))
      } else {
        // Restrict to (min, max) and round
        return Math.min(this.maxBins, Math.max(this.minBins, Math.round(value)))
      }
    },
    redraw: function () {
      if (this.$refs.allelefreqChart) {
        // Purge existing plot
        Plotly.purge(this.$refs.allelefreqChart)
      }

      const reader = new FileReader()
      reader.onload = () => {
        const data = d3Dsv.tsvParse(reader.result)

        this.dataCount = data.length
        if (data.length > 0) {
          this.serverFilePath = this.sourceFile.filename

          this.$nextTick(() => {
            const colors = []
            let index = 0
            let sum = 0
            data.forEach((value, i) => {
              if (i * 100 / data.length >= sum) {
                sum += this.widths[index++]
              }
              colors.push(this.gradient[index - 1])
            })

            // Plot the chart
            d3Select.select(this.$refs.allelefreqChart)
              .datum(data)
              .call(plotlyAlleleFreqChart(Plotly)
                .darkMode(this.storeDarkMode)
                .x('position')
                .y('count')
                .xCategory(this.$t('datasetTypeAllelefreq'))
                .yCategory(this.$t('genericCount'))
                .widths(this.widths)
                .colors(colors))
          })
        }
      }
      reader.readAsText(this.sourceFile)
    }
  },
  mounted: function () {
    this.parseFile()
    this.redraw()
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

label {
  font-size: 1rem;
  width: 100%;
}

.card-radio {
  border: 2px solid var(--secondary);
}

.card-radio .btn {
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
}

.card-radio.active {
  border: 2px solid var(--primary);
  -webkit-transition: border .3s, color .3s;
  -o-transition: border .3s, color .3s;
  transition: border .3s, color .3s;
}

.card-radio.active h5 {
  color: var(--primary);
}
</style>
