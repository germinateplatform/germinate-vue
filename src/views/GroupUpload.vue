<template>
  <div>
    <h1>{{ $t('pageGroupUploadTitle') }}</h1>
    <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'

export default {
  data: function () {
    return {
      file: null
    }
  },
  components: {
    GermplasmTable
  },
  methods: {
    getGermplasmData: function (query, callback) {
      return this.apiPostGermplasmTableCW(query, this.file, callback)
    },
    getGermplasmIds: function (query, callback) {
      return this.apiPostGermplasmTableCWIds(query, this.file, callback)
    }
  },
  created: function () {
    this.file = this.$route.params.file
  }
}
</script>

<style>

</style>
