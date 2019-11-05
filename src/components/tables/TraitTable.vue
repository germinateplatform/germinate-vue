<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="traitTable"
               v-on="$listeners">
      <!-- LINKS -->
      <router-link slot="traitId" slot-scope="props" :to="{ name: 'trait-details', params: { traitId: props.row.traitId } }">{{ props.row.traitId }}</router-link>
      <router-link slot="traitName" slot-scope="props" :to="{ name: 'trait-details', params: { traitId: props.row.traitId } }">{{ props.row.traitName }}</router-link>
      <router-link slot="traitNameShort" slot-scope="props" :to="{ name: 'trait-details', params: { traitId: props.row.traitId } }">{{ props.row.traitNameShort }}</router-link>
      <router-link slot="traitDescription" slot-scope="props" :to="{ name: 'trait-details', params: { traitId: props.row.traitId } }">{{ props.row.traitDescription }}</router-link>
      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
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
    var columns = [{
      name: 'traitId',
      type: Number
    }, {
      name: 'traitName',
      type: String
    }, {
      name: 'traitNameShort',
      type: String
    }, {
      name: 'traitDescription',
      type: String
    }, {
      name: 'synonyms',
      type: 'json'
    }, {
      name: 'unitName',
      type: String
    }, {
      name: 'unitDescription',
      type: String
    }, {
      name: 'unitAbbreviation',
      type: String
    }, {
      name: 'count',
      type: Number
    }]

    return {
      options: {
        idColumn: 'traitId',
        tableName: 'traits',
        sortable: ['traitId', 'traitName', 'traitNameShort', 'traitDescription', 'unitName', 'unitDescription', 'unitAbbreviation', 'synonyms', 'count'],
        filterable: [],
        headings: {
          selected: '',
          traitId: () => this.$t('tableColumnTraitId'),
          traitName: () => this.$t('tableColumnTraitName'),
          traitNameShort: () => this.$t('tableColumnTraitNameShort'),
          traitDescription: () => this.$t('tableColumnTraitDescription'),
          unitName: () => this.$t('tableColumnTraitUnitName'),
          unitDescription: () => this.$t('tableColumnTraitUnitDescription'),
          unitAbbreviation: () => this.$t('tableColumnTraitUnitAbbreviation'),
          synonyms: () => this.$t('tableColumnTraitSynonyms'),
          count: () => this.$t('tableColumnTraitDataPoints')
        },
        columnsClasses: {
          traitId: 'text-right',
          count: 'text-right'
        }
      },
      columns: columns
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
