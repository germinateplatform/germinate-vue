<template>
  <div>
    <div v-if="trait !== null">
      <template v-if="trait === undefined">
        <div class="text-center">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        </div>
      </template>
      <template v-else>
        <h1 class="d-flex justify-content-between">
          <span>{{ trait.traitName }} <small v-if="trait.unitName">{{ trait.unitName }}</small></span>
          <span class="text-nowrap" v-if="trait.dataType" :style="`color: ${dataTypes[trait.dataType].color()};`"><MdiIcon :path="dataTypes[trait.dataType].path" /> {{ dataTypes[trait.dataType].text() }}</span>
        </h1>
        <p v-if="trait.traitDescription">{{ trait.traitDescription }}</p>

        <template v-if="trait.traitRestrictions">
          <h2>{{ $t('pageTraitDetailsRestrictionsTitle') }}</h2>

          <h4>
            <b-badge class="mr-2" v-if="trait.traitRestrictions.min !== undefined && trait.traitRestrictions.min !== null"><MdiIcon :path="mdiGreaterThanOrEqual" />" {{ trait.traitRestrictions.min }}</b-badge>
            <b-badge class="mr-2" v-if="trait.traitRestrictions.max !== undefined && trait.traitRestrictions.max !== null"><MdiIcon :path="mdiLessThanOrEqual" />" {{ trait.traitRestrictions.max }}</b-badge>
            <b-badge class="mr-2" v-if="trait.traitRestrictions.categories"><MdiIcon :path="mdiCodeBrackets" /> {{ trait.traitRestrictions.categories.map(c => c.join(', ')).join(', ') }}</b-badge>
          </h4>
        </template>

        <b-button @click="$refs.barcodeModal.show()"><MdiIcon :path="mdiBarcode" /> {{ $t('pageTraitDetailsGenerateBarcodes') }}</b-button>

        <!-- Image gallery with representative images for this trait -->
        <ImageGallery :foreignId="trait.traitId" referenceTable="phenotypes" :downloadName="trait.traitName" />
        <hr/>

        <!-- Synonyms -->
        <template v-if="trait.synonyms">
          <h2>{{ $t('genericSynonyms') }}</h2>
          <ul>
            <li v-for="(synonym, index) in trait.synonyms" :key="`trait-synonyms-${index}`">{{ synonym }}</li>
          </ul>
        </template>

        <!-- Attributes -->
        <h2>{{ $t('pageTraitAttributesTitle') }}</h2>
        <TraitAttributeTable :filterOn="attributeFilter" :getData="getTraitAttributeData" />

        <h2>{{ $t('pageTraitDetailsDataTitle') }}</h2>
        <p>{{ $t('pageTraitDetailsDataText') }}</p>
        <!-- Table showing all data points for this trait -->
        <TrialsDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="traitDetailsTable" />

        <h2>{{ $t('pageTraitDetailsStatsTitle') }}</h2>
        <p>{{ $t('pageTraitDetailsStatsText') }}</p>
        <BarChart xColumn="phenotype_value"
                  :xTitle="trait.traitName"
                  :yTitle="$t('genericCount')"
                  :height="700"
                  :downloadName="trait.traitName"
                  :sourceFile="categoricalTraitFile"
                  v-on:bar-clicked="traitValueClicked"
                  ref="traitCategoryChart"
                  v-if="trait.dataType !== 'numeric'"/>

        <!-- Boxplot for this trait -->
        <TraitBoxplotChart :traitIds="[traitId]" ref="traitDetailsChart" v-else />

        <!-- Table showing all datasets this trait is scored in -->
        <DatasetTable :getData="getDatasetData" ref="datasetTable" />

        <div v-show="showAdditionalDatasets">
          <!-- Any additional datasets this trait is part of for which the license hasn't been accepted yet -->
          <DatasetsWithUnacceptedLicense datasetType="trials" v-on:data-changed="checkNumbers"/>
        </div>
      </template>

      <YesNoCancelModal :title="$t('modalTitleTraitBarcodeIncludeValues')"
                        :message="$t('modalTextTraitBarcodeIncludeValues')"
                        :yesTitle="$t('genericYes')"
                        :noTitle="$t('genericNo')"
                        :cancelTitle="$t('genericCancel')"
                        yesVariant="secondary"
                        noVariant="secondary"
                        cancelVariant="outline-secondary"
                        @yes="generateBarcodes(true)"
                        @no="generateBarcodes(false)"
                        ref="barcodeModal" />
    </div>
    <h3 v-else>{{ $t('headingNoData') }}</h3>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BarChart from '@/components/charts/BarChart'
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import DatasetTable from '@/components/tables/DatasetTable'
import TraitBoxplotChart from '@/components/charts/TraitBoxplotChart'
import ImageGallery from '@/components/images/ImageGallery'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import TraitAttributeTable from '@/components/tables/TraitAttributeTable'
import YesNoCancelModal from '@/components/modals/YesNoCancelModal'

