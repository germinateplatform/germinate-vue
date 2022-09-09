<template>
  <div>
    <h1>{{ $t('pagePublicationsTitle') }}</h1>
    <PublicationTable :getData="getData"
                      @publication-selected="onPublicationSelected" />

    <div v-if="publicationId" ref="publicationDetails" >
      <h2>{{ $t('pagePublicationDetailsTitle') }}</h2>

      <template v-if="publication">
        <b-row>
          <b-col cols=12 sm=6 md=4 xl=3 class="mb-3">
            <PublicationCard :canDelete="false" :publication="publication" />
          </b-col>
        </b-row>

        <!-- One of these three tables will be shown, depending on the type of the selected publication -->
        <template v-if="publication.groupIds && publication.groupIds.length > 0">
          <h4>{{ $t('pageGroupsTitle') }}</h4>
          <GroupTable ref="publicationmembersTable"
                      :getData="getGroupData" />
        </template>
        <template v-if="publication.germplasmIds && publication.germplasmIds.length > 0">
          <h4>{{ $t('pageGermplasmTitle') }}</h4>
          <GermplasmTable ref="publicationmembersTable"
                          :getData="getGermplasmData"/>
        </template>
        <template v-if="publication.datasetIds && publication.datasetIds.length > 0">
          <h4>{{ $t('pageDatasetsTitle') }}</h4>
          <DatasetTable ref="publicationmembersTable"
                        :getData="getDatasetData" />
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GroupTable from '@/components/tables/GroupTable'
import PublicationTable from '@/components/tables/PublicationTable'
import PublicationCard from '@/components/util/PublicationCard'

import datasetApi from '@/mixins/api/dataset'
import germplasmApi from '@/mixins/api/germplasm'
import groupApi from '@/mixins/api/group'
import miscApi from '@/mixins/api/misc'

const Cite = require('citation-js')

export default {
  components: {
    DatasetTable,
    GermplasmTable,
    GroupTable,
    PublicationTable,
    PublicationCard
  },
  data: function () {
    return {
      publicationId: null,
      publicationType: null,
      publication: null,
      publicationData: null
    }
  },
  watch: {
    publication: function (newValue) {
      if (newValue) {
        try {
          const citation = new Cite(newValue.publicationFallbackCache)

          if (citation && citation.data && citation.data.length > 0) {
            this.publicationData = citation.format('data', { format: 'object' })[0]
          } else {
            this.publicationData = {
              title: 'N/A',
              fullReference: 'N/A',
              URL: newValue.publicationDoi
            }
          }
        } catch (err) {
          console.error(err)
          this.publicationData = {
            title: 'N/A',
            fullReference: 'N/A',
            URL: newValue.publicationDoi
          }
        }
      } else {
        this.publicationData = null
      }
    }
  },
  mixins: [datasetApi, germplasmApi, groupApi, miscApi],
  methods: {
    getGermplasmData: function (data, callback) {
      return this.apiPostPublicationGermplasmTable(this.publication.publicationId, data, callback)
    },
    getGroupData: function (data, callback) {
      return this.apiPostPublicationGroupTable(this.publication.publicationId, data, callback)
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
    onPublicationSelected: function (config) {
      const queryParams = {
        page: 1,
        limit: 1,
        prevCount: -1,
        filter: [{
          column: 'publicationId',
          comparator: 'equals',
          operator: 'and',
          values: [config.publicationId]
        }]
      }

      this.publicationId = config.publicationId

      window.history.replaceState({}, null, this.$router.resolve({ name: 'publication-details', params: { publicationId: config.publicationId } }).href)

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
    if (this.$route.params.publicationId) {
      this.publicationId = this.$route.params.publicationId

      this.onPublicationSelected({
        publicationId: this.publicationId
      })
    }
  }
}
</script>

<style>

</style>
