<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               primary-key="compoundId"
               v-bind="$props"
               ref="compoundTable"
               v-on="$listeners">
      <!-- Compound id link -->
      <template v-slot:cell(compoundId)="data">
        <router-link :to="{ name: Pages.compoundDetails, params: { compoundId: data.item.compoundId } }">{{ data.item.compoundId }}</router-link>
      </template>
      <!-- Compound name link -->
      <template v-slot:cell(compoundName)="data">
        <router-link :to="{ name: Pages.compoundDetails, params: { compoundId: data.item.compoundId } }">{{ data.item.compoundName }}</router-link>
      </template>
      <!-- Compound description link -->
      <template v-slot:cell(compoundDescription)="data">
        <router-link :to="{ name: Pages.compoundDetails, params: { compoundId: data.item.compoundId } }">{{ data.item.compoundDescription }}</router-link>
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
import { getNumberWithSuffix } from '@/mixins/formatting'
import { Pages } from '@/mixins/pages'

export default {
  name: 'CompoundTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      Pages,
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
        class: 'text-right',
        sortable: true,
        label: this.$t('tableColumnCompoundId')
      }, {
        key: 'compoundName',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCompoundName'),
        preferedSortingColumn: true
      }, {
        key: 'compoundDescription',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCompoundDescription')
      }, {
        key: 'synonyms',
        type: 'json',
        sortable: true,
        label: this.$t('tableColumnCompoundSynonyms')
      }, {
        key: 'unitName',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitName')
      }, {
        key: 'unitDescription',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitDescription')
      }, {
        key: 'unitAbbreviation',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCompoundUnitAbbreviation')
      }, {
        key: 'count',
        type: Number,
        class: 'text-right',
        sortable: true,
        label: this.$t('tableColumnCompoundDataPoints'),
        formatter: value => getNumberWithSuffix(value, 2)
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
