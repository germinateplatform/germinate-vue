<template>
  <GermplasmTable :filterOn="filterOn" />
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
  }
}
</script>

<style>
</style>
