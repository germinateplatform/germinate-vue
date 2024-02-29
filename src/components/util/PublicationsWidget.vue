<template>
  <div>
    <div v-if="loading">
      <b-spinner variant="primary" type="grow" />
    </div>
    <div v-else>
      <div v-if="publicationsOnPage && publicationsOnPage.length > 0">
        <b-row>
          <b-col cols=12 sm=6 md=4 xl=3 class="mb-3" v-for="p in publicationsOnPage" :key="`publication-${p.publicationDoi}`">
            <PublicationCard :publication="p" @deleteReference="deleteReference" />
          </b-col>
        </b-row>
        <b-pagination v-model="page" :total-rows="publications.length" :per-page="itemsPerPage" v-if="publications.length > itemsPerPage" />
      </div>

      <h5 v-else>{{ $t('headingNoData') }}</h5>

      <b-button v-b-modal.add-publication-modal v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)"><MdiIcon :path="mdiPlusBox" /> {{ $t('buttonAddPublication') }}</b-button>

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
        <b-button variant="primary" @click="getPublication" :disabled="!newPublication.doi || newPublication.loading"><MdiIcon :path="mdiChevronDoubleDown" /> {{ $t('buttonUpdate') }} <b-spinner small v-if="newPublication.loading" /></b-button>

        <p v-html="newPublication.html" v-if="newPublication.html" />
      </b-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PublicationCard from '@/components/util/PublicationCard'
import MdiIcon from '@/components/icons/MdiIcon'

import { apiGetPublications, apiPutPublication, apiPutPublicationReference, apiDeletePublicationReference } from '@/mixins/api/misc'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

import { mdiChevronDoubleDown, mdiPlusBox } from '@mdi/js'

const { Cite } = require('@citation-js/core')
require('@citation-js/plugin-doi')
require('@citation-js/plugin-csl')

export default {
  components: {
    MdiIcon,
    PublicationCard
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    publicationsOnPage: function () {
      const startIndex = Math.min(this.publications.length, (this.page - 1) * this.itemsPerPage)
      const endIndex = Math.min(this.publications.length, startIndex + this.itemsPerPage)

      return this.publications.slice(startIndex, endIndex)
    }
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
      mdiChevronDoubleDown,
      mdiPlusBox,
      loading: true,
      publications: [],
      page: 1,
      itemsPerPage: 8,
      newPublication: {
        doi: null,
        html: null,
        errorMessage: null,
        loading: false,
        date: null
      },
      USER_TYPE_DATA_CURATOR
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
  methods: {
    userIsAtLeast,
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
            apiDeletePublicationReference(p.publicationId, this.referenceType, this.referencingId, () => this.update())
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
    onSubmit: function () {
      apiPutPublication({
        doi: this.newPublication.doi,
        fallbackCache: this.newPublication.json,
        createdOn: this.newPublication.date
      }, publicationId => {
        apiPutPublicationReference(publicationId, {
          publicationId: publicationId,
          referenceType: this.referenceType,
          foreignId: this.referencingId
        }, () => {
          this.$refs.addPublicationModal.hide()
          this.update()
        })
      })
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

      apiGetPublications(this.referenceType, this.referencingId, result => {
        this.publications = result

        this.$emit('publication-count-changed', result.length)

        this.loading = false
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
</style>
