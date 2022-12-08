<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => getHeight()" :sourceFile="baseSourceFile" :filename="baseFilename" :loading="loading" v-on:force-redraw="redraw">
      <div slot="chart">
        <b-form @submit.prevent>
          <b-form-group :label="$t('formLabelTraitChartGrouping')" label-for="grouping">
            <b-form-select :options="groupingOptions" v-model="groupBy" key="grouping" />
          </b-form-group>
        </b-form>

        <div id="boxplot-chart" ref="chart" />
      </div>

      <!-- Badge that shows how many data points are selected -->
      <span slot="buttonContent" class="badge badge-pill badge-info selection-count" v-if="selectedIds && selectedIds.length > 0">{{ selectedIds.length }}</span>

      <template slot="additionalMenuItems">
        <b-dropdown-divider />
        <b-dropdown-item :disabled="!selectedIds || selectedIds.length < 1"
                         @click="toggleItems(true)">
          <MdiIcon :path="mdiCheckboxMarked" /> <span> {{ $t('widgetChartMarkSelectedItems') }}</span>
        </b-dropdown-item>
        <b-dropdown-item :disabled="!selectedIds || selectedIds.length < 1"
                         @click="toggleItems(false)">
          <MdiIcon :path="mdiCheckboxBlankOutline" /> <span> {{ $t('widgetChartUnmarkSelectedItems') }}</span>
        </b-dropdown-item>
      </template>

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <MdiIcon :path="mdiHelpCircleOutline" />
        </b-button>
        <MarkedItems itemType="germplasm" />
      </template>
    </BaseChart>
    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />

    <!-- Modal to show the passport page on data point click -->
    <b-modal size="xl" ref="passportModal" v-if="selectedGermplasmId" @hidden="selectedGermplasmId = null" scrollable ok-only hide-header :ok-title="$t('buttonClose')">
      <Passport :germplasmId="selectedGermplasmId" :isPopup="true" />
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import MarkedItems from '@/components/tables/MarkedItems'
import { getColor } from '@/mixins/colors.js'
import Tour from '@/components/util/Tour'
import { uuidv4 } from '@/mixins/util'
import Passport from '@/views/data/germplasm/Passport'

import { mdiHelpCircleOutline, mdiCheckboxMarked, mdiCheckboxBlankOutline } from '@mdi/js'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { apiPostTrialsDataTable } from '@/mixins/api/trait'

const Plotly = require('plotly.js-dist-min')

