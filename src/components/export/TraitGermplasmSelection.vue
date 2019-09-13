<template>
  <b-row>
    <b-col cols=12 md=6 v-if="traits && traits.length > 0">
      <b-form-select multiple v-model="selectedTraits" :options="traitOptions" :select-size=10 />
    </b-col>
    <b-col cols=12 md=6>
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    return {
      traits: [],
      selectedTraits: [],
      traitOptions: []
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateTraits()
    }
  },
  methods: {
    updateTraits: function () {
      this.apiPostDatasetTraits(this.datasetIds, result => {
        this.traits = result
        this.traitOptions = []
        this.traits.forEach(t => {
          var traitName = t.traitName

          if (t.unitAbbreviation) {
            traitName += ` [${t.unitAbbreviation}]`
          }

          this.traitOptions.push({
            value: t,
            text: traitName
          })
        })
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateTraits()
    }
  }
}
</script>

<style>

</style>