import { apiPostTraitStatsCategorical } from '@/mixins/api/dataset'
import { apiPostTrialsDataTable, apiPostTrialsDataTableIds, apiPostTraitTable, apiPostTraitDatasetTable, apiGetTraitDistinctValues, apiPostTraitAttributeTable } from '@/mixins/api/trait'
import { dataTypes } from '@/mixins/types'

import { mdiGreaterThanOrEqual, mdiLessThanOrEqual, mdiCodeBrackets, mdiBarcode } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      dataTypes,
      mdiGreaterThanOrEqual,
      mdiLessThanOrEqual,
      mdiCodeBrackets,
      mdiBarcode,
      traitId: null,
      trait: undefined,
      tableFilter: null,
      showAdditionalDatasets: true,
      categoricalTraitFile: null
    }
  },
  components: {
    BarChart,
    DatasetsWithUnacceptedLicense,
    DatasetTable,
    TraitBoxplotChart,
    MdiIcon,
    ImageGallery,
    TrialsDataTable,
    TraitAttributeTable,
    YesNoCancelModal
  },
  computed: {
    attributeFilter: function () {
      return [{
        column: {
          name: 'traitId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.traitId],
        canBeChanged: false
      }]
    }
  },
  methods: {
    getTraitAttributeData: function (data, callback) {
      return apiPostTraitAttributeTable(data, callback)
    },
    generateBarcodes: function (includeValues) {
      if (includeValues) {
        apiGetTraitDistinctValues(this.traitId, result => {
          this.openInNewTab(`https://cropgeeks.github.io/humbug/#/import?barcodes=${[this.trait.traitName, ...result].map(c => encodeURIComponent(c)).join(',')}`)
        })
      } else {
        this.openInNewTab(`https://cropgeeks.github.io/humbug/#/import?barcodes=${encodeURIComponent(this.trait.traitName)}`)
      }
    },
    openInNewTab: function (url) {
      Object.assign(document.createElement('a'), {
        target: '_blank',
        href: url
      }).click()
    },
    traitValueClicked: function (value) {
      this.tableFilter = [{
        column: {
          name: 'traitId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.traitId],
        canBeChanged: false
      }, {
        column: {
          name: 'traitValue',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [value]
      }]

      this.$nextTick(() => this.$refs.traitDetailsTable.refresh())
    },
    getDatasetData: function (data, callback) {
      return apiPostTraitDatasetTable(this.traitId, data, callback)
    },
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return apiPostTrialsDataTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostTrialsDataTableIds(data, callback)
    },
    update: function () {
      this.$refs.traitDetailsTable.refresh()
      this.$refs.datasetTable.refresh()

      if (this.$refs.traitDetailsChart) {
        this.$refs.traitDetailsChart.redraw()
      } else if (this.$refs.traitCategoryChart) {
        this.updateCategoryChart()
      }

      this.checkNumbers()
    },
    updateCategoryChart: function () {
      const query = {
        datasetIds: null,
        xIds: [this.traitId]
      }

      apiPostTraitStatsCategorical(query, result => {
        this.categoricalTraitFile = result
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
          this.categoricalTraitFile = null
        }
      })
    }
  },
  mounted: function () {
    if (this.$route.params.traitId) {
      this.traitId = parseInt(this.$route.params.traitId)

      this.tableFilter = [{
        column: {
          name: 'traitId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.traitId],
        canBeChanged: false
      }]

      const request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'traitId',
          comparator: 'equals',
          operator: 'and',
          values: [this.traitId]
        }]
      }
      apiPostTraitTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.trait = result.data[0]

          if (this.trait.dataType !== 'numeric') {
            this.updateCategoryChart()
          }
        } else {
          this.trait = null
        }
      })
    }

    emitter.on('license-accepted', this.update)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.update)
  }
}
</script>

<style>

</style>
