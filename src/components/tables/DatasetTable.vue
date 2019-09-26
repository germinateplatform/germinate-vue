<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :filterOn="filterOn"
               ref="datasetTable"
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
        <i class="mdi mdi-18px mdi-check fix-alignment text-success" v-if="isAccepted(props.row)" />
        <i class="mdi mdi-18px mdi-new-box fix-alignment text-danger" v-else />
      </div>
      <i slot="datasetState" slot-scope="props" :class="`mdi mdi-18px ${datasetStates[props.row.datasetState].icon}`" :title="datasetStates[props.row.datasetState].text()" />
      <i slot="isExternal" slot-scope="props" :class="`mdi mdi-18px ${getInternalExternalClass(props.row)}`" v-if="props.row.isExternal !== undefined" :title="props.row.isExternal" />

      <a href="#" class="text-decoration-none" slot="collaborators" slot-scope="props" v-if="props.row.collaborators !== 0" @click.prevent="showCollaborators(props.row)">
        <i class="mdi mdi-18px mdi-account-multiple" v-b-tooltip.hover :title="$t('tableTooltipDatasetCollaborators')" />
      </a>
      <a href="#" class="text-decoration-none" slot="attributes" slot-scope="props" v-if="props.row.attributes !== 0 || props.row.dublinCore" @click.prevent="showAttributes(props.row)">
        <i class="mdi mdi-18px mdi-file-plus" v-b-tooltip.hover :title="$t('tableTooltipDatasetAttributes')" />
      </a>
    </BaseTable>

    <LicenseModal :license="license" :dataset="dataset" :isAccepted="dataset.acceptedBy && dataset.acceptedBy.length > 0" ref="licenseModal" v-if="dataset" v-on:license-accepted="onLicenseAccepted"/>
    <CollaboratorModal :dataset="dataset" v-if="dataset && dataset.collaborators !== 0" ref="collaboratorModal" />
    <AttributeModal :dataset="dataset" v-if="dataset && (dataset.dublinCore !== undefined || dataset.attributes !== 0)" ref="attributeModal" />
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import LicenseModal from '@/components/modals/LicenseModal'
import CollaboratorModal from '@/components/modals/CollaboratorModal'
import AttributeModal from '@/components/modals/AttributeModal'

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
      }, {
        name: 'collaborators',
        type: undefined
      }, {
        name: 'attributes',
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
          collaborators: () => '',
          attributes: () => '',
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
    AttributeModal,
    BaseTable,
    CollaboratorModal,
    LicenseModal
  },
  methods: {
    isAccepted: function (dataset) {
      if (this.token) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.token.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
    showCollaborators: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.collaboratorModal.show())
    },
    showAttributes: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.attributeModal.show())
    },
    getRowClass: function (dataset) {
      if (!dataset.licenseName) {
        return ''
      } else {
        return this.isAccepted(dataset) ? '' : 'table-danger'
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
    getSelected: function () {
      return this.$refs.datasetTable.getSelected()
    },
    onLicenseAccepted: function () {
      this.$refs.licenseModal.hide()
      this.$refs.datasetTable.refresh()
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
            column: 'datasetId',
            comparator: 'equals',
            operator: 'and',
            values: [this.dataset.datasetId]
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
