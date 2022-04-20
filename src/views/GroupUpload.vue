<template>
  <div>
    <h1>{{ $t('pageGroupUploadTitle') }}</h1>
    <p>{{ $t('pageGroupUploadText') }}</p>
    <!-- Show Germplasm sent from CurlyWhirly -->
    <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import germplasmApi from '@/mixins/api/germplasm'

export default {
  data: function () {
    return {
      file: null
    }
  },
  components: {
    GermplasmTable
  },
  mixins: [germplasmApi],
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
