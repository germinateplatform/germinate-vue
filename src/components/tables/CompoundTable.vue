<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="compoundTable"
               v-on="$listeners">
      <!-- Compound id link -->
      <template v-slot:cell(compoundId)="data">
        <router-link :to="{ name: 'compound-details', params: { compoundId: data.item.compoundId } }">{{ data.item.compoundId }}</router-link>
      </template>
      <!-- Compound name link -->
      <template v-slot:cell(compoundName)="data">
        <router-link :to="{ name: 'compound-details', params: { compoundId: data.item.compoundId } }">{{ data.item.compoundName }}</router-link>
      </template>
      <!-- Compound description link -->
      <template v-slot:cell(compoundDescription)="data">
        <router-link :to="{ name: 'compound-details', params: { compoundId: data.item.compoundId } }">{{ data.item.compoundDescription }}</router-link>
      </template>
      <!-- Compound synonyms -->
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
  name: 'CompoundTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      options: {
        idColumn: 'compoundId',
        tableName: 'compounds'
      }
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'compoundId',
        type: Number,
        class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'compoundId')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundId')
      }, {
        key: 'compoundName',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'compoundName')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundName')
      }, {
        key: 'compoundDescription',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'compoundDescription')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundDescription')
      }, {
        key: 'synonyms',
        type: 'json',
        class: `${this.isTableColumnHidden(this.options.tableName, 'synonyms')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundSynonyms')
      }, {
        key: 'unitName',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'unitName')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitName')
      }, {
        key: 'unitDescription',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'unitDescription')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitDescription')
      }, {
        key: 'unitAbbreviation',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'unitAbbreviation')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitAbbreviation')
      }, {
        key: 'count',
        type: Number,
        class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
        sortable: true,
        label: this.$t('tableColumnCompoundDataPoints'),
        formatter: this.$options.filters.toThousandSeparators
      }]
    }
  },
  components: {
    BaseTable
  },
  methods: {
    refresh: function () {
      this.$refs.compoundTable.refresh()
    }
  }
}
</script>

<style>
</style>
