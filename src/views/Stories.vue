<template>
  <div>
    <h1>{{ $t('pageStoriesTitle') }}</h1>
    <hr />
    <p>{{ $t('pageStoriesText') }}</p>

    <DataStoryWidget />
  </div>
</template>

<script>
import DataStoryWidget from '@/components/util/DataStoryWidget'

export default {
  components: {
    DataStoryWidget
  }
}
</script>

<style>

</style>
