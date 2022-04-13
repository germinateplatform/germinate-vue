<template>
  <div v-if="newsItem">
    <h1>{{ newsItem.newsTitle }}</h1>
    <hr />
    <div v-html="newsItem.newsContent" />
  </div>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      newsId: null,
      newsItem: null
    }
  },
  mixins: [miscApi],
  mounted: function () {
    this.newsId = this.$route.params.newsId

    if (this.newsId) {
      const request = {
        filter: [{
          column: 'newsId',
          comparator: 'equals',
          operator: 'and',
          values: [this.newsId]
        }]
      }
      this.apiPostNewsTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.newsItem = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
