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

      <div slot="licensename" slot-scope="props" v-if="props.row.licensename">
        <a href="#" @click.prevent="onLicenseClicked(props.row)" class="text-nowrap">
          <span>{{ props.row.licensename }} </span>
        </a>
        <i class="mdi mdi-18px mdi-check" v-if="props.row.acceptedby && props.row.acceptedby == token.id" />
        <i class="mdi mdi-18px mdi-new-box" v-else />
      </div>
    </BaseTable>

    <LicenseModal :license="license" :dataset="dataset" :isAccepted="dataset.acceptedby !== undefined" ref="licenseModal" v-if="dataset" v-on:license-accepted="onLicenseAccepted"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'
import LicenseModal from '@/components/modals/LicenseModal'

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
      'token',
      'locale'
    ])
  },
  data: function () {
    const columns = [
      {
        name: 'selected',
        type: undefined
      }, {
        name: 'datasetid',
        type: Number
      }, {
        name: 'datasetname',
        type: String
      }, {
        name: 'datasetdescription',
        type: String
      }, {
        name: 'experimenttype',
        type: String
      }, {
        name: 'datatype',
        type: String
      }, {
        name: 'location',
        type: String
      }, {
        name: 'countryname',
        type: String
      }, {
        name: 'licensename',
        type: String
      }, {
        name: 'contact',
        type: String
      }, {
        name: 'startdate',
        type: Date
      }, {
        name: 'enddate',
        type: Date
      }, {
        name: 'dataobjectcount',
        type: Number
      }, {
        name: 'datapointcount',
        type: Number
      }
    ]
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
          selected: 'bg-info',
          dataobjectcount: 'text-right',
          datapointcount: 'text-right'
        }
      },
      columns: columns,
      dataset: null,
      license: null
    }
  },
  components: {
    BaseTable,
    LicenseModal
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
    onLicenseAccepted: function () {
      this.$refs.licenseModal.hide()

      // TODO: Send server request.
    },
    onLicenseClicked: function (dataset) {
      this.dataset = dataset

      if (this.license && this.license.licenseid === this.dataset.licenseid) {
        // If we already have the correct license, just show it
        this.$refs.licenseModal.show()
      } else {
        // Otherwise, go get it
        const query = {
          page: 1,
          prevCount: -1,
          filter: [{
            column: 'licenseid',
            comparator: 'equals',
            operator: 'and',
            values: [dataset.licenseid]
          }, {
            column: 'localename',
            comparator: 'equals',
            operator: 'and',
            values: [this.locale]
          }]
        }
        this.apiPostLicenseTable(query, result => {
          if (result && result.data && result.data.length > 0) {
            this.license = result.data[0]
            this.$refs.licenseModal.show()
          }
        })
      }
    }
  }
}
</script>
