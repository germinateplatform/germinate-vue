<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="entityTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <router-link slot="entityParentId" slot-scope="props" :to="'/data/germplasm/' + props.row.entityParentId">{{ props.row.entityParentId }}</router-link>
      <router-link slot="entityParentGid" slot-scope="props" :to="'/data/germplasm/' + props.row.entityParentId">{{ props.row.entityParentGid }}</router-link>
      <router-link slot="entityParentName" slot-scope="props" :to="'/data/germplasm/' + props.row.entityParentId">{{ props.row.entityParentName }}</router-link>
      <router-link slot="entityChildId" slot-scope="props" :to="'/data/germplasm/' + props.row.entityChildId">{{ props.row.entityChildId }}</router-link>
      <router-link slot="entityChildGid" slot-scope="props" :to="'/data/germplasm/' + props.row.entityChildId">{{ props.row.entityChildGid }}</router-link>
      <router-link slot="entityChildName" slot-scope="props" :to="'/data/germplasm/' + props.row.entityChildId">{{ props.row.entityChildName }}</router-link>
      <span slot="entityParentType" slot-scope="props" class="text-nowrap" v-if="props.row.entityParentType"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityParentType].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityParentType].color()};`" /> {{ entityTypes[props.row.entityParentType].text() }}</span>
      <span slot="entityChildType" slot-scope="props" class="text-nowrap" v-if="props.row.entityChildType"><i :class="`mdi mdi-18px ${entityTypes[props.row.entityChildType].icon} fix-alignment`" :style="`color: ${entityTypes[props.row.entityChildType].color()};`" /> {{ entityTypes[props.row.entityChildType].text() }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'EntityTable',
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
      name: 'entityParentId',
      type: Number
    }, {
      name: 'entityParentGid',
      type: String
    }, {
      name: 'entityParentName',
      type: String
    }, {
      name: 'entityParentType',
      type: 'entityType'
    }, {
      name: 'entityChildId',
      type: Number
    }, {
      name: 'entityChildGid',
      type: String
    }, {
      name: 'entityChildName',
      type: String
    }, {
      name: 'entityChildType',
      type: 'entityType'
    }]

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'entityParentId',
        tableName: 'entities',
        sortable: ['entityParentId', 'entityParentGid', 'entityParentName', 'entityParentType', 'entityChildId', 'entityChildGid', 'entityChildName', 'entityChildType'],
        filterable: [],
        headings: {
          entityParentId: () => this.$t('tableColumnEntityParentId'),
          entityParentGid: () => this.$t('tableColumnEntityParentGid'),
          entityParentName: () => this.$t('tableColumnEntityParentName'),
          entityParentType: () => this.$t('tableColumnEntityParentType'),
          entityChildId: () => this.$t('tableColumnEntityChildId'),
          entityChildGid: () => this.$t('tableColumnEntityChildGid'),
          entityChildName: () => this.$t('tableColumnEntityChildName'),
          entityChildType: () => this.$t('tableColumnEntityChildType')
        },
        columnsClasses: {
          entityChildId: 'text-right',
          entityParentId: 'text-right'
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
      this.$refs.entityTable.refresh()
    }
  }
}
</script>

<style>
</style>
