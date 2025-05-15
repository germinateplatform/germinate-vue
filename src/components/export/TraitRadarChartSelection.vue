<template>
  <b-row>
    <b-col cols=12 md=6 v-if="traits && traits.length > 0">
      <h2>{{ $t('pageTrialsExportSelectTraitTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectTraitChartText') }}</p>
      <!-- Selected trait/climate -->
      <SearchableSelect v-model="tempSelectedTraits" queryId="`traitRadar-dim`" idKey="traitId" :options="traitOptions" :multiple="true" :selectSize="7" />
      <p class="text-danger" v-if="max !== null && selectedItemCount > max">{{ $tc('pageExportSelectItemMaximum', max) }}</p>
      <p class="text-info" v-if="min !== null && selectedItemCount < min">{{ $tc('pageExportSelectItemMinimum', min) }}</p>
    </b-col>
    <b-col cols=12 md=6>
      <h2>{{ $t('pageTrialsExportSelectGermplasmTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectGermplasmText') }}</p>
      <b-form-group :label="$t('formLabelTraitTimelineGermplasm')" label-for="germplasm-search">
        <TrialGermplasmLookup id="germplasm-search" :isGermplasm="averageAcrossGermplasm" :datasetIds="datasetIds" @germplasm-selected="onGermplasmSelected" />
      </b-form-group>

      <b-form-group :label="$t('formLabelTraitRadarChartAverage')" :description="$t('formDescriptionTraitRadarChartAverage')" label-for="average-data">
        <b-form-checkbox id="average-data" switch v-model="averageAcrossGermplasm"> {{ $t(averageAcrossGermplasm ? 'genericYes' : 'genericNo') }}</b-form-checkbox>
      </b-form-group>

      <div v-if="tempSelectedGermplasm && tempSelectedGermplasm.length > 0">
        <b-badge class="mr-2 mb-1" v-for="(germplasm, index) in tempSelectedGermplasm" :key="`germplasm-badge-${germplasm.germplasmId}-${germplasm.trialsetupId}`" :style="{ backgroundColor: getColor(index).bg, color: getColor(index).text }">
          {{ `${germplasm.germplasm}-${germplasm.rep}-${germplasm.block || 'N/A'}` }} <button type="button" class="close badge-close" @click="removeGermplasm(index)">×</button>
        </b-badge>
      </div>
    </b-col>
    <b-col class="mb-3" cols=12>
      <b-btn class="my-3" variant="primary" @click="buttonPressed" :disabled="getButtonDisabled()"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('buttonPlot') }}</b-btn>

      <b-form-checkbox switch v-if="plotPressed" v-model="individualCharts"> {{ $t('formCheckboxShowIndividualCharts') }}</b-form-checkbox>
      <b-form-checkbox switch v-if="plotPressed" v-model="showAverage"> {{ $t('formCheckboxShowAverage') }}</b-form-checkbox>
      <b-form-checkbox switch v-if="plotPressed" v-model="useTraitFullName"> {{ $t('formCheckboxShowTraitFullName') }}</b-form-checkbox>
    </b-col>

    <template v-if="radarChartDataArray && radarChartDataArray.length > 0">
      <b-col class="mb-3" :cols="radarCols.cols" :md="radarCols.md" :lg="radarCols.lg" v-for="(data, index) in radarChartDataArray" :key="`radar-chart-data-${index}`">
        <h3 v-if="individualCharts">{{ data[0].displayName }}</h3>
        <RadarChart :baseFilename="`radar-chart-${datasetIds.join(',')}`" :plotData="data" :stats="plotDataStats" @rotated="e => updateRotation(index, e)" :ref="`radar-chart-${index}`" />

        <ParallelCoordinatesChart :baseFilename="`parallel-coordinates-chart-${datasetIds.join(',')}`" :plotData="data" :stats="plotDataStats" @rotated="e => updateRotation(index, e)" :ref="`radar-chart-${index}`" />
        <b-row>
          <b-col cols="12" lg="6">
            <BalloonChart :baseFilename="`balloon-chart-${datasetIds.join(',')}`" :plotData="data" :stats="plotDataStats" :ref="`baloon-chart-${index}`" />
          </b-col>
          <b-col cols="12" lg="6">
            <HeatmapChart :baseFilename="`balloon-chart-${datasetIds.join(',')}`" :plotData="data" :stats="plotDataStats" :custom-range="[0, 100]" :ref="`heatmap-chart-${index}`" />
          </b-col>
        </b-row>
      </b-col>
    </template>
  </b-row>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import RadarChart from '@/components/charts/RadarChart'
