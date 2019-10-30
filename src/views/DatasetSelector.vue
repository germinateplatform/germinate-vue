<template>
  <div>
    <div v-if="experimentType">
      <h1>{{ experimentTypes[experimentType].text() }}</h1>
      <DatasetTable :getData="getData" :getIds="getIds" :filterOn="filterOn" :selectable="true" class="mb-3" ref="datasetTable"/>
      <b-button variant="primary" @click="checkLicenses" ><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> Continue</b-button>
    </div>
    <div v-else>
      <h1>Invalid experiment type</h1>
      <p>Are you looking for any of these?</p>
      <ul>
        <li v-for="(experimentType, name) in getExperimentTypes()" :key="`experiment-type-${name}`">
          <router-link :to="{ name: 'export', params: { experimentType: name } }">{{ experimentType.text() }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
export default {
  data: function () {
    return {
      filterOn: null,
      experimentType: null
    }
  },
  components: {
    DatasetTable
  },
  methods: {
    checkLicenses: function () {
      var selectedIds = this.$refs.datasetTable.getSelected()

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
          var toAccept = result.data.filter(l => {
            var result = true

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
          this.navigateToExportPage(selectedIds)
        }
      })
    },
    navigateToExportPage: function (selectedIds) {
      switch (this.experimentType) {
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
      }
    },
    getExperimentTypes: function () {
      var result = Object.assign({}, this.experimentTypes)
      delete result.unknown
      return result
    },
    getData: function (data, callback) {
      this.adjustData(data)
      return this.apiPostDatasetTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostDatasetTableIds(data, callback)
    },
    adjustData: function (data) {
      var additional = [{
        column: 'experimentType',
        comparator: 'equals',
        operator: 'and',
        values: [this.experimentType]
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

    var experimentType = this.$route.params.experimentType

    if (this.experimentTypes[experimentType]) {
      this.experimentType = experimentType
    }
  }
}
</script>

<style>

</style>
