<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="pedigreeTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'PedigreeTable',
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
      name: 'parentId',
      type: Number
    }, {
      name: 'parentGid',
      type: String
    }, {
      name: 'parentName',
      type: String
    }, {
      name: 'childId',
      type: Number
    }, {
      name: 'childGid',
      type: String
    }, {
      name: 'childName',
      type: String
    }, {
      name: 'relationshipType',
      type: String
    }, {
      name: 'relationshipDescription',
      type: String
    }, {
      name: 'pedigreeDescription',
      type: String
    }, {
      name: 'pedigreeAuthor',
      type: String
    }]

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'parentId',
        tableName: 'pedigrees',
        sortable: ['parentId', 'parentGid', 'parentName', 'childId', 'childGid', 'childName', 'relationshipType', 'relationshipDescription', 'pedigreeDescription', 'pedigreeAuthor'],
        filterable: [],
        headings: {
          parentId: () => this.$t('tableColumnPedigreeParentId'),
          parentGid: () => this.$t('tableColumnPedigreeParentGid'),
          parentName: () => this.$t('tableColumnPedigreeParentName'),
          childId: () => this.$t('tableColumnPedigreeChildId'),
          childGid: () => this.$t('tableColumnPedigreeChildGid'),
          childName: () => this.$t('tableColumnPedigreeChildName'),
          relationshipType: () => this.$t('tableColumnPedigreeRelationshipType'),
          relationshipDescription: () => this.$t('tableColumnPedigreeRelationshipDescription'),
          pedigreeDescription: () => this.$t('tableColumnPedigreeDescription'),
          pedigreeAuthor: () => this.$t('tableColumnPedigreeAuthor')
        },
        columnsClasses: {
          parentId: 'text-right',
          childId: 'text-right'
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
      this.$refs.pedigreeTable.refresh()
    }
  }
}
</script>

<style>
</style>
