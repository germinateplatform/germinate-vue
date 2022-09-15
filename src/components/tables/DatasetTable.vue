<template>
  <div>
    <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              primary-key="datasetId"
              class="dataset-table"
              ref="datasetTable"
              v-on="$listeners">
      <!-- HEAD: Database object count -->
      <template v-slot:head(dataObjectCount)="data">
        <span>{{ data.label }} </span> <span class="text-muted" v-b-tooltip.hover.bottom :title="$t('tableColumnTooltipDatasetDataObjects')"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>
      <!-- HEAD: Data point count -->
      <template v-slot:head(dataPointCount)="data">
        <span>{{ data.label }} </span> <span class="text-muted" v-b-tooltip.hover.bottom :title="$t('tableColumnTooltipDatasetDataPoints')"><MdiIcon :path="mdiHelpCircle" /></span>
      </template>

      <!-- Dataset id -->
      <template v-slot:cell(datasetId)="data">
        <!-- If clickHandler is provided, just let it handle clicks -->
        <a href="#" @click.prevent="clickHandler(data.item)" v-if="clickHandler && (typeof clickHandler === 'function')">{{ data.item.datasetId }}</a>
        <!-- Else, if we can link to the target page, let's do so -->
        <router-link :to="{ name: datasetTypes[data.item.datasetType].pageName, params: { datasetIds: data.item.datasetId.toString() } }" v-else-if="!data.item.isExternal && isPageAvailable(data.item.datasetType) && (!data.item.licenseName || isAccepted(data.item)) && datasetTypes[data.item.datasetType].pageName">{{ data.item.datasetId }}</router-link>
        <!-- If neither is true, just show the id -->
        <span v-else>{{ data.item.datasetId }}</span>
      </template>
      <!-- Dataset name -->
      <template v-slot:cell(datasetName)="data">
        <!-- If clickHandler is provided, just let it handle clicks -->
        <a href="#" @click.prevent="clickHandler(data.item)" v-if="clickHandler && (typeof clickHandler === 'function')" :title="data.item.datasetName">{{ truncateAfterWords(data.item.datasetName, 10) }}</a>
        <!-- Else, if there's a hyperlink for an external dataset, show that -->
        <span v-else-if="data.item.hyperlink && data.item.isExternal"><a target="_blank" rel="noopener noreferrer" :href="data.item.hyperlink" :title="data.item.datasetName">{{ truncateAfterWords(data.item.datasetName, 10) }} </a>
        <MdiIcon :path="mdiOpenInNew" />
        </span>
        <!-- Else, if we can link to the target page, let's do so -->
        <router-link :to="{ name: datasetTypes[data.item.datasetType].pageName, params: { datasetIds: data.item.datasetId.toString() } }" v-else-if="!data.item.isExternal && isPageAvailable(data.item.datasetType) && (!data.item.licenseName || isAccepted(data.item)) && datasetTypes[data.item.datasetType].pageName" :title="data.item.datasetName">{{ truncateAfterWords(data.item.datasetName, 10) }}</router-link>
        <!-- If none are true, just show the name -->
        <span v-else :title="data.item.datasetName">{{ truncateAfterWords(data.item.datasetName, 10) }}</span>
      </template>
      <!-- Dataset description -->
      <template v-slot:cell(datasetDescription)="data">
        <span :title="data.item.datasetDescription" v-if="data.item.datasetDescription">{{ truncateAfterWords(data.item.datasetDescription, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullDatasetDescription(data.item.datasetDescription)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfter(data.item.datasetDescription, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" />
        </a>
      </template>
      <!-- Experiment name -->
      <template v-slot:cell(experimentName)="data">
        <span :title="data.item.experimentName" v-if="data.item.experimentName">{{ truncateAfterWords(data.item.experimentName, 10) }}</span>
        <!-- Append a link that takes the user to the experiment details page -->
        <router-link :to="{ name: 'experiment-details', params: { experimentId: data.item.experimentId.toString() } }" class="table-icon-link" v-b-tooltip.hover :title="$t('tableTooltipExperimentDetailsLink')">
          &nbsp;<MdiIcon :path="mdiInformationOutline" />
        </router-link>
      </template>
      <!-- Dataset location country flag -->
      <template v-slot:cell(countries)="data">
        <span v-for="country in getCountries(data.item.locations)" :key="`country-flag-${country}`" class="table-country text-nowrap mr-2" v-b-tooltip.hover :title="getCountryName(country)"><i :class="'fi fi-' + country.toLowerCase()" v-if="country"/> <span> {{ country }}</span></span>
      </template>
      <!-- Display the number of locations associated with this dataset -->
      <template v-slot:cell(locations)="data">
        <template v-if="data.item.locations !== undefined && data.item.locations !== null && data.item.locations.length > 0">
          <template v-if="data.item.locations[0].locationLatitude && data.item.locations[0].locationLongitude">
            <a href="#" class="text-decoration-none text-nowrap" @click.prevent="data.toggleDetails()" v-b-tooltip.hover :title="$t('tableTooltipDatasetLocations')">
              <MdiIcon :path="mdiMapMarker" />
              <span>{{ data.item.locations.length }}</span>
            </a>
          </template>
          <div v-else>
            <MdiIcon :path="mdiMapMarker" />
            <span>{{ data.item.locations.length }}</span>
          </div>
        </template>
      </template>
      <!-- Dataset type icon -->
      <template v-slot:cell(datasetType)="data">
        <b-badge class="w-100" :style="`color: ${getHighContrastTextColor(datasetTypes[data.item.datasetType].color())}; background-color: ${datasetTypes[data.item.datasetType].color()};`"><MdiIcon :path="datasetTypes[data.item.datasetType].path" /> {{ datasetTypes[data.item.datasetType].text() }}</b-badge>
      </template>
      <!-- Data point count -->
      <template v-slot:cell(dataPointCount)="data">
        <span v-if="data.item.dataPointCount !== undefined && data.item.dataPointCount.value">{{ getDataPointCount(data.item) }}</span>
      </template>
      <!-- Dataset license -->
      <template v-slot:cell(licenseName)="data">
        <div v-if="data.item.licenseName">
          <!-- Show the license modal -->
          <a href="#" @click.prevent="onLicenseClicked(data.item)" class="text-nowrap">
            <span>{{ data.item.licenseName }} </span>
          </a>
          <!-- Show the status -->
          <span class="text-success" v-if="isAccepted(data.item)"><MdiIcon :path="mdiCheck" /></span>
          <span class="text-danger" v-else><MdiIcon :path="mdiNewBox" /></span>
        </div>
      </template>
      <!-- Dataset state -->
      <template v-slot:cell(datasetState)="data">
        <span v-b-tooltip.hover :title="datasetStates[data.item.datasetState].text()"><MdiIcon :path="datasetStates[data.item.datasetState].path" /></span>
      </template>
      <!-- External dataset? -->
      <template v-slot:cell(isExternal)="data">
        <span v-if="data.item.isExternal !== undefined" v-b-tooltip.hover :title="data.item.isExternal ? $t('datasetExternal') : $t('datasetInternal')"><MdiIcon :path="data.item.isExternal ? mdiLinkBoxVariantOutline : mdiTextBoxOutline" /></span>
      </template>
      <!-- Show publications -->
      <template v-slot:cell(publications)="data">
        <a href="#" class="text-decoration-none" v-if="data.item.publications !== 0 || (storeToken && userIsAtLeast(storeToken.userType, 'Data Curator'))" @click.prevent="showPublications(data.item)">
          <span v-b-tooltip.hover :title="$t('tableTooltipDatasetPublications')"><MdiIcon :path="mdiTextBoxCheckOutline"/></span>
        </a>
      </template>
      <!-- Show collaborators -->
      <template v-slot:cell(collaborators)="data">
        <a href="#" class="text-decoration-none" v-if="data.item.collaborators !== 0" @click.prevent="showCollaborators(data.item)">
          <span v-b-tooltip.hover :title="$t('tableTooltipDatasetCollaborators')"><MdiIcon :path="mdiAccountMultiple"/></span>
        </a>
      </template>
      <!-- Show attributes -->
      <template v-slot:cell(attributes)="data">
        <a href="#" class="text-decoration-none" v-if="(data.item.attributes !== 0 || data.item.dublinCore) && (!data.item.licenseName || isAccepted(data.item))" @click.prevent="showAttributes(data.item)">
          <span v-b-tooltip.hover :title="$t('tableTooltipDatasetAttributes')"><MdiIcon :path="mdiFilePlus"/></span>
        </a>
      </template>
      <!-- Show file resources -->
      <template v-slot:cell(fileresourceIds)="data">
        <b-button class="text-nowrap" @click="showFileresources(data.item)" v-if="data.item.fileresourceIds && data.item.fileresourceIds.length > 0"><MdiIcon :path="mdiAttachment"/> {{ $t('buttonShow') }}</b-button>
      </template>
      <!-- Download the dataset -->
      <template v-slot:cell(download)="data">
        <a href="#" class="text-decoration-none" v-if="!data.item.isExternal && (!data.item.licenseName || isAccepted(data.item))" @click.prevent="downloadDataset(data.item)">
          <span v-b-tooltip.hover :title="$t('tableTooltipDatasetDownload')"><MdiIcon :path="mdiDownload"/></span>
        </a>
      </template>
      <!-- Edit dataset -->
      <template v-slot:cell(edit)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onDatasetEditClicked(data.item)" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')">
          <span v-b-tooltip.hover :title="$t('tableTooltipDatasetEdit')"><MdiIcon :path="mdiSquareEditOutline"/></span>
        </a>
      </template>

      <!-- Row details is where the dataset locations are shown on a map -->
      <template v-slot:row-details="data">
        <LocationMap :locations="data.item.locations" v-if="data.item.locations && data.item.locations.length > 0" :showLinks="false"/>
      </template>
    </BaseTable>

    <!-- License modal -->
    <LicenseModal :license="license" :dataset="dataset" :isAccepted="dataset.acceptedBy && dataset.acceptedBy.length > 0" ref="licenseModal" v-if="dataset" />
    <!-- Collaborators modal -->
    <PublicationsModal referenceType="dataset" :referencingId="dataset.datasetId" v-if="dataset && (dataset.publications !== 0 || (storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')))" ref="publicationsModal" />
    <!-- Collaborators modal -->
    <CollaboratorModal :dataset="dataset" v-if="dataset && dataset.collaborators !== 0" ref="collaboratorModal" />
    <!-- Attribute modal -->
    <AttributeModal :dataset="dataset" v-if="dataset && (dataset.dublinCore !== undefined || dataset.attributes !== 0)" ref="attributeModal" />
    <!-- Genotype export modal for direct downloads from the table -->
    <GenotypeExportModal v-if="dataset && dataset.datasetType === 'genotype'" ref="genotypeExportModal" @formats-selected="downloadGenotypicDataset" />
    <!-- Dataset state modal -->
    <DatasetEditModal :dataset="dataset" v-if="dataset && storeToken && userIsAtLeast(storeToken.userType, 'Administrator')" @changed="refresh" ref="datasetEditModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import LicenseModal from '@/components/modals/LicenseModal'
import CollaboratorModal from '@/components/modals/CollaboratorModal'
import GenotypeExportModal from '@/components/modals/GenotypeExportModal'
import DatasetEditModal from '@/components/modals/DatasetEditModal'
import PublicationsModal from '@/components/modals/PublicationsModal'
import LocationMap from '@/components/map/LocationMap'
import AttributeModal from '@/components/modals/AttributeModal'
import defaultProps from '@/const/table-props'
import { apiPostDatasetExport, apiGetDatasetSourceFile, apiPostLicenseTable } from '@/mixins/api/dataset'
import { apiPostGenotypeDatasetExport } from '@/mixins/api/genotype'
import { apiPostPedigreeDatasetExport } from '@/mixins/api/germplasm'
import { datasetStates, datasetTypes } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'
import { isPageAvailable, downloadBlob } from '@/mixins/util'
import { userIsAtLeast } from '@/mixins/api/auth'
import { getDateTimeString, isTruncatedAfter, truncateAfterWords, getNumberWithSuffix } from '@/mixins/formatting'

import { mdiHelpCircle, mdiOpenInNew, mdiPageNext, mdiInformationOutline, mdiAttachment, mdiMapMarker, mdiCheck, mdiNewBox, mdiTextBoxCheckOutline, mdiAccountMultiple, mdiFilePlus, mdiDownload, mdiSquareEditOutline, mdiLinkBoxVariantOutline, mdiTextBoxOutline } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

const countries = require('i18n-iso-countries')
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
      datasetStates,
      datasetTypes,
      mdiHelpCircle,
      mdiOpenInNew,
      mdiPageNext,
      mdiInformationOutline,
      mdiMapMarker,
      mdiCheck,
      mdiNewBox,
      mdiTextBoxCheckOutline,
      mdiAccountMultiple,
      mdiFilePlus,
      mdiDownload,
      mdiSquareEditOutline,
      mdiAttachment,
      mdiLinkBoxVariantOutline,
      mdiTextBoxOutline,
      options: {
        idColumn: 'datasetId',
        tableName: 'datasets',
        rowVariant: this.getRowVariant
      },
      dataset: null,
      license: null,
      previousDetailsRow: null
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeToken'
    ]),
    columns: function () {
      const result = [
        {
          key: 'datasetId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnDatasetId')
        }, {
          key: 'datasetName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetName'),
          preferedSortingColumn: true
        }, {
          key: 'datasetDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetDescription')
        }, {
          key: 'experimentId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnExperimentId')
        }, {
          key: 'experimentName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnExperimentName')
        }, {
          key: 'datasetType',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetDatasetType')
        }, {
          key: 'datatype',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetDataType')
        }, {
          key: 'licenseName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetLicenseName')
        }, {
          key: 'contact',
          type: String,
          sortable: true,
          label: this.$t('tableColumnDatasetContact')
        }, {
          key: 'countries',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnDatasetCountryName')
        }, {
          key: 'locations',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnDatasetLocations')
        }, {
          key: 'startDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnDatasetStartDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'endDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnDatasetEndDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'dataObjectCount',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnDatasetObjectCount'),
          formatter: value => value ? getNumberWithSuffix(value.value, 2) : null
        }, {
          key: 'dataPointCount',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnDatasetPointCount')
        }, {
          key: 'fileresourceIds',
          type: 'json',
          sortable: false,
          class: 'px-1',
          label: this.$t('tableColumnDatasetFileresources')
        }, {
          key: 'isExternal',
          type: Boolean,
          sortable: false,
          class: 'px-1',
          label: this.$t('tableColumnDatasetExternal')
        }, {
          key: 'datasetState',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        }, {
          key: 'publications',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        }, {
          key: 'collaborators',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        }, {
          key: 'attributes',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        }, {
          key: 'download',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        }
      ]

      if (this.storeToken && userIsAtLeast(this.storeToken.userType, 'Data Curator')) {
        result.push({
          key: 'edit',
          type: undefined,
          sortable: false,
          label: ''
        })
      }

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
    MdiIcon,
    AttributeModal,
    BaseTable,
    CollaboratorModal,
    DatasetEditModal,
    GenotypeExportModal,
    LocationMap,
    LicenseModal,
    PublicationsModal
  },
  methods: {
    userIsAtLeast,
    isTruncatedAfter,
    truncateAfterWords,
    getHighContrastTextColor,
    isPageAvailable,
    showFullDatasetDescription: function (description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t('tableColumnDatasetDescription'),
        okTitle: this.$t('genericOk')
      })
    },
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
      if (this.storeToken) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.storeToken.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
    getDataPointCount: function (dataset) {
      let result = ''
      if (dataset.datasetType === 'genotype' || dataset.datasetType === 'allelefreq') {
        result = '≤'
      }
      result += getNumberWithSuffix(dataset.dataPointCount.value, 2)
      return result
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
        case 'pedigree':
          this.downloadPedigreeDataset(dataset)
          break
        case 'allelefreq':
          // For allelefreq data, just request the underlying data file
          apiGetDatasetSourceFile(dataset.datasetId, result => {
            downloadBlob({
              filename: `allelefreq-${dataset.datasetId}-${getDateTimeString()}`,
              extension: 'txt',
              blob: result
            })
          })
          break
        case 'genotype':
          // For genotypic data, ask for the additional data types to download.
          this.dataset = dataset
          this.$nextTick(() => this.$refs.genotypeExportModal.show())
          break
      }
    },
    downloadPedigreeDataset: function (dataset) {
      const query = {
        datasetIds: [dataset.datasetId],
        includeAttributes: true
      }
      emitter.emit('show-loading', true)
      this.$gtag.event('export', 'async', 'pedigree', query.datasetIds.join('-'))
      apiPostPedigreeDatasetExport(query, result => {
        result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))

        // Show the sidebar
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      })
    },
    downloadGenotypicDataset: function (selectedFormats) {
      // Then export
      const genotypeQuery = {
        datasetIds: [this.dataset.datasetId],
        generateFlapjackProject: selectedFormats.indexOf('flapjack') !== -1,
        generateHapMap: selectedFormats.indexOf('hapmap') !== -1,
        generateFlatFile: selectedFormats.indexOf('flat') !== -1
      }
      emitter.emit('show-loading', true)
      this.$gtag.event('export', 'async', 'genotype', genotypeQuery.datasetIds.join('-'))
      apiPostGenotypeDatasetExport(genotypeQuery, result => {
        result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))

        // Show the sidebar
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      })
      this.dataset = null
    },
    initDownload: function (dataset, type) {
      // Request data export for all columns and rows for this current dataset
      const query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        currentTraitCount: null,
        datasetIds: [dataset.datasetId]
      }
      emitter.emit('show-loading', true)
      apiPostDatasetExport(type, query, result => {
        const request = {
          blob: result,
          filename: `${type}-dataset-${dataset.datasetId}-${getDateTimeString()}`,
          extension: 'txt'
        }

        downloadBlob(request)
        emitter.emit('show-loading', false)
      })
    },
    showCollaborators: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.collaboratorModal.show())
    },
    showPublications: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.publicationsModal.show())
    },
    showAttributes: function (dataset) {
      this.dataset = dataset
      this.$nextTick(() => this.$refs.attributeModal.show())
    },
    showFileresources: function (dataset) {
      const filter = [{
        column: 'datasetIds',
        comparator: 'contains',
        operator: 'and',
        values: [dataset.datasetId]
      }]
      this.$router.push({
        name: 'data-resources',
        query: {
          'fileresources-filter': JSON.stringify(filter)
        }
      })
    },
    getSelected: function () {
      return this.$refs.datasetTable.getSelected()
    },
    setSelectedItems: function (toSelect) {
      this.$refs.datasetTable.setSelectedItems(toSelect)
    },
    refresh: function () {
      this.$refs.datasetTable.refresh()
    },
    onLicenseAccepted: function () {
      // this.$refs.licenseModal.hide()
      this.refresh()
    },
    onDatasetEditClicked: function (dataset) {
      this.dataset = dataset

      this.$nextTick(() => this.$refs.datasetEditModal.show())
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
            values: [this.storeLocale]
          }]
        }
        apiPostLicenseTable(query, result => {
          if (result && result.data && result.data.length > 0) {
            this.license = result.data[0]
            this.$refs.licenseModal.show()
          }
        })
      }
    }
  },
  mounted: function () {
    emitter.on('license-accepted', this.onLicenseAccepted)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.onLicenseAccepted)
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
