<template>
  <div class="mt-3">
    <div v-if="dataCount > 0">
      <h2>Binning</h2>
      <p>Something something</p>
      <b-row>
        <!-- Equal width binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('equal')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><i class="mdi mdi-24px mdi-format-align-justify mdi-rotate-90 fix-alignment" /> Equal-width binning <i class="mdi mdi-18px mdi-help-circle" v-b-popover.hover="'The data will be binned into a set number of equal-width bins.'" /></h5>
              <b-form-group label="Number of bins" for="nrOfBins">
                <b-input min="2" max="20" id="nrOfBins" type="number" v-model.number="equalBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('equal')"><i class="mdi mdi-18px mdi-refresh fix-alignment" /> Update</b-button>
          </b-card>
        </b-col>
        <!-- Split point binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('split')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><i class="mdi mdi-24px mdi-format-indent-increase mdi-rotate-270 fix-alignment" /> Split point binning <i class="mdi mdi-18px mdi-help-circle" v-b-popover.hover="'The data will be binned into a number of equal-width bins to the left of the split, and a number of equal-width bins to the right of the split.'" /></h5>
              <b-form-group label="Bins to the left" for="nrOfLeftBins">
                <b-input min="1" max="10" id="nrOfLeftBins" type="number" v-model.number="splitLeftBins"/>
              </b-form-group>
              <b-form-group label="Split point" for="splitPoint">
                <b-input id="splitPoint" type="number" v-model.number="splitPoint"/>
              </b-form-group>
              <b-form-group label="Bins to the right" for="nrOfRightBins">
                <b-input min="1" max="10" id="nrOfRightBins" type="number" v-model.number="splitRightBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('split')"><i class="mdi mdi-18px mdi-refresh fix-alignment" /> Update</b-button>
          </b-card>
        </b-col>
        <!-- Automatic binning -->
        <b-col xs=12 md=4 class="mb-3">
          <b-card :class="`bg-light card-radio h-100 ${getStyle('auto')}`" no-body>
            <b-card-body>
              <h5 class="mb-3"><i class="mdi mdi-24px mdi-format-align-left mdi-rotate-270 fix-alignment" /> Automatic binning <i class="mdi mdi-18px mdi-help-circle" v-b-popover.hover="'The data will be binned automatically, with each (variable-width) bin containing an equal amount of the distribution.'" /></h5>
              <b-form-group label="Number of bins" for="nrOfBins">
                <b-input min="2" max="20" id="nrOfBins" type="number" v-model.number="autoBins"/>
              </b-form-group>
            </b-card-body>
            <b-button variant="primary" @click="updateBinning('auto')"><i class="mdi mdi-18px mdi-refresh fix-alignment" /> Update</b-button>
          </b-card>
        </b-col>
      </b-row>

      <h2>Resulting binning chart</h2>
      <BaseChart :width="() => 1280" :height="() => 600" :sourceFile="getSourceFile" :filename="getFilename">
        <div slot="chart" id="allelefreq-chart" ref="allelefreqChart" />
      </BaseChart>

      <p>The colors used in the chart are the default Flapjack colors. If you modified the color scale in your copy of Flapjack, these colors may me different to the ones you can see here.</p>

      <h2>Export</h2>
      <p>Once you are happy with your selection of the binning mechanism, the data can be exported by clicking on the button below.</p>
      <b-button variant="primary" @click="triggerExport"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> Export</b-button>
    </div>
    <h3 class="mt-3" v-else>The selection did not return any data.</h3>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlyAlleleFreqChart } from '@/plugins/charts/plotly-allelefreq-chart.js'

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
    return {
      maxBins: 20,
      minBins: 2,
      gradient: null,
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
      serverFileBinning: null
    }
  },
  components: {
    BaseChart
  },
  watch: {
    sourceFile: function (newValue, oldValue) {
      this.parseFile()
      this.redraw()
    },
    widths: function (newValue, oldValue) {
      if (!this.currentWidths || this.currentWidths.length !== newValue.length) {
        this.updateGradient()
      }
      this.redraw()
    }
  },
  methods: {
    parseFile: function () {
      var reader = new FileReader()
      reader.onload = () => {
        this.serverFileBinning = this.$plotly.d3.tsv.parse(reader.result)
        this.serverFileBinning.forEach(d => {
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

      const prevLength = this.widths.length

      switch (this.binning) {
        case 'equal':
          this.equalBins = this.adjustBinCount(this.equalBins)
          this.widths = new Array(this.equalBins).fill(100 / this.equalBins)
          this.update(prevLength)
          break
        case 'split':
          this.splitLeftBins = this.adjustBinCount(this.splitLeftBins)
          this.splitRightBins = this.adjustBinCount(this.splitRightBins)
          this.splitPoint = Math.min(0.99, Math.max(0.01, this.splitPoint))
          const left = new Array(this.splitLeftBins).fill(this.splitPoint / this.splitLeftBins * 100)
          const right = new Array(this.splitRightBins).fill((1 - this.splitPoint) / this.splitRightBins * 100)
          this.widths = left.concat(right)
          this.update(prevLength)
          break
        case 'auto':
          this.autoBins = this.adjustBinCount(this.autoBins)

          var total = 0
          this.serverFileBinning.forEach(d => {
            total += d.count
          })

          const cutoff = total / this.autoBins

          var binWidths = []
          var current = 0
          var start = 0
          for (var i = 0; i < this.serverFileBinning.length; i++) {
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
    },
    update: function (prevLength) {
      if (prevLength !== this.widths.length) {
        this.updateGradient()
      }
      this.redraw()
    },
    triggerExport: function () {
      this.$emit('trigger-export', this.getExportSettings())
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
        return Math.min(this.maxBins / 2, Math.max(this.minBins / 2, Math.round(value)))
      } else {
        return Math.min(this.maxBins, Math.max(this.minBins, Math.round(value)))
      }
    },
    updateGradient: function () {
      this.gradient = this.createColorGradient('#ff7878', '#78fd78', this.widths.length)
    },
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'allelefreq-' + this.datasetIds.join('-')
    },
    redraw: function () {
      if (this.$refs.allelefreqChart) {
        this.$plotly.purge(this.$refs.allelefreqChart)
      }

      var reader = new FileReader()
      reader.onload = () => {
        var data = this.$plotly.d3.tsv.parse(reader.result)

        this.dataCount = data.length
        if (data.length > 0) {
          this.serverFilePath = this.sourceFile.filename

          this.$nextTick(() => {
            var colors = []
            var index = 0
            var sum = 0
            data.forEach((value, i) => {
              if (i * 100 / data.length >= sum) {
                sum += this.widths[index++]
              }
              colors.push(this.gradient[index - 1])
            })

            this.$plotly.d3.select(this.$refs.allelefreqChart)
              .datum(data)
              .call(plotlyAlleleFreqChart()
                .x('position')
                .y('count')
                .xCategory('Allele frequency')
                .yCategory('Count')
                .widths(this.widths)
                .colors(colors))
          })
        }
      }
      reader.readAsText(this.sourceFile)
    }
  },
  mounted: function () {
    this.updateGradient()
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
