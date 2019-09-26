<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="germplasmAttributeTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <span slot="attributeType" slot-scope="props" v-if="props.row.attributeType">
        <i :class="'mdi mdi-18px fix-alignment ' + dataTypes[props.row.attributeType].icon" :style="`color: ${dataTypes[props.row.attributeType].color()};`"/>
        <span> {{ dataTypes[props.row.attributeType].text() }}</span>
      </span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'GermplasmAttributeTable',
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
      name: 'germplasmId',
      type: Number
    }, {
      name: 'germplasmGid',
      type: String
    }, {
      name: 'germplasmName',
      type: String
    }, {
      name: 'attributeName',
      type: String
    }, {
      name: 'attributeDescription',
      type: String
    }, {
      name: 'attributeType',
      type: 'dataType'
    }, {
      name: 'attributeValue',
      type: String
    }]

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'germplasmId',
        tableName: 'germplasmAttributes',
        sortable: ['germplasmId', 'germplasmGid', 'germplasmName', 'attributeName', 'attributeDescription', 'attributeType', 'attributeValue'],
        filterable: [],
        headings: {
          germplasmId: () => this.$t('tableColumnAttributeGermplasmId'),
          germplasmGid: () => this.$t('tableColumnAttributeGermplasmGid'),
          germplasmName: () => this.$t('tableColumnAttributeGermplasmName'),
          attributeName: () => this.$t('tableColumnAttributeName'),
          attributeDescription: () => this.$t('tableColumnAttributeDescription'),
          attributeType: () => this.$t('tableColumnAttributeDataType'),
          attributeValue: () => this.$t('tableColumnAttributeValue')
        },
        columnsClasses: {
          germplasmId: 'text-right'
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
      this.$refs.germplasmAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