let plotData = null
let datasets = []
let groups = []
let traits = []
let treatments = []

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    traitIds: {
      type: Array,
      default: () => null
    },
    groupIds: {
      type: Array,
      default: () => null
    },
    markedIds: {
      type: Array,
      default: () => null
    }
  },
  components: {
    BaseChart,
    MarkedItems,
    MdiIcon,
    Passport,
    Tour
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      mdiHelpCircleOutline,
      mdiCheckboxMarked,
      mdiCheckboxBlankOutline,
      id: id,
      loading: false,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourGenericModebarTitle'),
        text: () => this.$t('popoverChartTourGenericModebarText'),
        target: () => `#${id} .modebar`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionText'),
        target: () => `#${id} #boxplot-chart`,
        position: 'top'
      }, {
        title: () => this.$t('popoverChartTourMarkableCountTitle'),
        text: () => this.$t('popoverChartTourMarkableCountText'),
        target: () => `#${id} #marked-items-count`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableClearTitle'),
        text: () => this.$t('popoverChartTourMarkableClearText'),
        target: () => `#${id} #marked-items-clear`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionToggleTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionToggleText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }],
      groupBy: 'dataset',
      selectedIds: [],
      selectedGermplasmId: null
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    groupingOptions: function () {
      return [{
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset'
      }, {
        text: this.$t('widgetChartColoringByTreatment'),
        value: 'treatment'
      }, {
        text: this.$t('widgetChartColoringByGroup'),
        value: 'group'
      }]
    },
    baseSourceFile: function () {
      return {
        blob: new Blob([JSON.stringify(plotData)], { type: 'application/json' }),
        filename: this.baseFilename,
        extension: 'json'
      }
    },
    baseFilename: function () {
      let name = 'trait-boxplot'
      if (this.datasetIds) {
        name += `-${this.datasetIds.join('-')}`
      } else {
        name += '-all-datasets'
      }
      if (this.traitIds) {
        name += `-${this.traitIds.join('-')}`
      } else {
        name += '-all-traits'
      }

      return name
    }
  },
  watch: {
    groupBy: function () {
      this.chart()
    }
  },
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    getHeight: function () {
      switch (this.groupBy) {
        case 'dataset':
          return (traits.length + datasets.length) * 150
        case 'group':
          return (traits.length + groups.length) * 150
        case 'treatment':
          return (treatments.length + traits.length) * 150
        default:
          return traits.length * 150
      }
    },
    redraw: function () {
      this.loading = true

      apiPostTrialsDataTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        prevCount: -1,
        datasetIds: this.datasetIds,
        xIds: this.traitIds,
        yGroupIds: this.groupIds,
        yIds: this.markedIds,
        minimal: true
      }, result => {
        plotData = result.data
        this.chart()
        this.loading = false
      })
    },
    toggleItems: function (add) {
      if (add === true) {
        this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: this.selectedIds })
      } else {
        this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: this.selectedIds })
      }
    },
    chart: function () {
      this.selectedIds = []
      this.selectedGermplasmId = null

      const div = this.$refs.chart

      Plotly.purge(div)

      let traces

      const dsSet = new Set()
      const traitSet = new Set()
      const treatmentSet = new Set()
      const groupSet = new Set()

      plotData.forEach(pd => {
        if (pd.datasetId) {
          dsSet.add(JSON.stringify({ id: pd.datasetId, name: pd.datasetName }))
        }
        if (pd.traitId) {
          traitSet.add(pd.traitId)
        }
        if (pd.treatment) {
          treatmentSet.add(pd.treatment)
        }
        if (pd.groups) {
          pd.groups.forEach(g => groupSet.add(JSON.stringify(g)))
        }
      })

      datasets = [...dsSet].map(ds => JSON.parse(ds))
      traits = [...traitSet]
      treatments = [...treatmentSet]
      groups = [...groupSet].map(g => JSON.parse(g))

      if (this.groupBy === 'dataset') {
        traces = datasets.map((ds, index) => {
          const datasetData = plotData.filter(pd => pd.datasetId === ds.id)

          return {
            y: datasetData.map(td => td.traitName),
            x: datasetData.map(td => +td.traitValue),
            ids: datasetData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: datasetData.map(td => td.germplasmName),
            name: ds.name,
            marker: { color: getColor(index), size: 4 },
            type: 'box',
            boxmean: false,
            orientation: 'h',
            jitter: 0.3,
            boxpoints: 'all'
          }
        })
      } else if (this.groupBy === 'treatment') {
        traces = treatments.map((treatment, index) => {
          const treatmentData = plotData.filter(pd => pd.treatment === treatment)

          return {
            y: treatmentData.map(td => td.traitName),
            x: treatmentData.map(td => +td.traitValue),
            ids: treatmentData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: treatmentData.map(td => td.germplasmName),
            name: treatment,
            marker: { color: getColor(index), size: 4 },
            type: 'box',
            boxmean: false,
            orientation: 'h',
            jitter: 0.3,
            boxpoints: 'all'
          }
        })
      } else if (this.groupBy === 'group' && groups) {
        traces = groups.map((group, index) => {
          const groupData = plotData.filter(pd => pd.groups && pd.groups.some(g => g.id === group.id))

          return {
            y: groupData.map(td => td.traitName),
            x: groupData.map(td => +td.traitValue),
            ids: groupData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: groupData.map(td => td.germplasmName),
            name: group.name,
            marker: { color: getColor(index), size: 4 },
            type: 'box',
            boxmean: false,
            orientation: 'h',
            jitter: 0.3,
            boxpoints: 'all'
          }
        })
      }

      const layout = {
        xaxis: {
          zeroline: false,
          side: 'top',
          title: { font: { color: this.storeDarkMode ? 'white' : 'black' } },
          tickfont: { color: this.storeDarkMode ? 'white' : 'black' },
          showgrid: true,
          gridcolor: this.storeDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
          mirror: 'ticks'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        height: this.getHeight(),
        margin: { autoexpand: true },
        autosize: true,
        boxmode: 'group',
        dragmode: 'select',
        yaxis: {
          automargin: true,
          title: { font: { color: this.storeDarkMode ? 'white' : 'black' } },
          tickfont: { color: this.storeDarkMode ? 'white' : 'black' }
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h'
        }
      }

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      Plotly.newPlot(div, traces, layout, config)

      div.on('plotly_selected', eventData => {
        if (!eventData || (eventData.points.length < 1)) {
          Plotly.restyle(div, { selectedpoints: null })

          this.selectedIds = []
        } else {
          this.selectedIds = [...new Set(eventData.points.map(p => parseInt(p.id.split('-')[0])).filter((value, index, self) => self.indexOf(value) === index))]
        }
      })

      div.on('plotly_click', data => {
        if (data.points.length > 0) {
          this.selectedGermplasmId = parseInt(data.points[0].id.split('-')[0])

          this.$nextTick(() => this.$refs.passportModal.show())
        } else {
          this.selectedGermplasmId = null
        }
      })
    }
  },
  mounted: function () {
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
</style>
