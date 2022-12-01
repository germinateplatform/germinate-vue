<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="traitId"
               v-bind="$props"
               ref="traitTable"
               v-on="$listeners">
      <!-- Trait id link -->
      <template v-slot:cell(traitId)="data">
        <router-link :to="{ name: Pages.traitDetails, params: { traitId: data.item.traitId } }">{{ data.item.traitId }}</router-link>
      </template>
      <!-- Trait name link -->
      <template v-slot:cell(traitName)="data">
        <router-link :to="{ name: Pages.traitDetails, params: { traitId: data.item.traitId } }">{{ data.item.traitName }}</router-link>
      </template>
      <!-- Trait short name link -->
      <template v-slot:cell(traitNameShort)="data">
        <router-link :to="{ name: Pages.traitDetails, params: { traitId: data.item.traitId } }">{{ data.item.traitNameShort }}</router-link>
      </template>
      <!-- Trait description link -->
      <template v-slot:cell(traitDescription)="data">
        <router-link :to="{ name: Pages.traitDetails, params: { traitId: data.item.traitId } }">{{ data.item.traitDescription }}</router-link>
      </template>
      <!-- Dataset type icon -->
      <template v-slot:cell(dataType)="data">
        <span class="text-nowrap"><span :style="`color: ${dataTypes[data.item.dataType].color()};`"><MdiIcon :path="dataTypes[data.item.dataType].path" /></span> {{ dataTypes[data.item.dataType].text() }}</span>
      </template>
      <!-- Dataset ids -->
      <template v-slot:cell(datasetIds)="data">
        <span v-if="data.item.datasetIds">{{ data.item.datasetIds.length }}</span>
      </template>
      <template v-slot:cell(traitRestrictions)="data">
        <div v-if="data.item.traitRestrictions">
          <span :id="`trait-restrictions-${data.item.traitId}`" class="text-primary"><MdiIcon :path="mdiCodeBrackets" /></span>
          <b-tooltip :target="`trait-restrictions-${data.item.traitId}`">
            <div class="text-left">
              <div v-if="data.item.traitRestrictions.min !== undefined && data.item.traitRestrictions.min !== null"><MdiIcon :path="mdiGreaterThanOrEqual" /> {{ data.item.traitRestrictions.min }}</div>
              <div v-if="data.item.traitRestrictions.max !== undefined && data.item.traitRestrictions.max !== null"><MdiIcon :path="mdiLessThanOrEqual" /> {{ data.item.traitRestrictions.max }}</div>
              <div v-if="data.item.traitRestrictions.categories"><MdiIcon :path="mdiCodeBrackets" /> {{ data.item.traitRestrictions.categories.map(c => c.join(', ')).join(', ') }}</div>
            </div>
          </b-tooltip>
        </div>
      </template>
      <!-- Synonyms -->
      <template v-slot:cell(synonyms)="data">
        <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
      </template>
      <!-- Edit trait -->
      <template v-slot:cell(edit)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onTraitEditClicked(data.item)" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" v-b-tooltip.hover :title="$t('tableTooltipTraitEdit')">
          <MdiIcon :path="mdiSquareEditOutline" />
        </a>
      </template>
    </BaseTable>

    <!-- Trait state modal -->
    <TraitEditModal :trait="trait" v-if="trait && storeToken && userIsAtLeast(storeToken.userType, 'Administrator')" @changed="refresh" ref="traitEditModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import TraitEditModal from '@/components/modals/TraitEditModal'
import defaultProps from '@/const/table-props.js'
import { dataTypes } from '@/mixins/types.js'
import { userIsAtLeast } from '@/mixins/api/auth'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

import { mdiCodeBrackets, mdiGreaterThanOrEqual, mdiLessThanOrEqual, mdiSquareEditOutline } from '@mdi/js'

export default {
  name: 'TraitTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.IDS,
    selectionMode: {
      type: String,
      default: 'multi'
    }
  },
  data: function () {
    return {
      Pages,
      dataTypes,
      mdiCodeBrackets,
      mdiGreaterThanOrEqual,
      mdiLessThanOrEqual,
      mdiSquareEditOutline,
      options: {
        idColumn: 'traitId',
        tableName: 'traits'
      },
      trait: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      const result = [
        {
          key: 'traitId',
          type: Number,
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnTraitId')
        }, {
          key: 'traitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitName'),
          preferredSortingColumn: true
        }, {
          key: 'traitNameShort',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitNameShort')
        }, {
          key: 'traitDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitDescription')
        }, {
          key: 'dataType',
          type: 'dataType',
          sortable: true,
          label: this.$t('tableColumnTraitDataType')
        }, {
          key: 'traitRestrictions',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnTraitConstraints')
        }, {
          key: 'synonyms',
          type: 'json',
          sortable: true,
          label: this.$t('tableColumnTraitSynonyms')
        }, {
          key: 'unitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitUnitName')
        }, {
          key: 'unitDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitUnitDescription')
        }, {
          key: 'unitAbbreviation',
          type: String,
          sortable: true,
          label: this.$t('tableColumnTraitUnitAbbreviation')
        }, {
          key: 'datasetIds',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnTraitNrDataset')
        }, {
          key: 'count',
          type: Number,
          class: 'text-right',
          sortable: true,
          label: this.$t('tableColumnTraitDataPoints'),
          formatter: value => getNumberWithSuffix(value, 2)
        }
      ]

      if (this.storeToken && userIsAtLeast(this.storeToken.userType, 'Data Curator')) {
        result.push({
          key: 'edit',
          type: undefined,
          sortable: false,
          label: ''
        })
      }

      if (this.selectionMode === 'multi') {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'bg-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    BaseTable,
    MdiIcon,
    TraitEditModal
  },
  methods: {
    userIsAtLeast,
    refresh: function () {
      this.$refs.traitTable.refresh()
    },
    onTraitEditClicked: function (trait) {
      this.trait = trait

      this.$nextTick(() => this.$refs.traitEditModal.show())
    }
  }
}
</script>

<style>
</style>
