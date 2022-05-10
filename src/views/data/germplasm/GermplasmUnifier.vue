<template>
  <div>
    <h1>{{ $t('pageGermplasmUnifierTitle') }}</h1>
    <p v-html="$t('pageGermplasmUnifierText')" />

    <GermplasmTable :selectable="true" :getData="getData" :getIds="getIds" v-on:selection-changed="updateButtonState" ref="germplasmTable" />

    <b-button class="my-3" variant="primary" @click="getSelectedGermplasm" :disabled="!selectedIds || selectedIds.length < 2"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('buttonNext') }}</b-button>

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

      <b-button class="my-3" @click="mergeGermplasm"> <MdiIcon :path="mdiSetMerge"/> {{ $t('buttonMerge') }}</b-button>
    </div>

    <b-card :title="$t('pageGermplasmUnifierSgoneImportTitle')" :sub-title="$t('pageGermplasmUnifierSgoneImportText')">
      <b-form @submit.prevent="onSubmit" class="sgone-form">
        <b-form-group :label="$t('formLabelGermplasmUnifierSgoneInput')" label-for="sgone-input">
          <template #description>
            <span v-html="$t('pageGermplasmUnifierSgoneLink')" />
          </template>
          <b-form-textarea id="sgone-input" v-model="sgoneInput" />
          <b-form-file accept="application/json" v-model="sgoneFile" />
        </b-form-group>
      </b-form>

      <b-button class="my-3" :disabled="!sgoneInput" @click="mergeGermplasmSgone"> <MdiIcon :path="mdiSetMerge"/> {{ $t('buttonMerge') }}</b-button>
    </b-card>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import GermplasmTable from '@/components/tables/GermplasmTable'

import germplasmApi from '@/mixins/api/germplasm.js'

import { mdiArrowRightBox, mdiSetMerge } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    GermplasmTable,
    MdiIcon
  },
  data: function () {
    return {
      mdiArrowRightBox,
      mdiSetMerge,
      selectedIds: [],
      primaryGermplasm: null,
      selectedGermplasm: null,
      comment: null,
      sgoneFile: null,
      sgoneInput: null
    }
  },
  mixins: [germplasmApi],
  watch: {
    sgoneFile: function (newValue) {
      const reader = new FileReader()
      reader.onload = event => {
        this.sgoneInput = event.target.result
      }
      reader.readAsText(newValue)
    }
  },
  methods: {
    mergeGermplasmSgone: function () {
      emitter.emit('show-loading', true)
      this.apiPostGermplasmUnificationSgone({
        unifications: JSON.parse(this.sgoneInput)
      }, () => {
        this.$refs.germplasmTable.refresh()
        this.reset()
        emitter.emit('show-loading', false)
      })
    },
    mergeGermplasm: function () {
      emitter.emit('show-loading', true)
      const others = this.selectedIds.filter(id => id !== this.primaryGermplasm)
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

<style scoped>
.sgone-form textarea {
  border-bottom: 0;
}
</style>
