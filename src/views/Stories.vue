<template>
  <div v-if="visible">
    <h1>{{ $t('pageStoriesTitle') }}</h1>
    <hr />
    <p>{{ $t('pageStoriesText') }}</p>

    <DataStoryWidget @story-count-changed="updateVisibility" />
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
  },
  methods: {
    updateVisibility: function (count) {
      this.visible = count > 0
    }
  }
}
</script>

<style>

</style>
