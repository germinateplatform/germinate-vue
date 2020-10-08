<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="traitTable"
               v-on="$listeners">
      <!-- Trait id link -->
      <template v-slot:cell(traitId)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitId }}</router-link>
      </template>
      <!-- Trait name link -->
      <template v-slot:cell(traitName)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitName }}</router-link>
      </template>
      <!-- Trait short name link -->
      <template v-slot:cell(traitNameShort)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitNameShort }}</router-link>
      </template>
      <!-- Trait description link -->
      <template v-slot:cell(traitDescription)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitDescription }}</router-link>
      </template>
      <!-- Dataset type icon -->
      <template v-slot:cell(dataType)="data">
        <span class="text-nowrap"><i :class="`mdi mdi-18px ${dataTypes[data.item.dataType].icon} fix-alignment`" :style="`color: ${dataTypes[data.item.dataType].color()};`" /> {{ dataTypes[data.item.dataType].text() }}</span>
      </template>
      <template v-slot:cell(traitRestrictions)="data">
        <div v-if="data.item.traitRestrictions">
          <span :id="`trait-restrictions-${data.item.traitId}`"><i class="mdi mdi-18px mdi-code-brackets text-primary" /></span>
          <b-tooltip :target="`trait-restrictions-${data.item.traitId}`">
            <div class="text-left">
              <div v-if="data.item.traitRestrictions.min !== undefined && data.item.traitRestrictions.min !== null"><i class="mdi mdi-greater-than-or-equal" /> {{ data.item.traitRestrictions.min }}</div>
              <div v-if="data.item.traitRestrictions.max !== undefined && data.item.traitRestrictions.max !== null"><i class="mdi mdi-less-than-or-equal" /> {{ data.item.traitRestrictions.max }}</div>
              <div v-if="data.item.traitRestrictions.categories"><i class="mdi mdi-code-brackets" /> {{ data.item.traitRestrictions.categories.map(c => c.join(', ')).join(', ') }}</div>
            </div>
          </b-tooltip>
        </div>
      </template>
      <!-- Synonyms -->
      <template v-slot:cell(synonyms)="data">
        <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import colorMixin from '@/mixins/colors.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'TraitTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      options: {
        idColumn: 'traitId',
        tableName: 'traits'
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'traitId',
          type: Number,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'traitId')}`,
          sortable: true,
          label: this.$t('tableColumnTraitId')
        }, {
          key: 'traitName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitName')}`,
          sortable: true,
          label: this.$t('tableColumnTraitName'),
          preferedSortingColumn: true
        }, {
          key: 'traitNameShort',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitNameShort')}`,
          sortable: true,
          label: this.$t('tableColumnTraitNameShort')
        }, {
          key: 'traitDescription',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitDescription')}`,
          sortable: true,
          label: this.$t('tableColumnTraitDescription')
        }, {
          key: 'dataType',
          type: 'dataType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'dataType')}`,
          label: this.$t('tableColumnTraitDataType')
        }, {
          key: 'traitRestrictions',
          type: undefined,
          class: `${this.isTableColumnHidden(this.options.tableName, 'traitRestrictions')}`,
          sortable: false,
          label: this.$t('tableColumnTraitConstraints')
        }, {
          key: 'synonyms',
          type: 'json',
          class: `${this.isTableColumnHidden(this.options.tableName, 'synonyms')}`,
          sortable: true,
          label: this.$t('tableColumnTraitSynonyms')
        }, {
          key: 'unitName',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitName')}`,
          sortable: true,
          label: this.$t('tableColumnTraitUnitName')
        }, {
          key: 'unitDescription',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitDescription')}`,
          sortable: true,
          label: this.$t('tableColumnTraitUnitDescription')
        }, {
          key: 'unitAbbreviation',
          type: String,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitAbbreviation')}`,
          sortable: true,
          label: this.$t('tableColumnTraitUnitAbbreviation')
        }, {
          key: 'count',
          type: Number,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
          sortable: true,
          label: this.$t('tableColumnTraitDataPoints'),
          formatter: this.$options.filters.toThousandSeparators
        }
      ]
    }
  },
  components: {
    BaseTable
  },
  mixins: [ colorMixin, typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.traitTable.refresh()
    }
  }
}
</script>

<style>
</style>
