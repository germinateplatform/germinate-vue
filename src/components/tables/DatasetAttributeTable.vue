<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="datasetAttributeTable"
               v-on="$listeners">
      <span slot="attributeType" slot-scope="props" v-if="props.row.attributeType">
        <i :class="'mdi mdi-18px fix-alignment ' + dataTypes[props.row.attributeType].icon" :style="`color: ${dataTypes[props.row.attributeType].color()};`"/>
        <span> {{ dataTypes[props.row.attributeType].text() }}</span>
      </span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'datasetAttributeTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    var columns = [{
      name: 'datasetId',
      type: undefined
    }, {
      name: 'datasetName',
      type: undefined
    }, {
      name: 'datasetDescription',
      type: undefined
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
        idColumn: 'datasetId',
        tableName: 'datasetAttributes',
        sortable: ['datasetId', 'datasetName', 'datasetDescription', 'attributeName', 'attributeDescription', 'attributeType', 'attributeValue'],
        filterable: [],
        headings: {
          datasetId: () => this.$t('tableColumnAttributeDatasetId'),
          datasetName: () => this.$t('tableColumnAttributeDatasetName'),
          datasetDescription: () => this.$t('tableColumnAttributeDatasetDescription'),
          attributeName: () => this.$t('tableColumnAttributeName'),
          attributeDescription: () => this.$t('tableColumnAttributeDescription'),
          attributeType: () => this.$t('tableColumnAttributeDataType'),
          attributeValue: () => this.$t('tableColumnAttributeValue')
        },
        columnsClasses: {
          datasetId: 'text-right'
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
      this.$refs.datasetAttributeTable.refresh()
    }
  }
}
</script>

<style>
</style>
