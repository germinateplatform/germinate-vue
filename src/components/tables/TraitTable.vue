<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="traitTable"
               v-on="$listeners">
      <template v-slot:cell(traitId)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitId }}</router-link>
      </template>
      <template v-slot:cell(traitName)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitName }}</router-link>
      </template>
      <template v-slot:cell(traitNameShort)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitNameShort }}</router-link>
      </template>
      <template v-slot:cell(traitDescription)="data">
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.traitId } }">{{ data.item.traitDescription }}</router-link>
      </template>
      <template v-slot:cell(synonyms)="data">
        <span v-if="data.item.synonyms">{{ data.item.synonyms.join(', ') }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

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
          label: this.$t('tableColumnTraitName')
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
  methods: {
    refresh: function () {
      this.$refs.traitTable.refresh()
    }
  }
}
</script>

<style>
</style>
