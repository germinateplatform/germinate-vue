<template>
  <VueTypeaheadBootstrap :id="id"
                         v-model="userInput"
                         :data="germplasm"
                         :serializer="getDisplayName"
                         @hit="notifyParent($event)"
                         :placeholder="$t('inputPlaceholderGermplasmNameAutocomplete')" />
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
import { apiPostTrialGermplasm } from '@/mixins/api/trait.js'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { debounce } from '@/plugins/debounce'

export default {
  components: {
    VueTypeaheadBootstrap
  },
  props: {
    id: {
      type: String,
      default: null
    },
    datasetIds: {
      type: Array,
      default: () => []
    },
    isGermplasm: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      userInput: null,
      germplasm: []
    }
  },
  watch: {
    userInput: debounce(function (newValue) {
      const query = {
        filter: [{
          column: 'germplasmName',
          comparator: 'contains',
          operator: 'and',
          values: [newValue]
        }],
        page: 1,
        ascending: 1,
        orderBy: 'germplasmName',
        limit: MAX_JAVA_INTEGER
      }

      if (this.datasetIds) {
        query.filter.push({
          column: 'datasetId',
          comparator: 'inSet',
          operator: 'and',
          values: this.datasetIds
        })
      }

      apiPostTrialGermplasm(query, this.isGermplasm, result => {
        // Resolve the result
        this.germplasm = result.data
      })
    }, 500)
  },
  methods: {
    getDisplayName: function (item) {
      return this.$t('dropdownLabelGermplasmSearch', {
        germplasmId: item.germplasmId,
        trialsetupId: item.trialsetupId,
        germplasm: item.germplasmName,
        rep: item.rep || 'N/A',
        row: item.trialRow || 'N/A',
        column: item.trialColumn || 'N/A',
        block: item.block || 'N/A'
      })
    },
    notifyParent: function (germplasm) {
      if (germplasm) {
        this.$emit('germplasm-selected', {
          germplasmId: germplasm.germplasmId,
          trialsetupId: germplasm.trialsetupId,
          germplasm: germplasm.germplasmName,
          rep: germplasm.rep,
          row: germplasm.trialRow,
          column: germplasm.trialColumn,
          block: germplasm.block || 'N/A'
        })
        this.userInput = null
      }
    }
  }
}
</script>

<style>

</style>
