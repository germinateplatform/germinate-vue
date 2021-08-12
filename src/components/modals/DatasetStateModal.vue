<template>
  <b-modal :ref="`datasetStateModal-${id}`" :title="$t('modalTitleDatasetState')" ok-only :ok-title="$t('buttonUpdate')" @ok="updateState">
    <b-form-select :options="options" v-model="selectedState" />
  </b-modal>
</template>

<script>
import datasetApi from '@/mixins/api/dataset.js'
import typesMixin from '@/mixins/types.js'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4(),
      selectedState: null
    }
  },
  computed: {
    options: function () {
      return Object.keys(this.datasetStates).map(s => {
        return {
          value: this.datasetStates[s].id,
          text: this.datasetStates[s].text()
        }
      })
    }
  },
  mixins: [ datasetApi, typesMixin ],
  methods: {
    show: function () {
      this.selectedState = this.datasetStates[this.dataset.datasetState].id
      this.$refs['datasetStateModal-' + this.id].show()
    },
    updateState: function () {
      return this.apiPatchDatasetState(this.dataset.datasetId, this.selectedState, (result) => {
        if (result) {
          this.$emit('changed')
        }
      })
    }
  }
}
</script>

<style>

</style>
