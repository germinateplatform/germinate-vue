<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <template slot="datasetName" slot-scope="props">
        <a target="_blank" :href="props.row.hyperlink" v-if="props.row.hyperlink && props.row.isExternal">{{ props.row.datasetName }} <i class="mdi mdi-18px mdi-open-in-new fix-alignment" /></a>
        <span v-else>{{ props.row.datasetName }}</span>
      </template>
      <!-- Formatted date -->
      <span slot="startDate" slot-scope="props" v-if="props.row.startDate">{{ props.row.startDate | toDate }}</span>
      <span slot="endDate" slot-scope="props" v-if="props.row.endDate">{{ props.row.endDate | toDate }}</span>

      <!-- Country flags -->
      <span slot="countryName" slot-scope="props" class="table-country text-nowrap" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode.toLowerCase()" v-if="props.row.countryCode"/> <span> {{ props.row.countryCode }}</span></span>

      <span slot="experimentType" slot-scope="props"><i :class="`mdi mdi-18px ${experimentTypes[props.row.experimentType].icon} fix-alignment`" :style="`color: ${experimentTypes[props.row.experimentType].color()};`" /> {{ experimentTypes[props.row.experimentType].text() }}</span>
      <span slot="dataObjectCount" slot-scope="props" v-if="props.row.dataObjectCount && props.row.dataObjectCount.value">{{ props.row.dataObjectCount.value }}</span>
      <span slot="dataPointCount" slot-scope="props" v-if="props.row.dataPointCount && props.row.dataPointCount.value">{{ getDataPointCount(props.row) }}</span>

      <div slot="licenseName" slot-scope="props" v-if="props.row.licenseName">
        <a href="#" @click.prevent="onLicenseClicked(props.row)" class="text-nowrap">
          <span>{{ props.row.licenseName }} </span>
        </a>
        <i class="mdi mdi-18px mdi-check fix-alignment" v-if="props.row.acceptedBy && parseInt(props.row.acceptedBy) == token.id" />
        <i class="mdi mdi-18px mdi-new-box fix-alignment" v-else />
      </div>
      <i slot="datasetState" slot-scope="props" :class="`mdi mdi-18px ${datasetStates[props.row.datasetState].icon}`" :title="datasetStates[props.row.datasetState].text()" />
      <i slot="isExternal" slot-scope="props" :class="`mdi mdi-18px ${getInternalExternalClass(props.row)}`" v-if="props.row.isExternal !== undefined" :title="props.row.isExternal" />
    </BaseTable>

    <LicenseModal :license="license" :dataset="dataset" :isAccepted="dataset.acceptedBy !== undefined" ref="licenseModal" v-if="dataset" v-on:license-accepted="onLicenseAccepted"/>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import LicenseModal from '@/components/modals/LicenseModal'

export default {
  name: 'DatasetTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {}
    },
    getIds: {
      type: Function,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    var columns = [
      {
        name: 'datasetId',
        type: Number
      }, {
        name: 'datasetName',
        type: String
      }, {
        name: 'datasetDescription',
        type: String
      }, {
        name: 'experimentName',
        type: String
      }, {
        name: 'experimentType',
        type: String
      }, {
        name: 'dataType',
        type: String
      }, {
        name: 'location',
        type: String
      }, {
        name: 'countryName',
        type: String
      }, {
        name: 'licenseName',
        type: String
      }, {
        name: 'contact',
        type: String
      }, {
        name: 'startDate',
        type: Date
      }, {
        name: 'endDate',
        type: Date
      }, {
        name: 'dataObjectCount',
        type: Number
      }, {
        name: 'dataPointCount',
        type: Number
      }, {
        name: 'isExternal',
        type: Boolean
      }, {
        name: 'datasetState',
        type: undefined
      }
    ]

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'datasetId',
        tableName: 'datasets',
        filterOn: this.filterOn,
        sortable: ['datasetId', 'datasetName', 'datasetDescription', 'experimentName', 'experimentType', 'dataType', 'location', 'countryName', 'licenseName', 'contact', 'startDate', 'endDate', 'dataObjectCount', 'dataPointCount', 'isExternal'],
        filterable: [],
        headings: {
          datasetId: () => this.$t('tableColumnDatasetId'),
          datasetName: () => this.$t('tableColumnDatasetName'),
          datasetDescription: () => this.$t('tableColumnDatasetDescription'),
          experimentName: () => this.$t('tableColumnExperimentName'),
          experimentType: () => this.$t('tableColumnDatasetExperimentType'),
          dataType: () => this.$t('tableColumnDatasetDataType'),
          location: () => this.$t('tableColumnDatasetLocation'),
          countryName: () => this.$t('tableColumnDatasetCountryName'),
          licenseName: () => this.$t('tableColumnDatasetLicenseName'),
          contract: () => this.$t('tableColumnDatasetContact'),
          startDate: () => this.$t('tableColumnDatasetStartDate'),
          endDate: () => this.$t('tableColumnDatasetEndDate'),
          dataObjectCount: () => this.$t('tableColumnDatasetObjectCount'),
          dataPointCount: () => this.$t('tableColumnDatasetPointCount'),
          datasetState: () => '',
          isExternal: () => 'External',
          selected: ''
        },
        orderBy: {
          column: 'datasetId'
        },
        columnsClasses: {
          selected: 'bg-info',
          dataObjectCount: 'text-right',
          dataPointCount: 'text-right'
        },
        rowClassCallback: row => this.getRowClass(row)
      },
      columns: columns,
      dataset: null,
      license: null,
      datasetStates: {
        public: {
          icon: 'mdi-lock-open-outline',
          text: () => this.$t('datasetStatePublic')
        },
        private: {
          icon: 'mdi-lock',
          text: () => this.$t('datasetStatePrivate')
        },
        hidden: {
          icon: 'mdi-eye-off text-primary',
          text: () => this.$t('datasetStateHidden')
        }
      }
    }
  },
  components: {
    BaseTable,
    LicenseModal
  },
  methods: {
    getRowClass: function (dataset) {
      if (!dataset.licenseName) {
        return ''
      } else {
        return (dataset.acceptedBy !== undefined && parseInt(dataset.acceptedBy) === this.token.id) ? '' : 'table-danger'
      }
    },
    getInternalExternalClass: function (dataset) {
      return dataset.isExternal ? 'mdi-link-box-variant-outline' : 'mdi-file-document-box-outline'
    },
    getDataPointCount: function (dataset) {
      var result = ''
      if (dataset.experimentType === 'genotype' || dataset.experimentType === 'allelefreq') {
        result = '≤'
      }
      result += dataset.dataPointCount.value
      return result
    },
    onLicenseAccepted: function () {
      this.$refs.licenseModal.hide()

      // TODO: Send server request.
    },
    onLicenseClicked: function (dataset) {
      this.dataset = dataset

      if (this.license && this.license.licenseId === this.dataset.licenseId) {
        // If we already have the correct license, just show it
        this.$refs.licenseModal.show()
      } else {
        // Otherwise, go get it
        const query = {
          page: 1,
          prevCount: -1,
          filter: [{
            column: 'licenseId',
            comparator: 'equals',
            operator: 'and',
            values: [dataset.licenseId]
          }, {
            column: 'localeName',
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
