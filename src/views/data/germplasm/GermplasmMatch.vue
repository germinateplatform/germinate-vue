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

    <div v-if="resultVisible">
      <p v-if="searchTerms && searchTerms.length > 0 && germplasm && germplasm.length > 0">
        {{ $t('pageGermplasmMatchSearchCount', { search: searchTerms.length, result: germplasm.length } ) }}
      </p>

      <b-row>
        <b-col cols="12" md="6">
          <b-form-group :label="$t('formLabelGermplasmMatchNotFound')" :description="$t('formDescriptionGermplasmMatchNotFound')" label-for="notfound">
            <div class="d-flex align-items-stretch">
              <b-form-textarea ref="numbers" class="row-numbers" :style="{ minWidth: `${rowNumberDigits}em` }" :value="notFoundNumbers" :cols="rowNumberDigits" readonly />
              <b-form-textarea ref="notFound" class="flex-grow-1" :value="notFoundText" id="notfound" :rows="10" />
            </div>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6">
          <b-form-group :label="$t('formLabelGermplasmMatchDistinctNotFound')" :description="$t('formDescriptionGermplasmMatchDistinctNotFound')" label-for="distinctNotFound">
            <b-form-textarea :value="distinctNotFound" id="distinctNotFound" :rows="10" />
          </b-form-group>
        </b-col>
      </b-row>

      <h2>{{ $t('pageGermplasmMatchMatchesTitle') }}</h2>
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
        const set = new Set(this.germplasm.map(g => g.germplasmName))

        const input = this.search.split(/\r?\n/).map(s => s.trim())

        return input.map((s, i) => {
          return {
            value: s,
            line: i + 1
          }
        }).filter(s => !set.has(s.value))
      } else {
        return null
      }
    },
    notFoundNumbers: function () {
      if (this.notFound) {
        return this.notFound.map(n => n.line).join('\n')
      } else {
        return ''
      }
    },
    distinctNotFound: function () {
      if (this.notFound) {
        const set = new Set(this.notFound.filter(s => s.value).map(s => s.value.trim()))

        return [...set].join('\n')
      } else {
        return ''
      }
    },
    rowNumberDigits: function () {
      return `${(this.notFound || [{ value: 'a', line: 1 }])[0].line}`.length + 1
    },
    notFoundText: function () {
      if (this.notFound) {
        return this.notFound.map(n => n.value).join('\n')
      } else {
        return ''
      }
    },
    resultVisible: function () {
      return this.filterOn && this.filterOn.length > 0
    }
  },
  watch: {
    resultVisible: function (newValue) {
      this.$nextTick(() => {
        if (newValue) {
          this.$refs.notFound.$el.addEventListener('scroll', this.scrollHandle)
        } else {
          this.$refs.notFound.$el.removeEventListener('scroll', this.scrollHandle)
        }
      })
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
    },
    scrollHandle: function () {
      console.log('scroll')
      this.$refs.numbers.$el.scrollTop = this.$refs.notFound.$el.scrollTop
    }
  }
}
</script>

<style scoped>
.row-numbers {
  width: auto;
  font-family: monospace;
  resize: none;
  text-align: end;
  color: gray;
  overflow: hidden;
}
</style>
