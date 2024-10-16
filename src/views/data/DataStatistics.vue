<template>
  <div>
    <h1>{{ $t('pageStatisticsTitle') }}<small> - {{ $t('pageStatisticsSubtitle') }}</small></h1>
    <hr />
    <b-row>
      <b-col cols=12 sm=6>
        <h2>{{ $t('pageStatisticsTaxonomyTitle') }}</h2>
        <p>{{ $t('pageStatisticsTaxonomyText') }}</p>
        <!-- Taxonomy sunburst chart -->
        <TaxonomySunburst />
        <TaxonomySankey />
      </b-col>
      <b-col cols=12 sm=6>
        <h2>{{ $t('pageStatisticsBiologicalStatusTitle') }}</h2>
        <p>{{ $t('pageStatisticsBiologicalStatusText') }}</p>
        <!-- Biological status chart -->
        <BarChart xColumn="biologicalstatus"
                  :xTitle="$t('pageStatisticsBiologicalStatusXAxis')"
                  :yTitle="$t('genericCount')"
                  downloadName="biological-status"
                  :sourceFile="biologicalstatusFile"
                  v-on:bar-clicked="biologicalStatusClicked" />
      </b-col>
    </b-row>
    <h2>{{ $t('pageStatisticsPdciTitle') }}</h2>
    <p v-html="$t('pagePassportPdciModal')" />
    <!-- PDCI chart -->
    <BarChart xColumn="bin"
              xTitle="PDCI"
              :yTitle="$t('genericCount')"
              downloadName="pdci"
              :sourceFile="pdciFile"
              v-on:bar-clicked="pdciClicked" />

    <h2>{{ $t('pageStatisticsLocationsTitle') }}</h2>
    <p>{{ $t('pageStatisticsLocationsText') }}</p>
    <!-- Choropleth for locations -->
    <ChoroplethChart />

    <h2>{{ $t('pageStatisticsInstitutionDatasetTitle') }}</h2>
    <p>{{ $t('pageStatisticsInstitutionDatasetText') }}</p>
    <!-- Institutions with datasets -->
    <InstitutionDatasetTable :getData="getInstitutionDatasets" />

    <h2>{{ $t('pageStatisticsDatasetTitle') }}</h2>
    <p>{{ $t('pageStatisticsDatasetText') }}</p>
    <!-- Data points per dataset type and year -->
    <BarChart xColumn="DatasetType"
              xTitle="Experiment type"
              yTitle="Data points"
              downloadName="datasets"
              :sourceFile="datasetsFile"
              v-on:bar-clicked="datasetClicked" />
  </div>
</template>

<script>
import BarChart from '@/components/charts/BarChart'
import ChoroplethChart from '@/components/charts/ChoroplethChart'
import TaxonomySunburst from '@/components/charts/TaxonomySunburst'
import TaxonomySankey from '@/components/charts/TaxonomySankey'
import InstitutionDatasetTable from '@/components/tables/InstitutionDatasetTable'
import { apiGetStatsFile } from '@/mixins/api/stats'
import { Pages } from '@/mixins/pages'
import { apiPostInstitutionDatasetTable } from '@/mixins/api/misc'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      biologicalstatusFile: null,
      datasetsFile: null,
      pdciFile: null
    }
  },
  components: {
    BarChart,
    ChoroplethChart,
    TaxonomySankey,
    TaxonomySunburst,
    InstitutionDatasetTable
  },
  methods: {
    getInstitutionDatasets: function (data, callback) {
      return apiPostInstitutionDatasetTable(data, callback)
    },
    biologicalStatusClicked: function (status) {
      const filter = [{
        column: 'biologicalStatusName',
        comparator: 'contains',
        operator: 'and',
        values: [status + '%']
      }]
      this.$router.push({
        name: Pages.germplasm,
        query: {
          'germplasm-filter': JSON.stringify(filter)
        }
      })
    },
    pdciClicked: function (bar) {
      const parts = bar.split('-')
      const filter = [{
        column: 'pdci',
        comparator: 'between',
        operator: 'and',
        values: parts
      }]
      this.$router.push({
        name: Pages.germplasm,
        query: {
          'germplasm-filter': JSON.stringify(filter)
        }
      })
    },
    datasetClicked: function (dataset) {
      this.$router.push({ name: Pages.export, params: { datasetType: dataset } })
    }
  },
  mounted: function () {
    emitter.emit('show-loading', true)
    const p1 = apiGetStatsFile('biologicalstatus', result => {
      this.biologicalstatusFile = result
    })
    const p2 = apiGetStatsFile('pdci', result => {
      this.pdciFile = result
    })
    const p3 = apiGetStatsFile('dataset', result => {
      this.datasetsFile = result
    })

    // When they're all done (either successful or not), hide the loading indicator
    Promise.all([p1, p2, p3])
      .finally(() => emitter.emit('show-loading', false))
  }
}
</script>

<style>

</style>
