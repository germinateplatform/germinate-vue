<template>
  <div v-if="visible">
    <h1>{{ $t('pageStoriesTitle') }}</h1>
    <hr />
    <p>{{ $t('pageStoriesText') }}</p>

    <DataStoryWidget @no-stories-found="visible = false" />
  </div>
</template>

<script>
import DataStoryWidget from '@/components/util/DataStoryWidget'

export default {
  data: function () {
    return {
      visible: true
    }
  },
  components: {
    DataStoryWidget
  }
}
</script>

<style>

</style>
