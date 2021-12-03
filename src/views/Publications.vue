<template>
  <div>
    <h1>{{ $t('pagePublicationsTitle') }}</h1>
    <PublicationTable :getData="getData" />

    <div v-if="publicationId" ref="publicationDetails" >
      <h2>{{ $t('pagePublicationDetailsTitle') }}</h2>

      <template v-if="publication">
        <!-- One of these three tables will be shown, depending on the type of the selected publication -->
        <GermplasmTable v-if="publication.referenceType === 'germplasm'"
                        ref="publicationmembersTable"
                        :getData="getGermplasmData"/>
        <DatasetTable v-else-if="publication.referenceType === 'dataset'"
                        ref="publicationmembersTable"
                        :getData="getDatasetData" />
      </template>
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import GermplasmTable from '@/components/tables/GermplasmTable'
import PublicationTable from '@/components/tables/PublicationTable'

import datasetApi from '@/mixins/api/dataset.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  components: {
    DatasetTable,
    GermplasmTable,
    PublicationTable
  },
  data: function () {
    return {
      publicationId: null,
      publicationType: null,
      publication: null
    }
  },
  mixins: [ datasetApi, germplasmApi, miscApi ],
  methods: {
    getGermplasmData: function (data, callback) {
      return this.apiPostPublicationGermplasmTable(this.publication.publicationId, data, callback)
    },
    getDatasetData: function (data, callback) {
      return this.apiPostPublicationDatasetTable(this.publication.publicationId, data, callback)
    },
    getData: function (data) {
      return this.apiPostPublicationsTable(data, (result) => {
        if (result && result.data && result.data.length > 0) {
          result.data.forEach(p => {
            try {
              p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache)
            } catch (err) {
              //
            }
          })
        }
      })
    },
    onPublicationSelected: function () {
      const queryParams = {
        page: 1,
        limit: 1,
        prevCount: -1,
        filter: [{
          column: 'publicationId',
          comparator: 'equals',
          operator: 'and',
          values: [this.publicationId]
        }, {
          column: 'referenceType',
          comparator: 'equals',
          operator: 'and',
          values: [this.publicationType]
        }]
      }
      this.apiPostPublicationsTable(queryParams, result => {
        if (result && result.data && result.data.length > 0) {
          // Update the URL to reflect the newly selected publication
          const publication = result.data[0]
          try {
            publication.publicationFallbackCache = JSON.parse(publication.publicationFallbackCache)
          } catch (err) {
            //
          }
          this.publication = publication

          // Scroll down to the publication details section
          this.$nextTick(() => {
            const rect = this.$refs.publicationDetails.getBoundingClientRect()

            window.scrollTo({
              left: 0,
              top: rect.top,
              behavior: 'smooth'
            })
          })
        }
      })
    }
  },
  created: function () {
    if (this.$route.params.publicationId && this.$route.params.publicationType) {
      this.publicationId = this.$route.params.publicationId
      this.publicationType = this.$route.params.publicationType

      this.onPublicationSelected()
    }
  }
}
</script>

<style>

</style>
