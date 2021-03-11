<template>
  <div class="mb-3">
    <b-button v-b-toggle.collapse-datasets>{{ $t('widgetSelectedDatasetsTitle') }}</b-button>
    <b-collapse id="collapse-datasets" class="mt-3">
      <b-row v-if="datasets && datasets.length > 0">
        <!-- For each dataset -->
        <b-col cols=12 sm=4 xl=2 v-for="(dataset, index) in datasets" :key="`datasets-overview-${index}`">
          <IndividualDatasetWidget :dataset="dataset" />
        </b-col>
      </b-row>
    </b-collapse>
  </div>
</template>

<script>
import IndividualDatasetWidget from '@/components/export/IndividualDatasetWidget'

export default {
  components: {
    IndividualDatasetWidget
  },
  props: {
    datasets: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
</style>
