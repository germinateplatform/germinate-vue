<template>
  <div>
    <BaseTable :options="options" :columns="columns">
      <!-- Formatted date -->
      <span slot="startdate" slot-scope="props" v-if="props.row.startdate">{{ props.row.startdate | toDate }}</span>
      <span slot="enddate" slot-scope="props" v-if="props.row.enddate">{{ props.row.enddate | toDate }}</span>

      <!-- Country flags -->
      <div slot="countryname" slot-scope="props" class="table-country"><i :class="'flag-icon flag-icon-' + props.row.countrycode.toLowerCase()" v-if="props.row.countrycode"/> <span> {{ props.row.countryname }}</span></div>

      <span slot="dataobjectcount" slot-scope="props" v-if="props.row.dataobjectcount && props.row.dataobjectcount.value">{{ props.row.dataobjectcount.value }}</span>
      <span slot="datapointcount" slot-scope="props" v-if="props.row.datapointcount && props.row.datapointcount.value">{{ getDataPointCount(props.row) }}</span>

      <a href="#" slot="licensename" slot-scope="props" v-if="props.row.licensename" @click.prevent="onLicenseClicked(props.row)">
        <span>{{ props.row.licensename }} </span>
        <i class="mdi mdi-18px mdi-check" v-if="props.row.acceptedby && props.row.acceptedby == token.id" />
        <i class="mdi mdi-18px mdi-new-box" v-else />
      </a>
    </BaseTable>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'DatasetsTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    }
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  data: function () {
    const columns = ['selected', 'datasetid', 'datasetname', 'datasetdescription', 'experimenttype', 'datatype', 'location', 'countryname', 'licensename', 'contact', 'startdate', 'enddate', 'dataobjectcount', 'datapointcount']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiPostDatasetTable(data, callback)
        },
        idColumn: 'datasetid',
        tableName: 'datasets',
        filterOn: this.filterOn,
        sortable: ['datasetid', 'datasetname', 'datasetdescription', 'experimenttype', 'datatype', 'location', 'countryname', 'licensename', 'contact', 'startdate', 'enddate', 'dataobjectcount', 'datapointcount'],
        filterable: [],
        headings: {
          datasetid: () => this.$t('tableColumnDatasetId'),
          datasetname: () => this.$t('tableColumnDatasetName'),
          datasetdescription: () => this.$t('tableColumnDatasetDescription'),
          experimenttype: () => this.$t('tableColumnDatasetExperimentType'),
          datatype: () => this.$t('tableColumnDatasetDataType'),
          location: () => this.$t('tableColumnDatasetLocation'),
          countryname: () => this.$t('tableColumnDatasetCountryName'),
          licensename: () => this.$t('tableColumnDatasetLicenseName'),
          contract: () => this.$t('tableColumnDatasetContact'),
          startdate: () => this.$t('tableColumnDatasetStartDate'),
          enddate: () => this.$t('tableColumnDatasetEndDate'),
          dataobjectcount: () => this.$t('tableColumnDatasetObjectCount'),
          datapointcount: () => this.$t('tableColumnDatasetPointCount'),
          selected: () => ''
        },
        orderBy: {
          column: 'datasetid'
        },
        columnsClasses: {
          dataobjectcount: 'text-right',
          datapointcount: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    getDataPointCount: function (dataset) {
      var result = ''
      if (dataset.experimenttype === 'genotype' || dataset.experimenttype === 'allelefreq') {
        result = '≤'
      }
      result += dataset.datapointcount.value
      return result
    },
    onLicenseClicked: function (dataset) {
      console.log(dataset.licensename)
    }
  }
}
</script>

<style>
</style>
