<template>
  <div>
    <h1>{{ $t('pageGermplasmMatchTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmMatchText')" />

    <b-form @submit.prevent="refresh">
      <b-form-group :label="$t('formLabelGermplasmMatchSearch')" :description="$t('formDescriptionGermplasmMatchSearch')" label-for="germplasmmatch">
        <b-form-textarea v-model="search" id="germplasmmatch" :rows="10" />
      </b-form-group>
    </b-form>

    <b-button @click="refresh" variant="primary" class="mb-3"><MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}</b-button>

    <div v-if="filterOn && filterOn.length > 0">
      <p v-if="searchTerms && searchTerms.length > 0 && germplasm && germplasm.length > 0">
        {{ $t('pageGermplasmMatchSearchCount', { search: searchTerms.length, result: germplasm.length } ) }}
      </p>

      <b-form-group :label="$t('formLabelGermplasmMatchNotFound')" :description="$t('formDescriptionGermplasmMatchNotFound')" label-for="notfound">
        <b-form-textarea :value="notFound" id="notfound" :rows="10" />
      </b-form-group>

      <!-- Table showing all germplasm matches -->
      <GermplasmTable showAllItems :getData="getData" :getIds="getIds" :downloadTable="downloadFunction" ref="germplasmTable" />
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import GermplasmTable from '@/components/tables/GermplasmTable'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'

import { mdiRefresh } from '@mdi/js'

export default {
  components: {
    GermplasmTable,
    MdiIcon
  },
  data: function () {
    return {
      mdiRefresh,
      filterOn: [],
      search: null,
      searchTerms: [],
      germplasm: []
    }
  },
  computed: {
    downloadFunction: function () {
      return this.downloadTable
    },
    notFound: function () {
      if (this.germplasm && this.germplasm.length > 0 && this.searchTerms && this.searchTerms.length > 0) {
        const set = new Set(this.searchTerms)

        this.germplasm.forEach(g => set.delete(g.germplasmName))

        return [...set].join('\n')
      } else {
        return null
      }
    }
  },
  methods: {
    refresh: function () {
      if (this.search) {
        const set = new Set(this.search.split(/\r?\n/).filter(s => s).map(s => s.trim()))
        this.searchTerms = [...set]

        this.filterOn = [{
          column: 'germplasmName',
          comparator: 'inSet',
          operator: 'and',
          values: this.searchTerms
        }]

        this.$nextTick(() => this.$refs.germplasmTable.refresh())
      } else {
        this.searchTerms = []
        this.filterOn = []
      }
    },
    resetFilter: function (update) {
      if (update.filter.length === 0) {
        this.filterOn = []
      }
    },
    adjustFilter: function (data) {
      const copy = JSON.parse(JSON.stringify(data))
      if (copy.filter) {
        copy.filter = this.filterOn.concat(copy.filter)
      } else {
        copy.filter = this.filterOn.concat()
      }
      return copy
    },
    downloadTable: function (data, callback) {
      const copy = this.adjustFilter(data)
      return apiPostTableExport({ filter: copy.filter }, 'germplasm', callback)
    },
    getData: function (data, callback) {
      this.germplasm = []

      const copy = this.adjustFilter(data)

      copy.page = 1
      copy.limit = MAX_JAVA_INTEGER
      return new Promise((resolve, reject) => {
        apiPostGermplasmTable(copy, callback)
          .then(r => {
            if (r.data && r.data.data) {
              this.germplasm = JSON.parse(JSON.stringify(r.data.data))
            } else {
              this.germplasm = []
            }
            resolve(r)
          })
          .catch(e => reject(e))
      })
    },
    getIds: function (data, callback) {
      const copy = this.adjustFilter(data)
      return apiPostGermplasmTableIds(copy, callback)
    },
    onDownloadTableClicked: function () {
      this.$refs.germplasmTable.onDownloadTableClicked()
    }
  }
}
</script>

<style>

</style>
