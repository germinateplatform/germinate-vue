<template>
  <b-row>
    <b-col cols=12 md=6 v-if="traits && traits.length > 0">
      <h2>{{ $t('pageTrialsExportSelectTraitTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectTraitChartText') }}</p>
      <!-- Selected trait/climate -->
      <SearchableSelect v-model="selectedTraits" queryId="`traitRadar-dim`" idKey="traitId" :options="traitOptions" :multiple="true" :selectSize="7" />
      <p class="text-danger" v-if="max !== null && selectedItemCount > max">{{ $tc('pageExportSelectItemMaximum', max) }}</p>
      <p class="text-info" v-if="min !== null && selectedItemCount < min">{{ $tc('pageExportSelectItemMinimum', min) }}</p>
    </b-col>
    <b-col cols=12 md=6>
      <h2>{{ $t('pageTrialsExportSelectGermplasmTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectGermplasmText') }}</p>
      <b-form-group :label="$t('formLabelTraitTimelineGermplasm')" label-for="germplasm-search">
        <TrialGermplasmLookup id="germplasm-search" :datasetIds="datasetIds" @germplasm-selected="onGermplasmSelected" />
      </b-form-group>

      <div v-if="selectedGermplasm && selectedGermplasm.length > 0">
        <b-badge class="mr-2" v-for="(germplasm, index) in selectedGermplasm" :key="`germplasm-badge-${germplasm.trialsetupId}`" :style="{ backgroundColor: getColor(index).bg, color: getColor(index).text }">
          {{ `${germplasm.germplasm}-${germplasm.rep}` }} <button type="button" class="close badge-close" @click="removeGermplasm(index)">×</button>
        </b-badge>
      </div>
    </b-col>
    <b-col class="mb-3" cols=12>
      <b-btn class="my-3" variant="primary" @click="buttonPressed" :disabled="getButtonDisabled()"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('buttonPlot') }}</b-btn>

      <b-form-checkbox switch v-if="plotPressed" v-model="individualCharts"> {{ $t('formCheckboxShowIndividualCharts') }}</b-form-checkbox>
      <b-form-checkbox switch v-if="plotPressed" v-model="showAverage"> {{ $t('formCheckboxShowAverage') }}</b-form-checkbox>
    </b-col>

    <template v-if="radarChartDataArray && radarChartDataArray.length > 0">
      <b-col class="mb-3" :cols="radarCols.cols" :md="radarCols.md" :lg="radarCols.lg" v-for="(data, index) in radarChartDataArray" :key="`radar-chart-data-${index}`">
        <h3 v-if="individualCharts">{{ data[0].displayName }}</h3>
        <RadarChart :baseFilename="`radar-chart-${datasetIds.join(',')}`" :plotData="data" :stats="plotDataStats" />
      </b-col>
    </template>
  </b-row>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import RadarChart from '@/components/charts/RadarChart'
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
      selectedTraits: [],
      selectedGermplasm: [],
      itemOptions: [],
      traitData: [],
      traitStats: [],
      individualCharts: false,
      showAverage: true,
      plotPressed: false,
      min: 1,
      max: 10,
      cols: {
        single: {
          cols: 12,
          md: 12,
          lg: 12
        },
        multi: {
          cols: 12,
          md: 6,
          lg: 4
        }
      }
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
          ts.filter(t => t.dataType === 'categorical').forEach(t => {
            const match = this.traitStats.find(ts => ts.traitId === t.traitId)
            const v = (match.avg - match.min) / (match.max - match.min) * 100
            avg.values.push(v)
            avg.dims.push(match.traitNameShort || match.traitName)
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
            displayName: `${g.germplasm}-${g.rep}-${g.block || 'N/A'}`,
            dims: [],
            values: [],
            customdata: [],
            color: this.getColor(i).bg
          }

          const td = this.traitData.filter(tdp => tdp.trialsetupId === g.trialsetupId)

          ts.forEach(trait => {
            const tdp = td.find(tdps => tdps.traitId === trait.traitId)
            const s = this.traitStats.find(ts => ts.traitId === tdp.traitId)
            let v

            if (trait.dataType === 'categorical') {
              v = this.findIndex(tdp.traitValue, trait.traitRestrictions.categories)
            } else {
              v = +tdp.traitValue
            }
            v = (v - s.min) / (s.max - s.min) * 100

            tData.customdata.push(tdp.traitValue)
            tData.dims.push(s.traitNameShort || s.traitName)
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
          if (t.dataType === 'numeric' || (t.dataType === 'categorical' && t.traitRestrictions && t.traitRestrictions.categories && t.traitRestrictions.categories.length > 0 && t.traitRestrictions.categories[0].length > 0)) {
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
    RadarChart
  },
  methods: {
    findIndex: function (value, categories) {
      let result = -1

      categories.forEach(c => {
        result = Math.max(result, c.indexOf(value))
      })

      return result
    },
    getButtonDisabled: function () {
      return this.selectedTraits.length < 1 || this.selectedGermplasm.length < 1
    },
    buttonPressed: async function (updateUrl = true) {
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

      apiPostTrialsDataTable({
        datasetIds: this.datasetIds,
        filter: [{
          column: 'trialsetupId',
          comparator: 'inSet',
          operator: 'and',
          values: this.selectedGermplasm.map(t => t.trialsetupId)
        }, {
          column: 'traitId',
          comparator: 'inSet',
          operator: 'and',
          values: ts.map(t => t.traitId)
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.traitData = result.data
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
      this.selectedGermplasm.splice(index, 1)
    },
    onGermplasmSelected: function (newGermplasm) {
      const index = this.selectedGermplasm.findIndex(sg => sg.trialsetupId === newGermplasm.trialsetupId)

      if (index === -1) {
        this.selectedGermplasm.push(newGermplasm)
      } else {
        this.selectedGermplasm.splice(index, 1)
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
