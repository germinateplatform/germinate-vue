<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="compoundTable"
               v-on="$listeners">
      <!-- LINKS -->
      <router-link slot="compoundId" slot-scope="props" :to="{ name: 'compound-details', params: { compoundId: props.row.compoundId } }">{{ props.row.compoundId }}</router-link>
      <router-link slot="compoundName" slot-scope="props" :to="{ name: 'compound-details', params: { compoundId: props.row.compoundId } }">{{ props.row.compoundName }}</router-link>
      <router-link slot="compoundDescription" slot-scope="props" :to="{ name: 'compound-details', params: { compoundId: props.row.compoundId } }">{{ props.row.compoundDescription }}</router-link>
      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
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
    var columns = [{
      name: 'compoundId',
      type: Number
    }, {
      name: 'compoundName',
      type: String
    }, {
      name: 'compoundDescription',
      type: String
    }, {
      name: 'synonyms',
      type: String
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
        idColumn: 'compoundId',
        tableName: 'compounds',
        sortable: ['compoundId', 'compoundName', 'compoundDescription', 'unitName', 'unitDescription', 'unitAbbreviation', 'synonyms', 'count'],
        filterable: [],
        headings: {
          selected: '',
          compoundId: () => this.$t('tableColumnCompoundId'),
          compoundName: () => this.$t('tableColumnCompoundName'),
          compoundDescription: () => this.$t('tableColumnCompoundDescription'),
          unitName: () => this.$t('tableColumnCompoundUnitName'),
          unitDescription: () => this.$t('tableColumnCompoundUnitDescription'),
          unitAbbreviation: () => this.$t('tableColumnCompoundUnitAbbreviation'),
          synonyms: () => this.$t('tableColumnCompoundSynonyms'),
          count: () => this.$t('tableColumnCompoundDataPoints')
        },
        columnsClasses: {
          compoundId: 'text-right',
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
      this.$refs.compoundTable.refresh()
    }
  }
}
</script>

<style>
</style>
