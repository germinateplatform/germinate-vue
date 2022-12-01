<template>
  <div>
    <h1>{{ $t('pageUserFeedbackTitle') }}</h1>
    <hr />
    <p v-html="$t('pageUserFeedbackText')" />
    <UserFeedbackTable :getData="getData" ref="imageTable" />
  </div>
</template>

<script>
import UserFeedbackTable from '@/components/tables/UserFeedbackTable'

import { apiPostUserFeedbackTable } from '@/mixins/api/misc'

export default {
  components: {
    UserFeedbackTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostUserFeedbackTable(data, callback)
    }
  }
}
</script>

<style>

</style>
