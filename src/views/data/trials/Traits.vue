<template>
  <div>
    <h1>{{ $t('pageTraitsTitle') }}</h1>
    <TraitTable :getData="getData" :getIds="selectionMode === 'multi' ? getIds : null" :selectionMode="selectionMode" v-on:selection-changed="updateButtonState" ref="traitTable" />

    <template v-if="storeToken && userIsAtLeast(storeToken.userType, 'Administrator')">
      <Collapse :visible="false" :title="$t('pageTraitsUnifierTitle')" :showLoading="false" @toggle="unifierExpanded = !unifierExpanded" ref="traitCollapse">
        <template v-slot:content>
          <p>{{ $t('pageTraitsUnifierText') }}</p>
          <b-button class="my-3" variant="primary" @click="getSelectedTrait" :disabled="!selectedIds || selectedIds.length < 2"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('buttonNext') }}</b-button>

          <div v-if="selectedTraits">
            <h2>{{ $t('pageTraitsUnifierSelectPreferedTitle') }}</h2>
            <p>{{ $t('pageTraitsUnifierSelectPreferedText') }}</p>
            <b-list-group>
              <b-list-group-item v-for="trait in selectedTraits" :key="`trait-${trait.traitId}`" href="#" @click="primaryTrait = trait.traitId" :active="trait.traitId === primaryTrait">
                {{ trait.traitId }} - {{ trait.traitName }}
              </b-list-group-item>
            </b-list-group>

            <b-button class="my-3" @click="mergeTrait"> <MdiIcon :path="mdiSetMerge" /> {{ $t('buttonMerge') }}</b-button>
          </div>
        </template>
      </Collapse>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import Collapse from '@/components/util/Collapse'
import TraitTable from '@/components/tables/TraitTable'
import traitApi from '@/mixins/api/trait.js'
import authApi from '@/mixins/api/auth'

import { mdiArrowRightBox, mdiSetMerge } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    Collapse,
    MdiIcon,
    TraitTable
  },
  data: function () {
    return {
      mdiArrowRightBox,
      mdiSetMerge,
      unifierExpanded: false,
      selectedTraits: null,
      primaryTrait: null,
      selectedIds: []
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    selectionMode: function () {
      return this.unifierExpanded ? 'multi' : null
    }
  },
  mixins: [traitApi, authApi],
  methods: {
    getData: function (data, callback) {
      return this.apiPostTraitTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostTraitTableIds(data, callback)
    },
    updateButtonState: function (selectedIds) {
      this.reset()
      this.selectedIds = selectedIds
    },
    reset: function () {
      this.primaryTrait = null
      this.selectedTraits = null
      this.selectedIds = []
    },
    getSelectedTrait: function () {
      this.apiPostTraitTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'traitId',
          operator: 'and',
          comparator: 'inSet',
          values: this.selectedIds
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.selectedTraits = result.data
          this.primaryTrait = result.data[0].traitId
        } else {
          this.selectedTraits = []
          this.primaryTrait = null
        }
      })
    },
    mergeTrait: function () {
      emitter.emit('show-loading', true)
      const others = this.selectedIds.filter(id => id !== this.primaryTrait)
      this.apiPostTraitUnification({
        preferredTraitId: this.primaryTrait,
        otherTraitIds: others
      }, () => {
        this.$refs.traitTable.refresh()
        this.reset()
        this.$refs.traitCollapse.toggle()
        emitter.emit('show-loading', false)
      })
    }
  }
}
</script>

<style>

</style>