import ParallelCoordinatesChart from '@/components/charts/ParallelCoordinatesChart'
import BalloonChart from '@/components/charts/BalloonChart'
import HeatmapChart from '@/components/charts/HeatmapChart'
import SearchableSelect from '@/components/util/SearchableSelect'
import TrialGermplasmLookup from '@/components/util/TrialGermplasmLookup'
import { apiPostTraitDatasetStats, apiPostTrialsDataTable } from '@/mixins/api/trait'
import { getColors, getHighContrastTextColor } from '@/mixins/colors'

import { mdiArrowRightBox } from '@mdi/js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    traits: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      mdiArrowRightBox,
      averageAcrossGermplasm: false,
      selectedTraits: [],
      tempSelectedTraits: [],
      selectedGermplasm: [],
      tempSelectedGermplasm: [],
      itemOptions: [],
      traitData: [],
      traitStats: [],
      individualCharts: false,
      showAverage: true,
      useTraitFullName: false,
      plotPressed: false,
      min: 1,
      max: 10,
      cols: {
        single: {
          cols: 12,
          md: 12,
          lg: 12,
          xl: 12
        },
        multi: {
          cols: 12,
          md: 6,
          lg: 6,
          xl: 4
        }
      }
    }
  },
  watch: {
    averageAcrossGermplasm: function () {
      this.tempSelectedTraits = []
      this.selectedTraits = []
      this.tempSelectedGermplasm = []
      this.selectedGermplasm = []
    }
  },
  computed: {
    radarCols: function () {
      if (this.radarChartDataArray.length > 1) {
        return this.cols.multi
      } else {
        return this.cols.single
      }
    },
    plotDataStats: function () {
      if (this.showAverage) {
        const avg = {
          displayName: this.$t('chartLegendAverageLong'),
          values: [],
          dims: [],
          color: 'grey'
        }
        const result = [avg]

        const ts = this.ensureArray(this.selectedTraits)
        if (ts && ts.length > 0) {
          ts.forEach(t => {
            const match = this.traitStats.find(ts => ts.traitId === t.traitId)
            const v = (match.avg - match.min) / (match.max - match.min) * 100
            avg.values.push(v)
            avg.dims.push(this.useTraitFullName ? match.traitName : (match.traitNameShort || match.traitName))
          })

          if (avg.values.length > 0) {
            avg.values.push(avg.values[0])
          }
          if (avg.dims.length > 0) {
            avg.dims.push(avg.dims[0])
          }
        }

        return result
      } else {
        return []
      }
    },
    radarChartDataArray: function () {
      if (this.traitData && this.traitData.length > 0 && this.traitStats && this.traitStats.length > 0) {
        const outer = []
        let result = []

        const ts = this.ensureArray(this.selectedTraits)

        this.selectedGermplasm.forEach((g, i) => {
          const tData = {
            databaseId: g.germplasmId,
            displayName: `${g.germplasm}-${g.rep || 'N/A'}-${g.block || 'N/A'}`,
            dims: [],
            values: [],
            customdata: [],
            color: this.getColor(i).bg
          }

          const td = this.traitData.filter(tdp => this.averageAcrossGermplasm ? (tdp.germplasmId === g.germplasmId) : (tdp.trialsetupId === g.trialsetupId))

          ts.forEach(trait => {
            const tdp = td.find(tdps => tdps.traitId === trait.traitId)
            if (!tdp) {
              return
            }
            const s = this.traitStats.find(ts => ts.traitId === tdp.traitId)
            let v

            if (trait.dataType === 'categorical') {
              v = this.findIndex(tdp.traitValue, trait.traitRestrictions.categories)
              tData.customdata.push(trait.displayName + '<br>' + trait.traitRestrictions.categories.map(c => c[v]).join('<br>'))
            } else {
              v = +tdp.traitValue
              tData.customdata.push(trait.displayName + '<br>' + (+tdp.traitValue))
            }
            v = (v - s.min) / (s.max - s.min) * 100

            tData.dims.push(this.useTraitFullName ? s.traitName : (s.traitNameShort || s.traitName))
            tData.values.push(v)
          })

          if (tData.customdata.length > 0) {
            tData.customdata.push(tData.customdata[0])
          }

          if (tData.dims.length > 0) {
            tData.dims.push(tData.dims[0])
          }

          if (tData.values.length > 0) {
            tData.values.push(tData.values[0])
          }

          result.push(tData)

          if (this.individualCharts) {
            outer.push(result)
            result = []
          }
        })

        if (!this.individualCharts) {
          outer.push(result)
        }

        return outer
      } else {
        return []
      }
    },
    colors: function () {
      const c = getColors()
      return c.map(c => {
        return {
          bg: c,
          text: getHighContrastTextColor(c)
        }
      })
    },
    selectSize: function () {
      if (this.max !== null) {
        return Math.min(this.max, this.itemOptions.length)
      } else {
        return Math.min(7, this.itemOptions.length)
      }
    },
    selectedItemCount: function () {
      if (!this.selectedTraits) {
        return 0
      } else if (Array.isArray(this.selectedTraits)) {
        return this.selectedTraits.length
      } else {
        return this.selectedTraits !== null ? 1 : 0
      }
    },
    traitOptions: function () {
      const result = []
      if (this.traits) {
        this.traits.forEach(t => {
          if (this.averageAcrossGermplasm ? t.dataType === 'numeric' : (t.dataType === 'numeric' || (t.dataType === 'categorical' && t.traitRestrictions && t.traitRestrictions.categories && t.traitRestrictions.categories.length > 0 && t.traitRestrictions.categories[0].length > 0))) {
            let itemName = t.traitName

            if (t.unitAbbreviation) {
              itemName += ` [${t.unitAbbreviation}]`
            }

            result.push({
              value: t,
              text: itemName
            })

            t.displayName = itemName
          }
        })
      }

      return result
    }
  },
  components: {
    MdiIcon,
    SearchableSelect,
    TrialGermplasmLookup,
    RadarChart,
    ParallelCoordinatesChart,
    BalloonChart,
    HeatmapChart
  },
  methods: {
    updateRotation: function (indexToSkip, rotation) {
      for (let i = 0; i < this.radarChartDataArray.length; i++) {
        if (i === indexToSkip) {
          // Skip the one we received the event from
          continue
        }

        // For each other one, update the rotation to keep them in sync
        this.$refs[`radar-chart-${i}`][0].setRotation(rotation)
      }
    },
    findIndex: function (value, categories) {
      let result = -1

      categories.forEach(c => {
        result = Math.max(result, c.indexOf(value))
      })

      return result
    },
    getButtonDisabled: function () {
      return this.tempSelectedTraits.length < 1 || this.tempSelectedGermplasm.length < 1
    },
    buttonPressed: async function (updateUrl = true) {
      this.traitData = []
      this.traitStats = []
      this.selectedTraits = JSON.parse(JSON.stringify(this.tempSelectedTraits.concat()))
      this.selectedGermplasm = JSON.parse(JSON.stringify(this.tempSelectedGermplasm))
      this.plotPressed = true
      if (updateUrl) {
        const params = {}
        params[`${this.queryId}-plot`] = true
        const routeQuery = Object.assign({}, this.$router.currentRoute.query, params)

        await this.$router.replace({ query: routeQuery })
      }

      const ts = this.ensureArray(this.selectedTraits)

      apiPostTraitDatasetStats({
        datasetIds: this.datasetIds,
        traitIds: ts.map(t => t.traitId)
      }, result => {
        if (result) {
          ts.filter(t => t.dataType === 'categorical').forEach(t => {
            const match = result.find(ot => ot.traitId === t.traitId)

            if (match) {
              match.minValue = match.min
              match.min = 0
              match.maxValue = match.max
              match.max = Math.max.apply(null, t.traitRestrictions.categories.map(c => c.length))
            }
          })

          this.traitStats = result
        } else {
          this.traitStats = []
        }
      })

      const filter = [{
        column: 'traitId',
        comparator: 'inSet',
        operator: 'and',
        values: ts.map(t => t.traitId)
      }]

      if (this.averageAcrossGermplasm) {
        filter.push({
          column: 'germplasmId',
          comparator: 'inSet',
          operator: 'and',
          values: [...new Set(this.selectedGermplasm.map(t => t.germplasmId))]
        })
      } else {
        filter.push({
          column: 'trialsetupId',
          comparator: 'inSet',
          operator: 'and',
          values: this.selectedGermplasm.map(t => t.trialsetupId)
        })
      }

      apiPostTrialsDataTable({
        datasetIds: this.datasetIds,
        filter: filter
      }, result => {
        if (result && result.data && result.data.length > 0) {
          if (this.averageAcrossGermplasm) {
            // Average per germplasm
            const averages = {}
            const germplasm = {}
            const traits = {}

            result.data.forEach(dp => {
              germplasm[dp.germplasmId] = {
                germplasmId: dp.germplasmId,
                germplasmGid: dp.germplasmGid,
                germplasmName: dp.germplasmName,
                germplasmSynonyms: dp.germplasmSynonyms
              }
              traits[dp.traitId] = {
                traitId: dp.traitId,
                traitName: dp.traitName,
                traitNameShort: dp.traitNameShort,
                traitRestrictions: dp.traitRestrictions
              }
              const id = `${dp.germplasmId}|${dp.traitId}`

              if (!averages[id]) {
                averages[id] = {
                  count: 1,
                  sum: +dp.traitValue
                }
              } else {
                averages[id].count++
                averages[id].sum += (+dp.traitValue)
              }
            })

            this.traitData = Object.keys(averages).map(k => {
              const [germplasmId, traitId] = k.split('|').map(Number)

              return {
                germplasmId: germplasm[germplasmId].germplasmId,
                germplasmGid: germplasm[germplasmId].germplasmGid,
                germplasmName: germplasm[germplasmId].germplasmName,
                germplasmSynonyms: germplasm[germplasmId].germplasmSynonyms,
                traitId: traits[traitId].traitId,
                traitName: traits[traitId].traitName,
                traitNameShort: traits[traitId].traitNameShort,
                traitRestrictions: traits[traitId].traitRestrictions,
                traitValue: averages[k].sum / averages[k].count
              }
            })
          } else {
            this.traitData = result.data
          }
        } else {
          this.traitData = []
        }
      })
    },
    ensureArray: function (potentialArray) {
      if (!potentialArray) {
        return []
      } else if (Array.isArray(potentialArray)) {
        return potentialArray
      } else {
        return [potentialArray]
      }
    },
    getColor: function (index) {
      return this.colors[index % this.colors.length]
    },
    removeGermplasm: function (index) {
      this.tempSelectedGermplasm.splice(index, 1)
    },
    onGermplasmSelected: function (newGermplasm) {
      const index = this.tempSelectedGermplasm.findIndex(sg => this.averageAcrossGermplasm ? (sg.germplasmId === newGermplasm.germplasmId) : (sg.trialsetupId === newGermplasm.trialsetupId))

      if (index === -1) {
        this.tempSelectedGermplasm.push(newGermplasm)
      } else {
        this.tempSelectedGermplasm.splice(index, 1)
      }
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      const q = this.$router.currentRoute.query[`${this.queryId}-plot`]

      if (q !== undefined) {
        this.$nextTick(() => this.buttonPressed(false))
      }
    }
  }
}
</script>

<style scoped>
.badge-close {
  color: inherit;
  font-size: 125%;
  line-height: 1;
  float: none;
  margin-left: 0.25rem;
}
</style>
