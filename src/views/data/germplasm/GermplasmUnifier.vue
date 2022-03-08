<template>
  <div>
    <h1>{{ $t('pageGermplasmUnifierTitle') }}</h1>
    <p v-html="$t('pageGermplasmUnifierText')" />

    <GermplasmTable :selectable="true" :getData="getData" :getIds="getIds" v-on:selection-changed="updateButtonState" ref="germplasmTable" />

    <b-button class="my-3" variant="primary" @click="getSelectedGermplasm" :disabled="!selectedIds || selectedIds.length < 2"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment" /> {{ $t('buttonNext') }}</b-button>

    <div v-if="selectedGermplasm">
      <h2>{{ $t('pageGermplasmUnifierSelectPreferedTitle') }}</h2>
      <p>{{ $t('pageGermplasmUnifierSelectPreferedText') }}</p>
      <b-list-group>
        <b-list-group-item v-for="germplasm in selectedGermplasm" :key="`germplasm-${germplasm.germplasmId}`" href="#" @click="primaryGermplasm = germplasm.germplasmId" :active="germplasm.germplasmId === primaryGermplasm">
          {{ germplasm.germplasmId }} - {{ germplasm.germplasmName }}
        </b-list-group-item>
      </b-list-group>

      <h3 class="mt-3">{{ $t('pageGermplasmUnifierExplanationTitle') }}</h3>
      <p>{{ $t('pageGermplasmUnifierExplanationText') }}</p>
      <b-textarea v-model="comment" />

      <b-button class="my-3" @click="mergeGermplasm"> <i class="mdi mdi-18px fix-alignment mdi-set-merge"/> {{ $t('buttonMerge') }}</b-button>
    </div>
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'

import germplasmApi from '@/mixins/api/germplasm.js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    GermplasmTable
  },
  data: function () {
    return {
      selectedIds: [],
      primaryGermplasm: null,
      selectedGermplasm: null,
      comment: null
    }
  },
  mixins: [ germplasmApi ],
  methods: {
    mergeGermplasm: function () {
      emitter.emit('show-loading', true)
      const others = this.selectedIds.filter(id => id != this.primaryGermplasm)
      this.apiPostGermplasmUnification({
        preferredGermplasmId: this.primaryGermplasm,
        otherGermplasmIds: others,
        explanation: this.comment
      }, () => {
        this.$refs.germplasmTable.refresh()
        this.reset()
        emitter.emit('show-loading', false)
      })
    },
    getSelectedGermplasm: function () {
      this.apiPostGermplasmTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'germplasmId',
          operator: 'and',
          comparator: 'inSet',
          values: this.selectedIds
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.selectedGermplasm = result.data
          this.primaryGermplasm = result.data[0].germplasmId
        } else {
          this.selectedGermplasm = []
          this.primaryGermplasm = null
        }
      })
    },
    updateButtonState: function (selectedIds) {
      this.reset()
      this.selectedIds = selectedIds
    },
    reset: function () {
      this.primaryGermplasm = null
      this.selectedGermplasm = null
      this.selectedIds = []
      this.comment = null
    },
    getData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    }
  }
}
</script>

<style>

</style>