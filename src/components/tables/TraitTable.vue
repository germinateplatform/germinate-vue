<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               ref="traitTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <!-- LINKS -->
      <span slot="synonyms" slot-scope="props" v-if="props.row.synonyms">{{ props.row.synonyms.join(', ') }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'TraitTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {}
    }
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
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'traitId',
        tableName: 'traits',
        filterOn: this.filterOn,
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
