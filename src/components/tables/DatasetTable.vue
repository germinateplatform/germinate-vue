<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="datasetTable"
               v-on="$listeners">
      <div slot="h__dataObjectCount">
        <span>{{ options.headings.dataObjectCount() }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipDatasetDataObjects')"/>
      </div>
      <div slot="h__dataPointCount">
        <span>{{ options.headings.dataPointCount() }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.bottom.hover :title="$t('tableColumnTooltipDatasetDataPoints')"/>
      </div>

      <template slot="datasetId" slot-scope="props">
        <router-link :to="{ name: experimentTypes[props.row.experimentType].pageName, params: { datasetIds: props.row.datasetId.toString() } }" v-if="!props.row.isExternal && isPageAvailable(props.row.experimentType) && (!props.row.licenseName || isAccepted(props.row))">{{ props.row.datasetId }}</router-link>
        <span v-else>{{ props.row.datasetId }}</span>
      </template>
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
      <span slot="dataObjectCount" slot-scope="props" v-if="props.row.dataObjectCount !== undefined && props.row.dataObjectCount.value">{{ props.row.dataObjectCount.value }}</span>
      <span slot="dataPointCount" slot-scope="props" v-if="props.row.dataPointCount !== undefined && props.row.dataPointCount.value">{{ getDataPointCount(props.row) }}</span>

      <div slot="licenseName" slot-scope="props" v-if="props.row.licenseName">
        <a href="#" @click.prevent="onLicenseClicked(props.row)" class="text-nowrap">
          <span>{{ props.row.licenseName }} </span>
        </a>
        <i class="mdi mdi-18px mdi-check fix-alignment text-success" v-if="isAccepted(props.row)" />
        <i class="mdi mdi-18px mdi-new-box fix-alignment text-danger" v-else />
      </div>
      <i slot="datasetState" slot-scope="props" :class="`mdi mdi-18px ${datasetStates[props.row.datasetState].icon}`" v-b-tooltip.hover :title="datasetStates[props.row.datasetState].text()" />
      <i slot="isExternal" slot-scope="props" :class="`mdi mdi-18px ${getInternalExternalClass(props.row)}`" v-if="props.row.isExternal !== undefined" v-b-tooltip.hover :title="props.row.isExternal ? $t('datasetExternal') : $t('datasetInternal')" />

      <a href="#" class="text-decoration-none" slot="collaborators" slot-scope="props" v-if="props.row.collaborators !== 0" @click.prevent="showCollaborators(props.row)">
        <i class="mdi mdi-18px mdi-account-multiple" v-b-tooltip.hover :title="$t('tableTooltipDatasetCollaborators')" />
      </a>
      <a href="#" class="text-decoration-none" slot="attributes" slot-scope="props" v-if="(props.row.attributes !== 0 || props.row.dublinCore) && (!props.row.licenseName || isAccepted(props.row))" @click.prevent="showAttributes(props.row)">
        <i class="mdi mdi-18px mdi-file-plus" v-b-tooltip.hover :title="$t('tableTooltipDatasetAttributes')" />
      </a>
      <a href="#" class="text-decoration-none" slot="download" slot-scope="props" v-if="!props.row.isExternal && (props.row.experimentType !== 'climate') && (!props.row.licenseName || isAccepted(props.row))" @click.prevent="downloadDataset(props.row)">
        <i class="mdi mdi-18px mdi-download" v-b-tooltip.hover :title="$t('tableTooltipDatasetDownload')" />
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
import defaultProps from '@/const/table-props.js'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  name: 'DatasetTable',
  props: {
    ...defaultProps.FULL,
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
        name: 'datatype',
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
      }, {
        name: 'download',
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
        idColumn: 'datasetId',
        tableName: 'datasets',
        sortable: ['datasetId', 'datasetName', 'datasetDescription', 'experimentName', 'experimentType', 'datatype', 'location', 'countryName', 'licenseName', 'contact', 'startDate', 'endDate', 'dataObjectCount', 'dataPointCount', 'isExternal'],
        filterable: [],
        headings: {
          datasetId: () => this.$t('tableColumnDatasetId'),
          datasetName: () => this.$t('tableColumnDatasetName'),
          datasetDescription: () => this.$t('tableColumnDatasetDescription'),
          experimentName: () => this.$t('tableColumnExperimentName'),
          experimentType: () => this.$t('tableColumnDatasetExperimentType'),
          datatype: () => this.$t('tableColumnDatasetDataType'),
          location: () => this.$t('tableColumnDatasetLocation'),
          countryName: () => this.$t('tableColumnDatasetCountryName'),
          licenseName: () => this.$t('tableColumnDatasetLicenseName'),
          contact: () => this.$t('tableColumnDatasetContact'),
          startDate: () => this.$t('tableColumnDatasetStartDate'),
          endDate: () => this.$t('tableColumnDatasetEndDate'),
          dataObjectCount: () => this.$t('tableColumnDatasetObjectCount'),
          dataPointCount: () => this.$t('tableColumnDatasetPointCount'),
          datasetState: '',
          collaborators: '',
          attributes: '',
          download: '',
          isExternal: () => this.$t('tableColumnDatasetExternal'),
          selected: ''
        },
        orderBy: {
          column: 'datasetId'
        },
        columnsClasses: {
          selected: 'bg-info',
          dataObjectCount: 'text-right',
          dataPointCount: 'text-right',
          datasetState: 'px-1',
          collaborators: 'px-1',
          download: 'px-1',
          isExternal: 'px-1'
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
    downloadDataset: function (dataset) {
      switch (dataset.experimentType) {
        case 'trials':
          var trialQuery = {
            xGroupIds: null,
            xIds: null,
            yGroupIds: null,
            yIds: null,
            currentTraitCount: null,
            datasetIds: [dataset.datasetId]
          }
          EventBus.$emit('show-loading', true)
          this.apiPostDatasetExport('trial', trialQuery, result => {
            var trialRequest = {
              blob: result,
              filename: 'trial-dataset-' + dataset.datasetId,
              extension: 'txt'
            }

            this.downloadBlob(trialRequest)
            EventBus.$emit('show-loading', false)
          })
          break
        case 'compound':
          var compoundQuery = {
            xGroupIds: null,
            xIds: null,
            yGroupIds: null,
            yIds: null,
            currentCompoundCount: null,
            datasetIds: [dataset.datasetId]
          }
          EventBus.$emit('show-loading', true)
          this.apiPostDatasetExport('compound', compoundQuery, result => {
            var compoundRequest = {
              blob: result,
              filename: 'compound-dataset-' + dataset.datasetId,
              extension: 'txt'
            }

            this.downloadBlob(compoundRequest)
            EventBus.$emit('show-loading', false)
          })
          break
        case 'genotype':
          this.$bvModal.msgBoxConfirm(this.$t('pageGenotypesExportEnableFlapjackTitle'), {
            okVariant: 'success',
            okTitle: this.$t('genericYes'),
            cancelTitle: this.$t('genericNo'),
            cancelVariant: 'danger'
          })
            .then(value => {
              if (value !== null) {
                var genotypeQuery = {
                  datasetIds: [dataset.datasetId],
                  generateFlapjackProject: value
                }
                EventBus.$emit('show-loading', true)
                this.apiPostGenotypeDatasetExport(genotypeQuery, result => {
                  this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', result.uuid)

                  EventBus.$emit('toggle-aside')

                  EventBus.$emit('show-loading', false)
                })
              }
            })
          break
        case 'allelefreq':
          this.apiGetDatasetSourceFile(dataset.datasetId, result => {
            this.downloadBlob({
              filename: `allelefreq-${dataset.datasetId}`,
              extension: 'txt',
              blob: result
            })
          })

          break
        default:
          // TODO: Notification
          break
      }
    },
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
    refresh: function () {
      this.$refs.datasetTable.refresh()
    },
    onLicenseAccepted: function () {
      this.$refs.licenseModal.hide()
      // Pass it on to the parent in case it wants to know
      this.$emit('license-accepted')
      this.refresh()
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
