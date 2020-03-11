<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              class="dataset-table"
              ref="datasetTable"
              v-on="$listeners">
      <template v-slot:head(dataObjectCount)="data">
        <span>{{ data.label }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.hover.bottom :title="$t('tableColumnTooltipDatasetDataObjects')"/>
      </template>
      <template v-slot:head(dataPointCount)="data">
        <span>{{ data.label }} </span> <i class="mdi mdi-help-circle text-muted" v-b-tooltip.hover.bottom :title="$t('tableColumnTooltipDatasetDataPoints')"/>
      </template>

      <template v-slot:cell(datasetId)="data">
        <a href="#" @click.prevent="clickHandler(data.item)" v-if="clickHandler && (typeof clickHandler === 'function')">{{ data.item.datasetId }}</a>
        <router-link :to="{ name: datasetTypes[data.item.datasetType].pageName, params: { datasetIds: data.item.datasetId.toString() } }" v-else-if="!data.item.isExternal && isPageAvailable(data.item.datasetType) && (!data.item.licenseName || isAccepted(data.item))">{{ data.item.datasetId }}</router-link>
        <span v-else>{{ data.item.datasetId }}</span>
      </template>
      <template v-slot:cell(datasetName)="data">
        <a href="#" @click.prevent="clickHandler(data.item)" v-if="clickHandler && (typeof clickHandler === 'function')">{{ data.item.datasetName }}</a>
        <span v-else-if="data.item.hyperlink && data.item.isExternal"><a target="_blank" :href="data.item.hyperlink">{{ data.item.datasetName }} </a><i class="mdi mdi-open-in-new" /></span>
        <router-link :to="{ name: datasetTypes[data.item.datasetType].pageName, params: { datasetIds: data.item.datasetId.toString() } }" v-else-if="!data.item.isExternal && isPageAvailable(data.item.datasetType) && (!data.item.licenseName || isAccepted(data.item))">{{ data.item.datasetName }}</router-link>
        <span v-else>{{ data.item.datasetName }}</span>
      </template>
      <template v-slot:cell(experimentName)="data">
        {{ data.item.experimentName }}
        <router-link :to="{ name: 'experiment-details', params: { experimentId: data.item.experimentId.toString() } }" class="table-icon-link" v-b-tooltip.hover :title="$t('tableTooltipExperimentDetailsLink')">
          <i class="mdi mdi-18px fix-alignment mdi-information-outline" />
        </router-link>
      </template>

      <!-- Country flags -->
      <template v-slot:cell(countries)="data">
        <span v-for="country in getCountries(data.item.locations)" :key="`country-flag-${country}`" class="table-country text-nowrap" v-b-tooltip.hover :title="getCountryName(country)"><i :class="'flag-icon flag-icon-' + country.toLowerCase()" v-if="country"/> <span> {{ country }}</span></span>
      </template>
      <template v-slot:cell(locations)="data">
        <a href="#" class="text-decoration-none text-nowrap" v-if="data.item.locations && data.item.locations.length > 0" @click.prevent="showLocations(data)">
          <i class="mdi mdi-18px mdi-map-marker align-middle" v-b-tooltip.hover :title="$t('tableTooltipDatasetLocations')" />
          <span>{{ data.item.locations.length }}</span>
        </a>
      </template>

      <template v-slot:cell(datasetType)="data">
        <span><i :class="`mdi mdi-18px ${datasetTypes[data.item.datasetType].icon} fix-alignment`" :style="`color: ${datasetTypes[data.item.datasetType].color()};`" /> {{ datasetTypes[data.item.datasetType].text() }}</span>
      </template>
      <template v-slot:cell(dataPointCount)="data">
        <span v-if="data.item.dataPointCount !== undefined && data.item.dataPointCount.value">{{ getDataPointCount(data.item) }}</span>
      </template>

      <template v-slot:cell(licenseName)="data">
        <div v-if="data.item.licenseName">
          <a href="#" @click.prevent="onLicenseClicked(data.item)" class="text-nowrap">
            <span>{{ data.item.licenseName }} </span>
          </a>
          <i class="mdi mdi-18px mdi-check fix-alignment text-success" v-if="isAccepted(data.item)" />
          <i class="mdi mdi-18px mdi-new-box fix-alignment text-danger" v-else />
        </div>
      </template>
      <template v-slot:cell(datasetState)="data">
        <i :class="`mdi mdi-18px ${datasetStates[data.item.datasetState].icon}`" v-b-tooltip.hover :title="datasetStates[data.item.datasetState].text()" />
      </template>
      <template v-slot:cell(isExternal)="data">
        <i :class="`mdi mdi-18px ${getInternalExternalClass(data.item)}`" v-if="data.item.isExternal !== undefined" v-b-tooltip.hover :title="data.item.isExternal ? $t('datasetExternal') : $t('datasetInternal')" />
      </template>

      <template v-slot:cell(collaborators)="data">
        <a href="#" class="text-decoration-none" v-if="data.item.collaborators !== 0" @click.prevent="showCollaborators(data.item)">
          <i class="mdi mdi-18px mdi-account-multiple" v-b-tooltip.hover :title="$t('tableTooltipDatasetCollaborators')" />
        </a>
      </template>
      <template v-slot:cell(attributes)="data">
        <a href="#" class="text-decoration-none" v-if="(data.item.attributes !== 0 || data.item.dublinCore) && (!data.item.licenseName || isAccepted(data.item))" @click.prevent="showAttributes(data.item)">
          <i class="mdi mdi-18px mdi-file-plus" v-b-tooltip.hover :title="$t('tableTooltipDatasetAttributes')" />
        </a>
      </template>
      <template v-slot:cell(download)="data">
        <a href="#" class="text-decoration-none" v-if="!data.item.isExternal && (!data.item.licenseName || isAccepted(data.item))" @click.prevent="downloadDataset(data.item)">
          <i class="mdi mdi-18px mdi-download" v-b-tooltip.hover :title="$t('tableTooltipDatasetDownload')" />
        </a>
      </template>

      <template v-slot:row-details="data">
        <LocationMap :locations="locations" v-if="dataset && dataset.datasetId === data.item.datasetId && locations && locations.length > 0" :showLinks="false"/>
      </template>

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
import LocationMap from '@/components/map/LocationMap'
import AttributeModal from '@/components/modals/AttributeModal'
import defaultProps from '@/const/table-props.js'
import { EventBus } from '@/plugins/event-bus.js'
import { mapFilters } from '@/plugins/map-filters.js'
import datasetApi from '@/mixins/api/dataset.js'
import genotypeApi from '@/mixins/api/genotype.js'
import locationApi from '@/mixins/api/location.js'

var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  name: 'DatasetTable',
  props: {
    ...defaultProps.FULL,
    selectable: {
      type: Boolean,
      default: false
    },
    clickHandler: {
      type: Function,
      default: null
    },
    selectionMode: {
      type: String,
      default: 'multi'
    }
  },
  data: function () {
    return {
      options: {
        idColumn: 'datasetId',
        tableName: 'datasets',
        rowVariant: this.getRowVariant
      },
      dataset: null,
      locations: null,
      license: null,
      previousDetailsRow: null,
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
  computed: {
    columns: function () {
      var result = [
        {
          key: 'datasetId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'datasetId')}`,
          label: this.$t('tableColumnDatasetId')
        }, {
          key: 'datasetName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetName')}`,
          label: this.$t('tableColumnDatasetName')
        }, {
          key: 'datasetDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetDescription')}`,
          label: this.$t('tableColumnDatasetDescription')
        }, {
          key: 'experimentId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'experimentId')}`,
          label: this.$t('tableColumnExperimentId')
        }, {
          key: 'experimentName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'experimentName')}`,
          label: this.$t('tableColumnExperimentName')
        }, {
          key: 'datasetType',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datasetType')}`,
          label: this.$t('tableColumnDatasetDatasetType')
        }, {
          key: 'datatype',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'datatype')}`,
          label: this.$t('tableColumnDatasetDataType')
        }, {
          key: 'licenseName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'licenseName')}`,
          label: this.$t('tableColumnDatasetLicenseName')
        }, {
          key: 'contact',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'contact')}`,
          label: this.$t('tableColumnDatasetContact')
        }, {
          key: 'countries',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countries')}`,
          label: this.$t('tableColumnDatasetCountryName')
        }, {
          key: 'locations',
          type: 'json',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locations')}`,
          label: this.$t('tableColumnDatasetLocations')
        }, {
          key: 'startDate',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'startDate')}`,
          label: this.$t('tableColumnDatasetStartDate'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'endDate',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'endDate')}`,
          label: this.$t('tableColumnDatasetEndDate'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'dataObjectCount',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'dataObjectCount')}`,
          label: this.$t('tableColumnDatasetObjectCount'),
          formatter: value => (value && (value.value !== undefined)) ? this.$options.filters.toThousandSeparators(value.value) : null
        }, {
          key: 'dataPointCount',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'dataPointCount')}`,
          label: this.$t('tableColumnDatasetPointCount')
        }, {
          key: 'isExternal',
          type: Boolean,
          sortable: false,
          class: `px-1 ${this.isTableColumnHidden(this.options.tableName, 'isExternal')}`,
          label: this.$t('tableColumnDatasetExternal')
        }, {
          key: 'datasetState',
          type: undefined,
          sortable: false,
          class: `px-1 ${this.isTableColumnHidden(this.options.tableName, 'datasetState')}`,
          label: ''
        }, {
          key: 'collaborators',
          type: undefined,
          sortable: false,
          class: `px-1 ${this.isTableColumnHidden(this.options.tableName, 'collaborators')}`,
          label: ''
        }, {
          key: 'attributes',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'attributes')}`,
          label: ''
        }, {
          key: 'download',
          type: undefined,
          sortable: false,
          class: `px-1 ${this.isTableColumnHidden(this.options.tableName, 'download')}`,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'bg-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    AttributeModal,
    BaseTable,
    CollaboratorModal,
    LocationMap,
    LicenseModal
  },
  mixins: [ datasetApi, genotypeApi, locationApi ],
  methods: {
    ...mapFilters(['toThousandSeparators']),
    getCountries: function (locations) {
      if (locations) {
        return [...new Set(locations.map(l => l.countryName))]
      } else {
        return []
      }
    },
    getCountryName: function (code2) {
      return countries.getName(code2, 'en')
    },
    getRowVariant: function (dataset) {
      if (!dataset.licenseName) {
        return null
      } else {
        return this.isAccepted(dataset) ? null : 'danger'
      }
    },
    isAccepted: function (dataset) {
      if (this.token) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.token.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
    getDataPointCount: function (dataset) {
      var result = ''
      if (dataset.datasetType === 'genotype' || dataset.datasetType === 'allelefreq') {
        result = '≤'
      }
      result += this.toThousandSeparators(dataset.dataPointCount.value)
      return result
    },
    getInternalExternalClass: function (dataset) {
      return dataset.isExternal ? 'mdi-link-box-variant-outline' : 'mdi-file-document-box-outline'
    },
    downloadDataset: function (dataset) {
      switch (dataset.datasetType) {
        case 'trials':
          this.initDownload(dataset, 'trial')
          break
        case 'compound':
          this.initDownload(dataset, 'compound')
          break
        case 'climate':
          this.initDownload(dataset, 'climate')
          break
        case 'allelefreq':
          this.apiGetDatasetSourceFile(dataset.datasetId, result => {
            this.downloadBlob({
              filename: `allelefreq-${dataset.datasetId}-${window.moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}`,
              extension: 'txt',
              blob: result
            })
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
                this.$ga.event('export', 'async', 'genotype', genotypeQuery.datasetIds.join('-'))
                this.apiPostGenotypeDatasetExport(genotypeQuery, result => {
                  result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))

                  EventBus.$emit('toggle-aside', 'download')

                  EventBus.$emit('show-loading', false)
                })
              }
            })
          break
      }
    },
    initDownload: function (dataset, type) {
      var query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        currentTraitCount: null,
        datasetIds: [dataset.datasetId]
      }
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport(type, query, result => {
        var request = {
          blob: result,
          filename: `${type}-dataset-${dataset.datasetId}-${window.moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}`,
          extension: 'txt'
        }

        this.downloadBlob(request)
        EventBus.$emit('show-loading', false)
      })
    },
    showCollaborators: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.collaboratorModal.show())
    },
    showLocations: function (data) {
      if (this.previousDetailsRow && (this.previousDetailsRow.item.datasetId === data.item.datasetId)) {
        data.toggleDetails()
        return
      }

      const dataset = data.item
      this.dataset = dataset
      var query = {
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'locationId',
          comparator: 'inSet',
          operator: 'and',
          values: dataset.locations.map(l => l.locationId)
        }]
      }

      this.apiPostLocationTable(query, result => {
        if (result) {
          this.locations = result.data

          if (this.previousDetailsRow) {
            this.previousDetailsRow.toggleDetails()
          }

          data.toggleDetails()

          this.previousDetailsRow = data
        } else {
          this.$bvToast.toast('Request to the server timed out.', {
            title: this.$t('genericError'),
            variant: 'danger',
            autoHideDelay: 5000,
            appendToast: true
          })
        }
      })
    },
    showAttributes: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.attributeModal.show())
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

<style>
.table-icon-link:hover {
  text-decoration: none;
}
.dataset-table .b-table-details td {
  padding: 0;
}
</style>
