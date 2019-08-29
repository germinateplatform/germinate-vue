<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <p v-html="$t('pageGermplasmText')" />
    <GermplasmTable :filterOn="filterOn" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'

export default {
  data: function () {
    return {
      filterOn: [{
        column: 'entitytypename',
        comparator: 'equals',
        operator: 'or',
        values: ['Accession']
      }]
    }
  },
  components: {
    GermplasmTable
  },
  mounted: function () {
    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpGermplasm')
  }
}
</script>

<style>
</style>
