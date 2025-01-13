<template>
  <div>
    <h1>{{ $t('pageTraitsTitle') }}</h1>

    <TraitCategories v-on:category-selected="categoryClicked" ref="categories" />

    <TraitTable :getData="getData" :getIds="selectionMode === 'multi' ? getIds : null" :filterOn="filterOn" :selectionMode="selectionMode" v-on:selection-changed="updateButtonState" v-on:filter-changed="onFilterChanged" ref="traitTable" />

    <template v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_ADMINISTRATOR)">
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
import TraitCategories from '@/components/util/TraitCategories'
import { apiPostTraitTable, apiPostTraitTableIds, apiPostTraitUnification } from '@/mixins/api/trait'
import { userIsAtLeast, USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

import { mdiArrowRightBox, mdiSetMerge } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    Collapse,
    MdiIcon,
    TraitTable,
    TraitCategories
  },
  data: function () {
    return {
      mdiArrowRightBox,
      mdiSetMerge,
      unifierExpanded: false,
      selectedTraits: null,
      primaryTrait: null,
      selectedIds: [],
      USER_TYPE_ADMINISTRATOR,
      filterOn: null,
      category: null
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
  watch: {
    category: function (newValue) {
      // Filter based on selected tag
      if (!newValue) {
        this.filterOn = []
      } else {
        this.filterOn = [{
          column: {
            name: 'categoryName',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue.name]
        }]
      }
    }
  },
  methods: {
    userIsAtLeast,
    onFilterChanged: function (filter) {
      if (filter === null || filter.filter == null || filter.filter.length === 0) {
        this.$refs.categories.selectCategory(null)
      }
    },
    categoryClicked: function (category) {
      this.category = category
      this.$nextTick(() => this.$refs.traitTable.refresh())
    },
    getData: function (data, callback) {
      return apiPostTraitTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostTraitTableIds(data, callback)
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
      apiPostTraitTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
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
      apiPostTraitUnification({
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
