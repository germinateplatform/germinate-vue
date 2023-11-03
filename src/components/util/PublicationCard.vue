<template>
  <b-card no-body bg-variant="light" class="h-100" body-class="d-flex flex-column" v-if="displayData">
    <b-card-body>
      <b-card-title v-html="displayData.title"></b-card-title>
      <b-card-sub-title>{{ displayData['container-title'] }}</b-card-sub-title>
      <b-card-text v-if="displayData && displayData.issued && displayData.issued['date-parts'] && displayData.issued['date-parts'].length > 0 && displayData.issued['date-parts'][0].length > 0">
        {{ displayData.issued['date-parts'][0][0] }}
      </b-card-text>
      <b-card-text class="mb-0 mt-auto limit-rows">
        <span v-html="displayData.fullReference" />
      </b-card-text>
      <div class="mb-3"><b-badge class="cursor-hover" @click="showFullReference">
        <MdiIcon :path="mdiDotsHorizontal" /></b-badge>
      </div>
    </b-card-body>

    <b-card-footer class="d-flex justify-content-between">
      <b-button variant="primary" :href="displayData.URL" rel="noopener noreferrer" v-if="displayData.URL">
        <MdiIcon :path="mdiOpenInNew" /> {{ $t('buttonReadMore') }}
      </b-button>
      <b-button v-if="canDelete && storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" @click="$emit('deleteReference', publication)" variant="danger">
        <MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}
      </b-button>
    </b-card-footer>

    <ReferenceModal :publication="publication" ref="referenceModal" />
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

import ReferenceModal from '@/components/modals/ReferenceModal'
import MdiIcon from '@/components/icons/MdiIcon'

import { userIsAtLeast } from '@/mixins/api/auth'

import { mdiDelete, mdiOpenInNew, mdiDotsHorizontal } from '@mdi/js'

const { Cite } = require('@citation-js/core')
require('@citation-js/plugin-doi')
require('@citation-js/plugin-csl')

export default {
  components: {
    MdiIcon,
    ReferenceModal
  },
  props: {
    publication: {
      type: Object,
      default: () => {}
    },
    canDelete: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      mdiDelete,
      mdiOpenInNew,
      mdiDotsHorizontal
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    displayData: function () {
      if (this.publication) {
        let result

        if (this.publication.publicationFallbackCache) {
          result = this.getFromCache()
        } else {
          try {
            const citation = Cite.async(this.publication.publicationDoi.trim())
            if (citation && citation.data && citation.data.length > 0) {
              result = citation.format('data', { format: 'object' })[0]
              result.fullReference = citation.format('bibliography', { format: 'html', template: 'apa' })
            } else {
              result = this.getFromCache()
            }
          } catch (err) {
            result = this.getFromCache()
          }
        }
        return result
      } else {
        return null
      }
    }
  },
  methods: {
    userIsAtLeast,
    showFullReference: function () {
      this.$refs.referenceModal.show()
    },
    getFromCache: function () {
      try {
        const citation = new Cite(this.publication.publicationFallbackCache)

        if (citation && citation.data && citation.data.length > 0) {
          const result = citation.format('data', { format: 'object' })[0]
          result.fullReference = citation.format('bibliography', { format: 'html', template: 'apa' })
          return result
        } else {
          return {
            title: 'N/A',
            fullReference: 'N/A',
            URL: this.publication.publicationDoi
          }
        }
      } catch (err) {
        return {
          title: 'N/A',
          fullReference: 'N/A',
          URL: this.publication.publicationDoi
        }
      }
    }
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
