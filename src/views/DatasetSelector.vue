<template>
  <div>
    <div v-if="datasetType">
      <h1>{{ datasetTypes[datasetType].text() }}</h1>
      <!-- Table showing all datasets of the type -->
      <DatasetTable :getData="getData" :getIds="getIds" :filterOn="filterOn" :selectable="true" :selectionMode="selectionMode" class="mb-3" ref="datasetTable" v-on:selection-changed="updateButtonState"/>
      <!-- Continue button -->
      <b-button variant="primary" @click="checkLicenses" :disabled="buttonDisabled" ><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> {{ $t('buttonNext') }}</b-button>
    </div>
    <div v-else>
      <h1>{{ $t('pageDatasetSelectorInvalidTypeTitle') }}</h1>
      <p>{{ $t('pageDatasetSelectorInvalidTypeText') }}</p>
      <ul>
        <li v-for="(datasetType, name) in getDatasetTypes()" :key="`experiment-type-${name}`">
          <router-link :to="{ name: 'export', params: { datasetType: name } }">{{ datasetType.text() }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import datasetApi from '@/mixins/api/dataset.js'
import typesMixin from '@/mixins/types.js'

export default {
  data: function () {
    return {
      filterOn: null,
      datasetType: null,
      buttonDisabled: true
    }
  },
  components: {
    DatasetTable
  },
  computed: {
    selectionMode: function () {
      // Only single selection for allele frequency data
      return this.datasetType === 'allelefreq' ? 'single' : 'multi'
    }
  },
  mixins: [ datasetApi, typesMixin ],
  methods: {
    updateButtonState: function (selectedIds) {
      this.buttonDisabled = !selectedIds || selectedIds.length < 1
    },
    checkLicenses: function () {
      const selectedIds = this.$refs.datasetTable.getSelected()

      if (!selectedIds || selectedIds.length < 1) {
        this.$bvToast.toast(this.$t('toastSelectDatasetText'), {
          title: this.$t('toastSelectDatasetTitle'),
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true
        })
        return
      }

      const query = {
        page: 1,
        prevCount: -1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'datasetId',
          comparator: 'inSet',
          operator: 'and',
          values: selectedIds
        }, {
          column: 'localeName',
          comparator: 'equals',
          operator: 'and',
          values: [this.locale]
        }]
      }
      this.apiPostLicenseTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          const toAccept = result.data.filter(l => {
            let result = true

            if (l.acceptedBy !== undefined && l.acceptedBy !== null && l.acceptedBy.length > 0) {
              if (this.token && l.acceptedBy.indexOf(this.token.id) !== -1) {
                result = false
              } else if (!this.token && l.acceptedBy.indexOf(-1000) !== -1) {
                result = false
              }
            }

            return result
          })

          if (toAccept.length > 0) {
            this.$bvToast.toast(this.$t('toastTextAcceptLicense'), {
              title: this.$t('toastTitleAcceptLicense'),
              variant: 'danger',
              autoHideDelay: 10000,
              appendToast: true
            })
          } else {
            // Navigate to the export page
            this.navigateToExportPage(selectedIds)
          }
        } else {
          // Navigate to the export page
          this.navigateToExportPage(selectedIds)
        }
      })
    },
    navigateToExportPage: function (selectedIds) {
      switch (this.datasetType) {
        case 'trials':
          this.$router.push({ name: 'export-trials', params: { datasetIds: selectedIds.join(',') } })
          break
        case 'genotype':
          this.$router.push({ name: 'export-genotypes', params: { datasetIds: selectedIds.join(',') } })
          break
        case 'allelefreq':
          this.$router.push({ name: 'export-allelefrequency', params: { datasetIds: selectedIds.join(',') } })
          break
        case 'compound':
          this.$router.push({ name: 'export-compounds', params: { datasetIds: selectedIds.join(',') } })
          break
        case 'climate':
          this.$router.push({ name: 'export-climate', params: { datasetIds: selectedIds.join(',') } })
          break
      }
    },
    getDatasetTypes: function () {
      let result = Object.assign({}, this.datasetTypes)
      delete result.unknown
      return result
    },
    getData: function (data, callback) {
      this.adjustData(data)
      return this.apiPostDatasetTable(data, callback)
    },
    getIds: function (data, callback) {
      this.adjustData(data)
      return this.apiPostDatasetTableIds(data, callback)
    },
    adjustData: function (data) {
      // Always filter for just the current dataset type
      const additional = [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: [this.datasetType]
      }, {
        column: 'isExternal',
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }]

      if (!data.filter) {
        data.filter = additional
      } else {
        data.filter = additional.concat(data.filter)
      }
    }
  },
  created: function () {
    if (this.tableFiltering && this.tableFiltering.length > 0) {
      this.filterOn = this.tableFiltering
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', null)
    }

    const datasetType = this.$route.params.datasetType

    if (this.datasetTypes[datasetType]) {
      this.datasetType = datasetType
    }
  }
}
</script>

<style>

</style>
