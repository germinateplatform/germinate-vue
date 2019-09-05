<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmText')" />
    <GermplasmTable :filterOn="filterOn" :getData="getData" :getIds="getIds" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'

export default {
  data: function () {
    return {
      filterOn: [{
        column: {
          name: 'entityTypeName',
          type: 'entityType'
        },
        comparator: 'equals',
        operator: 'and',
        values: ['Accession']
      }]
    }
  },
  components: {
    GermplasmTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    }
  },
  mounted: function () {
    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpGermplasm')
  }
}
</script>

<style>
</style>
