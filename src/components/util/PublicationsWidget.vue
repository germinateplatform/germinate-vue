<template>
  <div>
    <div v-if="loading">
      <b-spinner variant="primary" type="grow" />
    </div>
    <div v-else>
      <b-row v-if="publications && publications.length > 0">
        <b-col cols=12 sm=6 md=4 xl=3 v-for="p in publications" :key="`publication-${p.publicationDoi}`">
          <b-card :title="p.displayData.title" :sub-title="p.displayData['container-title']" bg-variant="light">
            <p v-if="p.displayData && p.displayData.issued && p.displayData.issued['date-parts'] && p.displayData.issued['date-parts'].length > 0 && p.displayData.issued['date-parts'][0].length > 0">
              {{ p.displayData.issued['date-parts'][0][0] }}
            </p>
            <p class="mb-0 limit-rows">
              <span v-html="p.displayData.fullReference" />
            </p>
            <div class="mb-3"><b-badge class="cursor-hover" @click="showFullReference(p)"><i class="mdi mdi-dots-horizontal" /></b-badge></div>
            <b-button :href="p.displayData.URL" class="mr-2" target="_blank" rel="noopener noreferrer" v-if="p.displayData.URL"><i class="mdi mdi-open-in-new" /> {{ $t('buttonReadMore') }}</b-button>

            <b-button variant="danger" @click="deleteReference(p)" v-if="token && userIsAtLeast(token.userType, 'Data Curator')"><i class="mdi mdi-delete" /> {{ $t('buttonDelete') }}</b-button>
          </b-card>
        </b-col>
      </b-row>
      <h5 v-else>{{ $t('headingNoData') }}</h5>

      <b-button v-b-modal.add-publication-modal v-if="token && userIsAtLeast(token.userType, 'Data Curator')"><i class="mdi mdi-18px mdi-plus-box" /> {{ $t('buttonAddPublication') }}</b-button>

      <ReferenceModal :publication="selectedPublication" ref="referenceModal" />

      <b-modal id="add-publication-modal"
              ref="addPublicationModal"
              :title="$t('modalTitlePublicationAddNew')"
              :ok-title="$t('buttonSubmit')"
              :ok-disabled="!newPublication.html"
              @ok.prevent="onSubmit"
              @show="resetForm">
        <b-form-group :label="$t('formLabelPublicationDOI')" label-for="doi">
          <b-form-input id="doi" v-model="newPublication.doi" :state="!newPublication.errorMessage"/>
          <b-form-invalid-feedback id="input-live-feedback">
            {{ newPublication.errorMessage }}
          </b-form-invalid-feedback>
        </b-form-group>
        <b-button variant="primary" @click="getPublication" :disabled="!newPublication.doi || newPublication.loading"><i class="mdi mdi-18px mdi-chevron-double-down" /> {{ $t('buttonUpdate') }} <b-spinner small v-if="newPublication.loading" /></b-button>

        <p v-html="newPublication.html" v-if="newPublication.html" />
      </b-modal>
    </div>
  </div>
</template>

<script>
import ReferenceModal from '@/components/modals/ReferenceModal'

import miscApi from '@/mixins/api/misc.js'

const Cite = require('citation-js')

export default {
  components: {
    ReferenceModal
  },
  props: {
    referenceType: {
      type: String,
      default: 'database'
    },
    referencingId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      loading: true,
      publications: [],
      selectedPublication: null,
      newPublication: {
        doi: null,
        html: null,
        errorMessage: null,
        loading: false,
        date: null
      }
    }
  },
  watch: {
    referenceType: function () {
      this.update()
    },
    referencingId: function () {
      this.update()
    }
  },
  mixins: [miscApi],
  methods: {
    resetForm: function () {
      this.newPublication = {
        doi: null,
        html: null,
        errorMessage: null,
        loading: false,
        date: null
      }
    },
    deleteReference: function (p) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeletePublicationReference(p.publicationId, p.referenceType, this.referencingId, () => this.update())
          }
        })
    },
    getPublication: function () {
      this.newPublication.html = null
      this.newPublication.json = null
      this.newPublication.errorMessage = null
      this.newPublication.loading = true
      this.newPublication.date = null

      Cite.async(this.newPublication.doi.trim())
        .then(result => {
          this.newPublication.json = JSON.stringify(result.data[0])
          this.newPublication.html = result.format('bibliography', { format: 'html', template: 'apa' })

          if (result.data[0].created && result.data[0].created['date-time']) {
            this.newPublication.date = new Date(result.data[0].created['date-time'])
          }
        })
        .catch(error => {
          this.newPublication.errorMessage = error.message
        })
        .finally(() => {
          this.newPublication.loading = false
        })
    },
    showFullReference: function (p) {
      this.selectedPublication = p.displayData
      this.$refs.referenceModal.show()
    },
    onSubmit: function () {
      this.apiPutPublication({
        doi: this.newPublication.doi,
        fallbackCache: this.newPublication.json,
        createdOn: this.newPublication.date
      }, publicationId => {
        this.apiPutPublicationReference(publicationId, {
          publicationId: publicationId,
          referenceType: this.referenceType,
          foreignId: this.referencingId
        }, () => {
          this.$refs.addPublicationModal.hide()
          this.update()
        })
      })
    },
    getFromCache: function (p) {
      const result = p
      try {
        const citation = new Cite(JSON.parse(p.publicationFallbackCache))

        if (citation && citation.data && citation.data.length > 0) {
          result.displayData = citation.format('data', { format: 'object' })[0]
          result.displayData.fullReference = citation.format('bibliography', { format: 'html', template: 'apa' })
        }
      } catch (err) {
        result.displayData = {
          title: 'N/A',
          fullReference: 'N/A',
          URL: result.publicationDoi
        }
      }
      return result
    },
    update: function () {
      this.loading = true
      const filter = [{
        column: 'referenceType',
        operator: 'and',
        comparator: 'equals',
        values: [this.referenceType]
      }]

      if (this.referencingId !== undefined && this.referencingId !== null) {
        filter.push({
          column: 'referencingIds',
          operator: 'and',
          comparator: 'arrayContains',
          values: [this.referencingId]
        })
      }

      this.apiPostPublicationsTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: filter,
        orderBy: 'createdOn',
        ascending: 0
      }, result => {
        let pubs = result.data

        pubs = pubs.map(p => {
          let result = p
          try {
            const citation = Cite.async(p.publicationDoi.trim())
            if (citation && citation.data && citation.data.length > 0) {
              p.displayData = citation.format('data', { format: 'object' })[0]
              p.displayData.fullReference = citation.format('bibliography', { format: 'html', template: 'apa' })
            } else {
              result = this.getFromCache(p)
            }
          } catch (err) {
            result = this.getFromCache(p)
          }
          return result
        })

        this.publications = pubs

        this.$emit('publication-count-changed', pubs.length)

        this.loading = false
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style scoped>
.cursor-hover:hover {
  cursor: pointer;
}
.limit-rows {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
}
</style>
